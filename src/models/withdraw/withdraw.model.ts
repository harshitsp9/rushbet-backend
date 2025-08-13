import { Schema, Types, model } from 'mongoose';
import { WithdrawDocument } from './withdraw.type';

const withdrawSchema = new Schema<WithdrawDocument>(
  {
    amount: {
      type: Types.Decimal128,
      default: 0.0,
    },

    currency: {
      type: String,
      default: 'usd',
      required: true,
    },
    targetAmount: {
      type: Types.Decimal128,
      default: 0.0,
    },
    targetCurrency: {
      type: String,
      default: 'usd',
      required: true,
    },
    sourceId: {
      type: String,
    },
    status: {
      type: String,
    },
    withdrawRequest: {
      type: String,
    },
    withdrawMethod: {
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
const WithdrawModel = model<WithdrawDocument>('withdraws', withdrawSchema);

export default WithdrawModel;
