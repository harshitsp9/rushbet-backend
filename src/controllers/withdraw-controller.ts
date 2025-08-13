import { callWithdrawalApi } from '@/helper/commonHelper';
import { addOrUpdateWithdrawRecord } from '@/helper/firebaseHelper';
import { asyncHandler } from '@/middleware/async-middleware';
import BalanceModel from '@/models/balance/balance.model';
import WithdrawModel from '@/models/withdraw/withdraw.model';
import { WithdrawApiResponse } from '@/types/types/types.common';
import { formattedBalance, generateObjectId } from '@/utils/commonUtils';
import { errorResponse, HTTP_STATUS_CODES, successResponse } from '@/utils/responseUtils';
import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import { currentDayJsObject } from '@/helper/dateHelper';
import { syncBalanceToFirebase } from '@/helper/balanceHelper';

export const withdrawBalance = asyncHandler(async (req: Request, res: Response) => {
  const { userId, gameId } = req;
  const { targetCurrency = 'SATS', amount, targetAddress } = req.body;
  let { currency = 'usd' } = req.body;
  currency = (currency as string).toLowerCase();

  // Prevent frequent withdrawals (within 5 minutes)
  const fiveMinutesAgo = currentDayJsObject().subtract(5, 'minute').toDate();
  const recentWithdrawal = await WithdrawModel.findOne({
    userId,
    gameId,
    createdAt: { $gte: fiveMinutesAgo },
    status: 'paid',
  }).select('createdAt');

  if (recentWithdrawal) {
    const remainingSeconds = 300 - currentDayJsObject().diff(currentDayJsObject(recentWithdrawal.createdAt), 'second');
    const remainingMinutes = Math.ceil(remainingSeconds / 60);
    return errorResponse(
      res,
      `You can withdraw after 5 minutes of your last withdrawal. Please try again after ${remainingMinutes} minute(s).`,
      HTTP_STATUS_CODES.BAD_REQUEST
    );
  }

  // Validate user balance
  const balanceInfo = await BalanceModel.findOne({ userId, gameId, currency });
  const availableBalance = formattedBalance(balanceInfo?.withdrawableBalance || 0);
  if (amount > availableBalance) {
    return errorResponse(
      res,
      'Insufficient balance: You cannot withdraw more than your available funds.',
      HTTP_STATUS_CODES.BAD_REQUEST
    );
  }

  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction(); // Start the transaction

  try {
    const updatedBalance = await BalanceModel.findByIdAndUpdate(
      balanceInfo?._id,
      {
        $inc: { withdrawableBalance: -amount, availableBalance: -amount },
      },
      { session, new: true } // Ensure update happens inside the transaction
    );

    const balance = formattedBalance(updatedBalance?.withdrawableBalance || 0);

    //create withdraw request
    const withdrawRequest = new WithdrawModel({
      amount,
      currency,
      depositMethod: 'lightning',
      gameId: generateObjectId(gameId),
      userId: generateObjectId(userId),
    });

    const authKey = `Basic ${process.env[`SPEED_AUTH_KEY`]}`;
    const body = {
      amount,
      currency: (currency as string).toUpperCase(),
      target_currency: (targetCurrency as string).toUpperCase(),
      withdraw_method: 'lightning',
      withdraw_request: targetAddress,
    };

    const response: WithdrawApiResponse = await callWithdrawalApi(authKey, body);
    if (!response) {
      await session.abortTransaction();
      return errorResponse(
        res,
        'Something went wrong, please contact our support team',
        HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }

    // Save withdrawal
    withdrawRequest.targetAmount = Types.Decimal128.fromString(response.target_amount.toString());
    withdrawRequest.targetCurrency = response.target_currency as string;
    withdrawRequest.sourceId = response.withdraw_id;
    withdrawRequest.status = response.status;
    //save  withdrawal and transaction
    await withdrawRequest.save({ session });

    // Commit the transaction if no errors
    await session.commitTransaction();

    // Sync balance to Firebase in background (without await)
    if (updatedBalance) {
      syncBalanceToFirebase(userId as string, String(updatedBalance._id), {
        currency: updatedBalance.currency,
        availableBalance: parseFloat(updatedBalance.availableBalance.toString()),
        withdrawableBalance: parseFloat(updatedBalance.withdrawableBalance.toString()),
      });
    }

    successResponse(res, 'Withdrawal request created successfully.', HTTP_STATUS_CODES.OK, {
      withdrawId: withdrawRequest._id,
      amount: response.amount,
      targetAmount: response.target_amount,
      currency: response.currency,
      targetCurrency: response.target_currency,
      balance,
    });

    //fire-store
    addOrUpdateWithdrawRecord(String(userId), withdrawRequest._id as string, {
      status: response?.status || 'pending',
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await session.abortTransaction();
    return errorResponse(
      res,
      'Error while creating withdrawal request',
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      error
    );
  } finally {
    // End the session after the transaction
    session.endSession();
  }
});
