import { Schema, Types, model } from 'mongoose';
import { BalanceDocument } from './balance.type';

const balanceSchema = new Schema<BalanceDocument>(
  {
    availableBalance: {
      type: Types.Decimal128,
      default: 0.0,
    },
    withdrawableBalance: {
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
      required: false, // Making it optional for now since some balances might not be game-specific
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    last_txn_id: {
      type: Schema.Types.ObjectId,
      ref: 'transactions',
      required: false,
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
