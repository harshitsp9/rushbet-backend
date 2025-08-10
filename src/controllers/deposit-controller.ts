import { callDepositApi } from '@/helper/commonHelper';
import { addOrUpdateDepositRecord } from '@/helper/firebaseHelper';
import { asyncHandler } from '@/middleware/async-middleware';
import DepositModel from '@/models/deposit/deposit.model';
import GamesModel from '@/models/games/games.model';

import { PaymentMetadata } from '@/types/types/event.type';
import { DepositResponse } from '@/types/types/types.common';
import { generateObjectId } from '@/utils/commonUtils';
import { errorResponse, HTTP_STATUS_CODES, successResponse } from '@/utils/responseUtils';
import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';

export const depositBalance = asyncHandler(async (req: Request, res: Response) => {
  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction(); // Start the transaction

  try {
    const { userId, gameId, gameName, provider, userName } = req;
    const { targetCurrency = 'SATS', amount } = req.body;

    const gameData = await GamesModel.findById(gameId).session(session);
    if (!gameData) return errorResponse(res, 'Game does not exist', HTTP_STATUS_CODES.BAD_REQUEST);
    const currency = gameData.defaultCurrency;

    //first create record of deposit
    //create deposit request
    const depositReq = new DepositModel({
      amount,
      depositMethod: 'lightning',
      gameId: generateObjectId(gameId),
      userId: generateObjectId(userId),
      gameName: gameData?.name,
      provider: gameData.provider,
    });

    const metaData: Partial<PaymentMetadata> = {
      userId,
      gameId,
      gameName,
      provider,
      userName,
      depositId: String(depositReq._id),
      type: 'deposit',
    };

    const authKey = `Basic ${process.env[`SPEED_AUTH_KEY`]}`;

    const body = {
      amount,
      currency: (currency as string).toUpperCase(),
      target_currency: (targetCurrency as string).toUpperCase(),
      payment_methods: ['lightning'],
      metadata: metaData,
    };

    const response: DepositResponse = await callDepositApi(authKey, body);
    if (!response)
      return errorResponse(
        res,
        'Something went wrong, please contact our support team',
        HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
      );

    //update records
    depositReq.currency = (response.currency as string).toLowerCase();
    depositReq.targetCurrency = (response.target_currency as string).toLowerCase();
    depositReq.targetAmount = response.target_amount as Types.Decimal128;
    depositReq.sourceId = response.id;
    depositReq.status = response.status;
    depositReq.depositRequest = response.payment_method_options?.lightning?.payment_request;

    await depositReq.save({ session });

    // Commit the transaction if no errors
    await session.commitTransaction();

    successResponse(res, 'Invoice generated successfully.', HTTP_STATUS_CODES.CREATED, {
      lightning: response.payment_method_options?.lightning,
      depositId: depositReq._id,
      currency: response.currency,
      amount: response.amount,
      target_currency: response.target_currency,
      target_amount: response.target_amount,
    });

    addOrUpdateDepositRecord(userId, depositReq._id as string, { status: response.status });
  } catch (error) {
    // Rollback the transaction in case of error
    await session.abortTransaction();
    return errorResponse(res, 'Error while generating invoice', HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, error);
  } finally {
    // End the session after the transaction
    session.endSession();
  }
});
