import { Schema, Types, model } from 'mongoose';
import { OFFER_AVAIL_ON, OFFER_STATUS } from '@/types/enums/enums.common';
import { OffersDocument } from './offers.type';

const offerSchema = new Schema<OffersDocument>(
  {
    order: {
      type: Number,
      default: 0,
    },
    userDesc: {
      type: String,
      maxlength: 500,
      default: null,
    },
    helpText: {
      type: String,
      maxlength: 500,
    },
    isMultiUse: {
      type: Boolean,
      default: false,
    },
    maxUseCount: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: false,
    },
    currency: {
      type: String,
    },
    minAmount: {
      type: Types.Double,
    },
    maxAmount: {
      type: Types.Double,
    },
    code: {
      type: String,
      maxlength: 10,
      required: true,
    },
    termsText: {
      type: String,
    },
    iconUrl: {
      type: String,
    },
    adminDesc: {
      type: String,
    },
    remainingUseCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(OFFER_STATUS),
      default: OFFER_STATUS.PENDING,
    },
    availOn: {
      type: String,
      enum: Object.values(OFFER_AVAIL_ON),
      default: OFFER_AVAIL_ON.DEPOSIT,
    },
    gameId: {
      type: Schema.Types.ObjectId,
      ref: 'games',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Model creation
const OffersModel = model<OffersDocument>('offers', offerSchema);

export default OffersModel;
