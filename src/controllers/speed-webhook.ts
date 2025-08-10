import { verifyHookdeckSignature } from '@/helper/commonHelper';
import { addOrUpdateDepositRecord, addOrUpdateWithdrawRecord } from '@/helper/firebaseHelper';
import { depositHelperFn, failedOrExpiredPaymentHelper, withdrawHelperFn } from '@/helper/paymentHelper';
import { asyncHandler } from '@/middleware/async-middleware';
import BalanceModel from '@/models/balance/balance.model';
import WithdrawModel from '@/models/withdraw/withdraw.model';
import { WithdrawDocument } from '@/models/withdraw/withdraw.type';
import { PaymentEvent, PaymentMetadata } from '@/types/types/event.type';
import { generateObjectId } from '@/utils/commonUtils';
import { errorResponse, HTTP_STATUS_CODES, successResponse } from '@/utils/responseUtils';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

export const receivePaymentStatus = asyncHandler(async (req: Request, res: Response) => {
  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction(); // Start the transaction

  try {
    if (!verifyHookdeckSignature(req)) {
      return errorResponse(res, 'Invalid signature', HTTP_STATUS_CODES.FORBIDDEN, {});
    }
    const eventObj: Partial<PaymentEvent> = req.body;

    const metaData = eventObj.data?.object.metadata;

    if (eventObj.data?.object.status === 'paid') {
      //do operation in our db
      await depositHelperFn(metaData as PaymentMetadata, session, eventObj);
    } else if (eventObj.data?.object.status === 'expired' || eventObj.data?.object.status === 'cancelled') {
      await failedOrExpiredPaymentHelper(metaData as PaymentMetadata, eventObj, session);
    }
    addOrUpdateDepositRecord(metaData?.userId as string, metaData?.depositId as string, {
      status: eventObj.data?.object.status,
    });
    await session.commitTransaction();

    return successResponse(res, 'Payment status updated successfully.', HTTP_STATUS_CODES.CREATED, {});
  } catch (error) {
    // Rollback the transaction in case of error
    await session.abortTransaction();
    return errorResponse(
      res,
      (error as unknown as Error)?.message || 'Error while listing payment.paid event msg',
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      error
    );
  } finally {
    // End the session after the transaction
    session.endSession();
  }
});

export const withdrawPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction(); // Start the transaction

  try {
    if (!verifyHookdeckSignature(req)) {
      return errorResponse(res, 'Invalid signature', HTTP_STATUS_CODES.FORBIDDEN, {});
    }
    const eventObj: Partial<PaymentEvent> = req.body;

    //find withdraw record
    const withdrawRecord = (await WithdrawModel.findOne({
      sourceId: eventObj.data?.object.id,
    }).session(session)) as unknown as WithdrawDocument;

    if (!withdrawRecord) throw new Error('Withdraw record not found with given game and user id');

    //create metadata
    const metaData: Omit<PaymentMetadata, 'depositId'> = {
      withdrawId: withdrawRecord._id as string,
      userId: String(withdrawRecord.userId),
      gameId: String(withdrawRecord.gameId),
      type: 'withdraw',
    };

    if (eventObj.data?.object.status === 'paid') {
      //do operation in our db
      await withdrawHelperFn(metaData as PaymentMetadata, session, eventObj);
    } else if (eventObj.data?.object.status === 'failed') {
      const refundAmount = eventObj.data.object.amount || 0;
      const data = await BalanceModel.findOneAndUpdate(
        { gameId: generateObjectId(metaData.gameId), userId: generateObjectId(metaData.userId) },
        {
          $inc: { balance: refundAmount },
        },
        { session, new: true } // Ensure update happens inside the transaction
      );
      parseFloat((data?.balance || 0).toString());
    }

    withdrawRecord.status = eventObj.data?.object.status as string;
    await withdrawRecord.save({ session });

    //add fire store record of paid
    addOrUpdateWithdrawRecord(metaData?.userId as string, metaData?.withdrawId as string, {
      status: eventObj.data?.object.status,
    });
    await session.commitTransaction();

    return successResponse(res, 'Withdrawal successfully.', HTTP_STATUS_CODES.CREATED, {});
  } catch (error) {
    // Rollback the transaction in case of error
    await session.abortTransaction();
    return errorResponse(
      res,
      (error as unknown as Error)?.message || 'Error while listing withdrawal.paid event msg',
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      error
    );
  } finally {
    // End the session after the transaction
    session.endSession();
  }
});
