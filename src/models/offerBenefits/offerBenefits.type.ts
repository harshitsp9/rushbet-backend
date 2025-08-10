import { OFFER_BENEFIT_TYPE } from '@/types/enums/enums.common';
import { Document, Double, Types } from 'mongoose';

interface OfferBenefits {
  offerId: Types.ObjectId;
  type: OFFER_BENEFIT_TYPE;
  currency: string;
  amount: Double;
  betAmount: Double;
  percentage: Double;
  maxAmount: Double;
}

interface OfferBenefitsDocument extends OfferBenefits, Document {}

export { OfferBenefits, OfferBenefitsDocument };
