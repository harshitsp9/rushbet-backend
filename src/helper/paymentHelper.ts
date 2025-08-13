import BalanceModel from '@/models/balance/balance.model';
import { BalanceDocument } from '@/models/balance/balance.type';
import DepositModel from '@/models/deposit/deposit.model';
import { DepositDocument } from '@/models/deposit/deposit.type';
import DepositAddressesModel from '@/models/depositAddresses/depositAddresses.model';
import { DepositAddressesDocument } from '@/models/depositAddresses/depositAddresses.type';
import TransactionModel from '@/models/transaction/transaction.model';
import {
  DEPOSIT_ADDRESS_KEY,
  PAYMENT_EVENT_TYPE,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  TRANSACTION_CODE,
  TRANSACTION_TYPE,
} from '@/types/enums/enums.common';
import { PaymentEvent, PaymentMetadata } from '@/types/types/event.type';
import { PaymentMethodOptions } from '@/types/types/types.common';
import { generateObjectId } from '@/utils/commonUtils';
import { ClientSession, Types } from 'mongoose';
import { syncBalanceToFirebase } from './balanceHelper';

export const withdrawHelperFn = async (
  metaData: PaymentMetadata,
  session: ClientSession,
  event: Partial<PaymentEvent>
) => {
  const eventObj = event.data?.object;

  // find balance record
  const balanceRecordExist = (await BalanceModel.findOne({
    userId: generateObjectId(metaData?.userId),
    currency: eventObj?.currency.toLowerCase(),
  }).session(session)) as unknown as BalanceDocument;
  if (!balanceRecordExist) throw new Error('Balance record not found with given user id');

  // find balance record
  const tnxExist = (await TransactionModel.exists({
    sourceId: eventObj!.id,
  }).session(session)) as unknown as BalanceDocument;
  if (tnxExist) throw new Error('Transaction sourceId already exist');

  //create transaction record
  const transactionData = new TransactionModel({
    amount: eventObj!.amount,
    currency: eventObj?.currency.toLowerCase(),
    sourceId: eventObj!.id,
    tnxType: TRANSACTION_TYPE.DEBITED,
    tnxCode: TRANSACTION_CODE.WITHDRAWAL,
    userId: generateObjectId(metaData.userId),
  });

  //update balance
  const updatedBalance = parseFloat(balanceRecordExist?.availableBalance.toString());

  transactionData.closingBalance = updatedBalance as unknown as Types.Decimal128;

  await transactionData.save({ session });
  return updatedBalance;
};

export type DepositResponse =
  | {
      isProcessDone: true;
      isBalanceUpdated: boolean;
      message: string;
      userId: string;
      depositRecord: DepositDocument;
    }
  | {
      isProcessDone: false;
      isBalanceUpdated: boolean;
      message: string;
      userId?: string;
      depositRecord?: DepositDocument;
    };

