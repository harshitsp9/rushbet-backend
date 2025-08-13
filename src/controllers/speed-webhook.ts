import { sleep, verifyHookdeckSignature } from '@/helper/commonHelper';
import { addOrUpdateDepositRecord, addOrUpdateWithdrawRecord } from '@/helper/firebaseHelper';
import { depositHelperFn, withdrawHelperFn } from '@/helper/paymentHelper';
import { asyncHandler } from '@/middleware/async-middleware';
import BalanceModel from '@/models/balance/balance.model';
import WithdrawModel from '@/models/withdraw/withdraw.model';
import { WithdrawDocument } from '@/models/withdraw/withdraw.type';
import { PAYMENT_STATUS } from '@/types/enums/enums.common';
import { PaymentEvent, PaymentMetadata } from '@/types/types/event.type';
import { generateObjectId } from '@/utils/commonUtils';
import { errorResponse, HTTP_STATUS_CODES, successResponse } from '@/utils/responseUtils';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

export const receivePaymentStatus = asyncHandler(async (req: Request, res: Response) => {
  const MAX_RETRIES = 5; // Number of retry attempts
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    const time = Date.now();
    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction(); // Start the transaction

    try {
      if (!verifyHookdeckSignature(req)) {
        return errorResponse(res, 'Invalid signature', HTTP_STATUS_CODES.FORBIDDEN, {});
      }
      const eventObj: Partial<PaymentEvent> = req.body;
      const paymentStatus = eventObj.data?.object.status;

      const metaData = eventObj.data?.object.metadata;

      if (paymentStatus === PAYMENT_STATUS.PAID) {
        // Process deposit payment
        const { isProcessDone, depositRecord, userId, message } = await depositHelperFn(session, eventObj);

        if (isProcessDone) {
          // This will handle pending and confirmed events both.
          addOrUpdateDepositRecord(userId, depositRecord.sourceId, {
            status: depositRecord.status,
            depositSourceId: depositRecord.sourceId,
            amount: Number(depositRecord.amount),
            paymentMethod: depositRecord.depositMethod,
          });
        }
        await session.commitTransaction();
        return successResponse(res, message, HTTP_STATUS_CODES.CREATED, {});
      } else if (paymentStatus === PAYMENT_STATUS.EXPIRED || paymentStatus === PAYMENT_STATUS.CANCELLED) {
        // NOTE: The 'cancelled' event is never triggered in our flow
        // because we create a single payment that supports multiple methods (lightning, ethereum, on-chain, tron).
        addOrUpdateDepositRecord(metaData?.userId as string, eventObj.id as string, {
          status: paymentStatus,
        });
        return successResponse(res, 'Payment status updated successfully.', HTTP_STATUS_CODES.CREATED, {});
      }
      throw new Error('Invalid payment status');
    } catch (error: any) {
      // Rollback the transaction in case of error
      await session.abortTransaction();

      const transientErrors = [
        'Write conflict',
        'Pending deposit record not found', // This will may happen when paid and confirmed events are triggered same time
      ];

      // Check if the error is due to a write conflict or missing pending deposit record,
      // which can happen when paid and confirmed events are triggered simultaneously
      if (transientErrors.some((msg) => error.message.includes(msg)) && attempts < MAX_RETRIES - 1) {
        attempts++; // Retry transaction
        const delay = Math.pow(2, attempts) * 100; // Exponential backoff

        console.warn(`Retrying bet event... Attempt ${attempts} req time: ${time}`);
        await sleep(delay);

        continue; // Retry loop
      }

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

    if (!withdrawRecord) throw new Error('Withdraw record not found with given user id');

    //create metadata
    const metaData: Omit<PaymentMetadata, 'depositAddressId'> = {
      withdrawId: withdrawRecord._id as string,
      userId: String(withdrawRecord.userId),
      type: 'withdraw',
    };

    if (eventObj.data?.object.status === 'paid') {
      //do operation in our db
      await withdrawHelperFn(metaData as PaymentMetadata, session, eventObj);
    } else if (eventObj.data?.object.status === 'failed') {
      const refundAmount = eventObj.data.object.amount || 0;
      await BalanceModel.findOneAndUpdate(
        { userId: generateObjectId(metaData.userId) },
        {
          $inc: { availableBalance: refundAmount, withdrawableBalance: refundAmount },
        },
        { session, new: true } // Ensure update happens inside the transaction
      );
    }

    withdrawRecord.status = eventObj.data?.object.status as string;
    await withdrawRecord.save({ session });

    //add fire store record of paid
    addOrUpdateWithdrawRecord(metaData?.userId as string, metaData?.withdrawId as string, {
      status: eventObj.data?.object.status,
      amount: eventObj.data?.object.amount,
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
