import { Schema, Types, model } from 'mongoose';
import { TransactionDocument } from './transaction.type';
import { TRANSACTION_TYPE } from '@/types/enums/enums.common';

const transactionSchema = new Schema<TransactionDocument>(
  {
    amount: {
      type: Types.Decimal128,
      default: 0.0,
    },
    closingBalance: {
      type: Types.Decimal128,
      default: 0.0,
    },

    currency: {
      type: String,
      default: 'usd',
      required: true,
    },
    sourceId: {
      type: String,
    },
    tnxType: {
      type: String,
      enum: Object.values(TRANSACTION_TYPE),
    },
    tnxCode: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6],
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'game-events',
      default: null,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Model creation
const TransactionModel = model<TransactionDocument>('transactions', transactionSchema);

export default TransactionModel;
