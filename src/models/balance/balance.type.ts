import { Document, Types } from 'mongoose';

interface Balance {
  gameId: Types.ObjectId;
  userId: Types.ObjectId;
  balance: Types.Decimal128;
  currency: string;
  last_txn_id: Types.ObjectId;
}

interface BalanceDocument extends Balance, Document {}

export { Balance, BalanceDocument };
