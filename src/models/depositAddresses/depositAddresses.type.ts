import { CURRENCY, DEPOSIT_ADDRESS_KEY } from '@/types/enums/enums.common';
import { Document, Types } from 'mongoose';

interface DepositAddressFields {
  [DEPOSIT_ADDRESS_KEY.LIGHTNING_ADDRESS]: string | null;
  [DEPOSIT_ADDRESS_KEY.ONCHAIN_ADDRESS]: string | null;
  [DEPOSIT_ADDRESS_KEY.ETHEREUM_ADDRESS]: string | null;
  [DEPOSIT_ADDRESS_KEY.TRON_ADDRESS]: string | null;
}

interface DepositAddresses extends DepositAddressFields {
  userId: Types.ObjectId;
  requestedAmount: Types.Decimal128;
  targetCurrency: CURRENCY;
}

interface DepositAddressesDocument extends DepositAddresses, Document {}

export { DepositAddresses, DepositAddressesDocument, DepositAddressFields };
