import { OFFER_AVAILED_STATUS } from '@/types/enums/enums.common';
import { Document, Types } from 'mongoose';

interface OfferAvailed {
  offerId: Types.ObjectId;
  userId: Types.ObjectId;
  offerBenefitId: Types.ObjectId;
  availedAt: Date;
  status: OFFER_AVAILED_STATUS;
  sourceId: string;
  source: string;
}

interface OfferAvailedDocument extends OfferAvailed, Document {}

export { OfferAvailed, OfferAvailedDocument };
