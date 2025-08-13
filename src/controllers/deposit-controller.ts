import { DEFAULT_CURRENCY, SATS_IN_BTC } from '@/config/constant';
import config from '@/config/envConfig';
import { callDepositApi } from '@/helper/commonHelper';
import { addOrUpdateDepositRecord } from '@/helper/firebaseHelper';
import { asyncHandler } from '@/middleware/async-middleware';
import DepositAddressesModel from '@/models/depositAddresses/depositAddresses.model';

import { CURRENCY, PAYMENT_METHOD } from '@/types/enums/enums.common';
import { PaymentMetadata } from '@/types/types/event.type';
import { DepositResponse } from '@/types/types/types.common';
import { generateObjectId } from '@/utils/commonUtils';
import { errorResponse, HTTP_STATUS_CODES, successResponse } from '@/utils/responseUtils';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

export const depositBalance = asyncHandler(async (req: Request, res: Response) => {
  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction(); // Start the transaction

  try {
    const { userId, provider, userName } = req;
    const { targetCurrency = CURRENCY.SATS, amount, paymentMethods = [PAYMENT_METHOD.LIGHTNING] } = req.body;
    let filteredPaymentMethods = paymentMethods;

    if (config.NODE_ENV !== 'production') {
      filteredPaymentMethods = paymentMethods.filter((method: PAYMENT_METHOD) => method !== PAYMENT_METHOD.TRON);
    }

    //first create record of deposit address
    const depositAddress = new DepositAddressesModel({
      userId: generateObjectId(userId),
      requestedAmount: amount,
      targetCurrency,
    });

    const currency = DEFAULT_CURRENCY;

    const metaData: Partial<PaymentMetadata> = {
      userId,
      provider,
      userName,
      depositAddressId: String(depositAddress._id),
      type: 'deposit',
    };

    const authKey = `Basic ${process.env[`SPEED_AUTH_KEY`]}`;

    const body = {
      amount,
      currency: (currency as string).toUpperCase(),
      target_currency: (targetCurrency as string).toUpperCase(),
      payment_methods: filteredPaymentMethods,
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
    depositAddress.lightningAddress = response.payment_method_options?.lightning?.payment_request || null;
    depositAddress.onChainAddress = response.payment_method_options?.on_chain?.address || null;
    depositAddress.ethereumAddress = response.payment_method_options?.ethereum?.address || null;
    depositAddress.tronAddress = response.payment_method_options?.tron?.address || null;
    depositAddress.targetCurrency = response.target_currency as CURRENCY;

    await depositAddress.save({ session });

    // Commit the transaction if no errors
    await session.commitTransaction();

    // Calculate the target amount based on the target currency
    // If the target currency is SATS, convert it to BTC
    // Otherwise, for USDT and USDC divide the target amount by the exchange rate
    const targetAmount =
      response.target_currency === CURRENCY.SATS
        ? response.target_amount / SATS_IN_BTC
        : response.target_amount / response.exchange_rate;

    successResponse(res, 'Invoice generated successfully.', HTTP_STATUS_CODES.CREATED, {
      lightning: response.payment_method_options?.lightning,
      onchain: response.payment_method_options?.on_chain,
      ethereum: response.payment_method_options?.ethereum,
      tron: response.payment_method_options?.tron,
      depositAddressId: depositAddress._id,
      currency: response.currency,
      amount: response.amount,
      sourceId: response.id,
      targetCurrency: response.target_currency,
      targetAmount,
    });

    addOrUpdateDepositRecord(userId as string, response.id, { status: response.status });
  } catch (error) {
    // Rollback the transaction in case of error
    await session.abortTransaction();
    return errorResponse(res, 'Error while generating invoice', HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, error);
  } finally {
    // End the session after the transaction
    session.endSession();
  }
});
