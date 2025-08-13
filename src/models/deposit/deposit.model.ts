import { Schema, Types, model } from 'mongoose';
import { DepositDocument } from './deposit.type';

const depositSchema = new Schema<DepositDocument>(
  {
    amount: {
      type: Types.Decimal128,
      default: 0.0,
    },

    currency: {
      type: String,
      default: 'usd',
    },
    targetAmount: {
      type: Types.Decimal128,
      default: 0.0,
    },
    targetCurrency: {
      type: String,
      default: 'usd',
    },
    sourceId: {
      type: String,
    },
    status: {
      type: String,
    },
    depositRequest: {
      type: String,
    },
    depositMethod: {
      type: String,
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
const DepositModel = model<DepositDocument>('deposits', depositSchema);

export default DepositModel;
