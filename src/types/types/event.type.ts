export type PaymentEvent = {
  api_version: string;
  data: {
    object: Payment;
  };
  event_type: string;
  id: string;
  livemode: boolean;
  object: string;
  request: {
    id: string;
  };
};

type Payment = {
  amount: number;
  confirmations: number;
  created: number;
  currency: string;
  exchange_rate: number;
  expires_at: number;
  id: string;
  metadata: PaymentMetadata;
  modified: number;
  object: string;
  payment_method_options: PaymentMethodOptions;
  payment_method_paid_by: string;
  payment_methods: string[];
  status: string;
  target_amount: number;
  target_amount_paid: number;
  target_amount_paid_at: number;
  target_amount_paid_by: string;
  target_currency: string;
  transfers: any[]; // You can define a more specific type if needed
  ttl: number;
};

export type PaymentMetadata = {
  depositId: string;
  withdrawId: string;
  gameId: string;
  type: string;
  userId: string;
  offerId?: string;
  offerAvailedId?: string;
  userName?: string;
  provider?: string;
  gameName?: string;
};

type PaymentMethodOptions = {
  lightning: LightningPayment;
};

type LightningPayment = {
  id: string;
  payment_request: string;
  preimage: string;
};
