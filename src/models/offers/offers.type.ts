import { OFFER_AVAIL_ON, OFFER_STATUS } from '@/types/enums/enums.common';
import { Document, Double } from 'mongoose';

interface Offers {
  order: number;
  isMultiUse: boolean;
  maxUseCount: number;
  remainingUseCount: number;
  startDate: Date;
  endDate: Date;
  status: OFFER_STATUS;
  availOn: OFFER_AVAIL_ON;
  currency: string;
  minAmount: Double;
  maxAmount: Double;
  code: string; //promo code
  termsText: string;
  userDesc: string;
  adminDesc: string;
  helpText: string; //Min. Deposit: 5 USD
  iconUrl: string;
}

interface OffersDocument extends Offers, Document {}

export { Offers, OffersDocument };
