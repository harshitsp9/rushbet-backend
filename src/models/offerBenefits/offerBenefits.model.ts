import { Schema, Types, model } from 'mongoose';
import { OFFER_BENEFIT_TYPE } from '@/types/enums/enums.common';
import { OfferBenefitsDocument } from './offerBenefits.type';

const offerBenefitSchema = new Schema<OfferBenefitsDocument>(
  {
    currency: {
      type: String,
    },
    amount: {
      type: Types.Double,
    },
    percentage: {
      type: Types.Double,
    },
    maxAmount: {
      type: Types.Double,
    },
    betAmount: {
      type: Types.Double,
    },
    type: {
      type: String,
      enum: Object.values(OFFER_BENEFIT_TYPE),
      default: OFFER_BENEFIT_TYPE.FREE_BET,
    },
    offerId: {
      type: Schema.Types.ObjectId,
      ref: 'offers',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Model creation
const OfferBenefitsModel = model<OfferBenefitsDocument>('offer-benefits', offerBenefitSchema);

export default OfferBenefitsModel;
