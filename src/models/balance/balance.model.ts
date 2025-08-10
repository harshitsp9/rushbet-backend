import { Schema, Types, model } from 'mongoose';
import { BalanceDocument } from './balance.type';

const balanceSchema = new Schema<BalanceDocument>(
  {
    balance: {
      type: Types.Decimal128,
      default: 0.0,
    },
    currency: {
      type: String,
      default: 'usd',
      required: true,
    },

    gameId: {
      type: Schema.Types.ObjectId,
      ref: 'games',
      required: true,
    },
    last_txn_id: {
      type: Schema.Types.ObjectId,
      ref: 'transactions',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  }
);

// Model creation
const BalanceModel = model<BalanceDocument>('balances', balanceSchema);

export default BalanceModel;
