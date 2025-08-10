// eslint-disable-next-line no-unused-vars
export type AddNewField<T, K extends string, V> = T & { [P in K]: V };

//mail config option
export type MailOptionsType = {
  from: string;
  to: string;
  subject: string;
  text: string;
};

export type RecaptchaConfig = {
  secretKey: string;
  scoreThreshold: number;
};

//jwt generate return type
export type JWTGenerateReturnType = {
  token: string;
};

export interface SortFields {
  [key: string]: 1 | -1;
}

export interface PaymentMethodOptions {
  processing_fee: number;
  estimated_time: string;
  limits: {
    min: number;
    max: number;
  };
  lightning: {
    id: string;
    payment_request: string;
  };
}

export interface DepositResponse {
  id: string;
  status: string;
  amount: number;
  currency: string;
  payment_methods: string[];
  payment_method_options: PaymentMethodOptions;
  [key: string]: string | number | object; // Allow additional dynamic properties
}

export interface WithdrawApiResponse {
  id: string;
  status: string;
  amount: number;
  target_amount: number;
  currency: string;
  target_currency: string;
  withdraw_id: string;
  withdraw_method: string;
  withdraw_request: string;
  [key: string]: string | number | object; // Allow additional dynamic properties
}

export interface DepositRequestBody {
  currency: string;
  amount: number;
  target_currency: string;
  payment_methods: string[];
  metadata?: Record<string, any>; // Optional metadata object
}

export interface WithdrawRequestBody {
  currency: string;
  amount: number;
  target_currency: string;
  withdraw_method: string;
  withdraw_request: string;
  metadata?: Record<string, any>; // Optional metadata object
}
