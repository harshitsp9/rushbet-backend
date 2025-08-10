import { Document, Types } from 'mongoose';

interface Withdraw {
  gameId: Types.ObjectId;
  userId: Types.ObjectId;
  amount: Types.Decimal128;
  currency: string;
  targetAmount: Types.Decimal128;
  targetCurrency: string;
  sourceId: string;
  status: string;
  withdrawRequest: string;
  withdrawMethod: string;
  createdAt: Date;
}

interface WithdrawDocument extends Withdraw, Document {}

export { Withdraw, WithdrawDocument };