export const depositHelperFn = async (
  session: ClientSession,
  event: Partial<PaymentEvent>
): Promise<DepositResponse> => {
  const eventObj = event.data?.object;
  if (!eventObj) throw new Error('No event data found');

  const { event_type: eventType } = event;
  if (!eventType) throw new Error('No event type found');

  const {
    id: paymentSourceId,
    payment_method_options,
    payment_method_paid_by,
    currency,
    exchange_rate,
    target_currency,
    target_amount_paid,
  } = eventObj;

  // Process based on payment method and event type
  const { LIGHTNING, ONCHAIN, ETHEREUM, TRON } = PAYMENT_METHOD;
  const DELAYED_CONFIRM_METHODS = [ONCHAIN, ETHEREUM, TRON];

  const isPendingEvent = eventType === PAYMENT_EVENT_TYPE.PAID;
  const isConfirmedEvent = eventType === PAYMENT_EVENT_TYPE.CONFIRMED;

  // Early return for Lightning PAID events (not fully processed)
  if (payment_method_paid_by === LIGHTNING && isPendingEvent) {
    return { isProcessDone: false, isBalanceUpdated: false, message: 'Lightning payment is pending confirmation.' };
  }

  const { paymentRequest: depositRequest, addressKey } = getPaymentRequestDataByMethod(
    payment_method_options,
    payment_method_paid_by
  );

  // Find deposit address record
  const depositAddresses = await findDepositAddressRecord(session, depositRequest, addressKey);
  const { userId } = depositAddresses;

  // Find and validate balance record
  const balanceRecordExist = await findBalanceRecord(session, userId, currency);

  // Check for duplicate transaction
  await checkDuplicateTransaction(session, paymentSourceId);

  const paidAmount = target_amount_paid / exchange_rate;
  const updatedBalance = Number(balanceRecordExist.availableBalance) + paidAmount;

  // For pending payment status of delayed confirmation methods, create a pending deposit record
  if (isPendingEvent && DELAYED_CONFIRM_METHODS.includes(payment_method_paid_by)) {
    return await handlePendingDelayedConfirmationDeposit(
      session,
      depositAddresses,
      paidAmount,
      payment_method_paid_by,
      paymentSourceId,
      target_currency,
      target_amount_paid,
      currency
    );
  }

  // Handle confirmed payments
  if (isConfirmedEvent) {
    let depositRecord: DepositDocument;

    if (DELAYED_CONFIRM_METHODS.includes(payment_method_paid_by)) {
      // For delayed confirmation methods, find existing deposit record
      depositRecord = (await DepositModel.findOne({
        sourceId: paymentSourceId,
        status: PAYMENT_STATUS.PENDING,
      }).session(session)) as unknown as DepositDocument;

      if (!depositRecord) {
        throw new Error('Pending deposit record not found with given payment id.');
      }
    } else if (payment_method_paid_by === LIGHTNING) {
      // For lightning, create new deposit record with PAID status
      depositRecord = new DepositModel({
        requestedAmount: depositAddresses.requestedAmount,
        amount: paidAmount,
        depositMethod: payment_method_paid_by,
        userId: generateObjectId(userId),
        status: PAYMENT_STATUS.PAID,
        currency: currency.toLowerCase(),
        targetCurrency: target_currency,
        targetAmount: target_amount_paid,
        sourceId: paymentSourceId,
      });
    } else {
      throw new Error('Unsupported event type or payment method combination.');
    }

    // Create transaction record
    const transactionData = new TransactionModel({
      amount: paidAmount,
      closingBalance: updatedBalance,
      currency: currency.toLowerCase(),
      sourceId: paymentSourceId,
      tnxType: TRANSACTION_TYPE.CREDITED,
      tnxCode: TRANSACTION_CODE.DEPOSIT,
      userId,
    });

    // Update balance record
    balanceRecordExist.availableBalance = updatedBalance as unknown as Types.Decimal128;
    balanceRecordExist.withdrawableBalance = updatedBalance as unknown as Types.Decimal128;
    balanceRecordExist.last_txn_id = transactionData._id as Types.ObjectId;

    // Mark deposit record as paid
    depositRecord.status = PAYMENT_STATUS.PAID;

    // Save all documents
    await Promise.all([
      depositRecord.save({ session }),
      transactionData.save({ session }),
      balanceRecordExist.save({ session }),
    ]);

    // Sync balance to Firebase in background (without await)
    syncBalanceToFirebase(userId.toString(), String(balanceRecordExist._id), {
      currency: balanceRecordExist.currency,
      availableBalance: parseFloat(balanceRecordExist.availableBalance.toString()),
      withdrawableBalance: parseFloat(balanceRecordExist.withdrawableBalance.toString()),
      lastTransactionId: String(transactionData._id),
    });

    return {
      isBalanceUpdated: true,
      isProcessDone: true,
      depositRecord,
      userId: userId.toString(),
      message: 'Payment status updated successfully.',
    };
  }

  throw new Error('Unsupported event type or payment method combination.');
};

/**
 * Find deposit address record
 */
