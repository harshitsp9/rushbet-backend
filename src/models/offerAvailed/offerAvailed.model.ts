import { Schema, model } from 'mongoose';
import { OFFER_AVAILED_STATUS } from '@/types/enums/enums.common';
import { OfferAvailedDocument } from './offerAvailed.type';

const offerAvailedSchema = new Schema<OfferAvailedDocument>(
  {
    availedAt: {
      type: Date,
    },
    source: {
      type: String,
    },
    sourceId: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(OFFER_AVAILED_STATUS),
      default: OFFER_AVAILED_STATUS.UNPAID,
    },
    offerId: {
      type: Schema.Types.ObjectId,
      ref: 'offers',
      required: true,
    },
    offerBenefitId: {
      type: Schema.Types.ObjectId,
      ref: 'offer-benefits',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
  },
  {
    timestamps: true,
  }
);

// Model creation
const OfferAvailedModel = model<OfferAvailedDocument>('offer-avails', offerAvailedSchema);

export default OfferAvailedModel;
