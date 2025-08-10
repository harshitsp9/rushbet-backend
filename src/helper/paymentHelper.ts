import BalanceModel from '@/models/balance/balance.model';
import { BalanceDocument } from '@/models/balance/balance.type';
import DepositModel from '@/models/deposit/deposit.model';
import { DepositDocument } from '@/models/deposit/deposit.type';
import TransactionModel from '@/models/transaction/transaction.model';
import { TRANSACTION_CODE, TRANSACTION_TYPE } from '@/types/enums/enums.common';
import { PaymentEvent, PaymentMetadata } from '@/types/types/event.type';
import { generateObjectId } from '@/utils/commonUtils';
import { ClientSession, Types } from 'mongoose';

export const withdrawHelperFn = async (
  metaData: PaymentMetadata,
  session: ClientSession,
  event: Partial<PaymentEvent>
) => {
  const eventObj = event.data?.object;

  // find balance record
  const balanceRecordExist = (await BalanceModel.findOne({
    userId: generateObjectId(metaData?.userId),
    gameId: generateObjectId(metaData?.gameId),
    currency: eventObj?.currency.toLowerCase(),
  }).session(session)) as unknown as BalanceDocument;
  if (!balanceRecordExist) throw new Error('Balance record not found with given game and user id');

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
    gameId: generateObjectId(metaData.gameId),
    userId: generateObjectId(metaData.userId),
  });

  //update balance
  const updatedBalance = parseFloat(balanceRecordExist?.balance.toString());

  transactionData.closingBalance = updatedBalance as unknown as Types.Decimal128;

  await transactionData.save({ session });
  return updatedBalance;
};

export const depositHelperFn = async (
  metaData: PaymentMetadata,
  session: ClientSession,
  event: Partial<PaymentEvent>
) => {
  const eventObj = event.data?.object;

  //find deposit record
  const depositRecord = (await DepositModel.findOne({
    _id: generateObjectId(metaData?.depositId),
    userId: generateObjectId(metaData?.userId),
  }).session(session)) as unknown as DepositDocument;
  if (!depositRecord) throw new Error('Deposit record not found with given game and user id');

  // find balance record
  const balanceRecordExist = (await BalanceModel.findOne({
    userId: generateObjectId(metaData?.userId),
    gameId: generateObjectId(metaData?.gameId),
    currency: eventObj?.currency.toLowerCase(),
  }).session(session)) as unknown as BalanceDocument;
  if (!balanceRecordExist) throw new Error('Balance record not found with given game and user id');

  // find balance record
  const tnxExist = (await TransactionModel.exists({
    sourceId: eventObj!.id,
  }).session(session)) as unknown as BalanceDocument;
  if (tnxExist) throw new Error('Transaction sourceId already exist');

  //update deposit record
  depositRecord.status = 'paid';
  await depositRecord.save({ session });

  //create transaction record
  const transactionData = new TransactionModel({
    amount: eventObj!.amount,
    currency: eventObj?.currency.toLowerCase(),
    sourceId: eventObj!.id,
    tnxType: TRANSACTION_TYPE.CREDITED,
    tnxCode: TRANSACTION_CODE.DEPOSIT,
    gameId: generateObjectId(metaData.gameId),
    userId: generateObjectId(metaData.userId),
  });

  //update balance
  const updatedBalance = Number(balanceRecordExist.balance) + eventObj!.amount; //current+updated

  balanceRecordExist.balance = updatedBalance as unknown as Types.Decimal128;
  balanceRecordExist.last_txn_id = transactionData._id as Types.ObjectId;

  transactionData.closingBalance = updatedBalance as unknown as Types.Decimal128;

  await transactionData.save({ session });
  await balanceRecordExist.save({ session });
  return updatedBalance;
};

export const failedOrExpiredPaymentHelper = async (
  metaData: PaymentMetadata,
  event: Partial<PaymentEvent>,
  session: ClientSession
) => {
  const recordId = metaData?.type === 'deposit' ? metaData?.depositId : metaData.withdrawId;

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

  // //add entry in transaction
  // const transactionData = new TransactionModel({
  //   amount: event!.data?.object.amount,
  //   currency: event!.data?.object?.currency.toLowerCase(),
  //   sourceId: event!.data?.object!.id,
  //   tnxType: TRANSACTION_TYPE.DEBITED,
  //   tnxCode: TRANSACTION_CODE.WITHDRAWAL,
  //   gameId: generateObjectId(metaData.gameId),
  //   userId: generateObjectId(metaData.userId),
  // });

  // await transactionData.save({ session });
};
