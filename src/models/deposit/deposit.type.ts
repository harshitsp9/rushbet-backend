import { Document, Types } from 'mongoose';

interface Deposit {
  gameId: Types.ObjectId;
  userId: Types.ObjectId;
  amount: Types.Decimal128;
  currency: string;
  targetAmount: Types.Decimal128;
  targetCurrency: string;
  sourceId: string;
  status: string;
  depositRequest: string;
  depositMethod: string;
  createdAt: Date;
}

interface DepositDocument extends Deposit, Document {}

export { Deposit, DepositDocument };
