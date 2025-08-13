import { Schema, Types, model } from 'mongoose';
import { DepositAddressesDocument } from './depositAddresses.type';
import { CURRENCY } from '@/types/enums/enums.common';

const depositAddressesSchema = new Schema<DepositAddressesDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },

    requestedAmount: {
      type: Types.Decimal128,
      default: 0.0,
    },
    lightningAddress: {
      type: String,
      default: null,
    },
    onChainAddress: {
      type: String,
      default: null,
    },
    ethereumAddress: {
      type: String,
      default: null,
    },
    tronAddress: {
      type: String,
      default: null,
    },
    targetCurrency: {
      type: String,
      enum: Object.values(CURRENCY),
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Model creation
const DepositAddressesModel = model<DepositAddressesDocument>('deposit-addresses', depositAddressesSchema);

export default DepositAddressesModel;