export const findDepositAddressRecord = async (session: ClientSession, depositRequest: string, addressKey: string) => {
  const depositAddresses = await DepositAddressesModel.findOne({
    [addressKey]: depositRequest,
  }).session(session);

  if (!depositAddresses)
    throw new Error('Deposit address record not found with given payment request and payment method.');

  return depositAddresses;
};

/**
 * Find and validate balance record
 */
export const findBalanceRecord = async (session: ClientSession, userId: Types.ObjectId, currency: string) => {
  const balanceRecordExist = await BalanceModel.findOne({
    userId,
    currency: currency.toLowerCase(),
  }).session(session);

  if (!balanceRecordExist) throw new Error('Balance record not found with given user id.');

  return balanceRecordExist;
};

/**
 * Check for duplicate transactions
 */
export const checkDuplicateTransaction = async (session: ClientSession, paymentSourceId: string) => {
  const tnxExist = await TransactionModel.exists({
    sourceId: paymentSourceId,
  }).session(session);

  if (tnxExist) throw new Error('Transaction sourceId already exists.');
};

/**
 * Handle pending deposits for methods with delayed confirmation
 */
export const handlePendingDelayedConfirmationDeposit = async (
  session: ClientSession,
  depositAddresses: DepositAddressesDocument,
  paidAmount: number,
  paymentMethod: string,
  paymentSourceId: string,
  targetCurrency: string,
  targetAmount: number,
  currency: string
): Promise<DepositResponse> => {
  const depositRecord = new DepositModel({
    requestedAmount: depositAddresses.requestedAmount,
    amount: paidAmount,
    depositMethod: paymentMethod,
    userId: depositAddresses.userId,
    status: PAYMENT_STATUS.PENDING,
    currency: currency.toLowerCase(),
    targetCurrency,
    targetAmount,
    sourceId: paymentSourceId,
  });

  await depositRecord.save({ session });

  return {
    isProcessDone: true,
    isBalanceUpdated: false,
    depositRecord,
    userId: depositAddresses.userId.toString(),
    message: 'Payment received and is pending confirmation.',
  };
};

export const failedOrExpiredPaymentHelper = async (
  metaData: PaymentMetadata,
  event: Partial<PaymentEvent>,
  session: ClientSession
) => {
  const recordId = metaData?.type === 'deposit' ? metaData?.depositAddressId : metaData.withdrawId;

  await DepositModel.updateOne(
    {
      userId: generateObjectId(metaData?.userId),
      _id: generateObjectId(recordId),
    },
    {
      status: event.data?.object.status,
    },
    { session }
  );
};

export const getPaymentRequestDataByMethod = (
  paymentMethodOptions: PaymentMethodOptions,
  requestMethod: PAYMENT_METHOD
): { paymentRequest: string; addressKey: DEPOSIT_ADDRESS_KEY } => {
  const { LIGHTNING, ONCHAIN, ETHEREUM, TRON } = PAYMENT_METHOD;
  const { LIGHTNING_ADDRESS, ONCHAIN_ADDRESS, ETHEREUM_ADDRESS, TRON_ADDRESS } = DEPOSIT_ADDRESS_KEY;
  const paymentRequestData = {} as { paymentRequest: string; addressKey: DEPOSIT_ADDRESS_KEY };

  switch (requestMethod) {
    case LIGHTNING:
      paymentRequestData.paymentRequest = paymentMethodOptions?.lightning?.payment_request || '';
      paymentRequestData.addressKey = LIGHTNING_ADDRESS;
      break;
    case ONCHAIN:
      paymentRequestData.paymentRequest = paymentMethodOptions?.on_chain?.address || '';
      paymentRequestData.addressKey = ONCHAIN_ADDRESS;
      break;
    case ETHEREUM:
      paymentRequestData.paymentRequest = paymentMethodOptions?.ethereum?.address || '';
      paymentRequestData.addressKey = ETHEREUM_ADDRESS;
      break;
    case TRON:
      paymentRequestData.paymentRequest = paymentMethodOptions?.tron?.address || '';
      paymentRequestData.addressKey = TRON_ADDRESS;
      break;
    default:
      break;
  }

  return paymentRequestData;
};
