import { Document, Types } from 'mongoose';

interface Transaction {
  userId: Types.ObjectId;
  eventId: Types.ObjectId | null;
  amount: Types.Decimal128;
  currency: string;
  closingBalance: Types.Decimal128;
  tnxCode: number;
  tnxType: string;
  sourceId: string;
}

interface TransactionDocument extends Transaction, Document {}

export { Transaction, TransactionDocument };
