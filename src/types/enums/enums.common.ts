export enum USER_STATUS_TYPE {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum TRANSACTION_TYPE {
  CREDITED = 'credited',
  DEBITED = 'debited',
  EVENT = 'event',
}

// Commonly used methods
export enum API_METHODS {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

// transaction code
export enum TRANSACTION_CODE {
  DEPOSIT = 1,
  WITHDRAWAL = 2,
  WIN = 3,
  BET = 4,
  DEBIT = 5,
  REFUND = 6,
  FREEBET = 7,
  WIN_FREEBET = 8,
}

export enum GAME_EVENT_TYPE {
  START = 'start',
  BET = 'bet',
  WIN = 'win',
  CANCEL = 'cancel',
  END = 'end',
  FREEBET = 'freebet',
}

export enum GAME_EVENT_SUB_TYPE {
  WIN_FREE = 'win_free',
  WIN_BONUS = 'win_bonus',
  BET_FREE = 'bet_free',
  SPIN = 'spin',
  RESPIN = 'respin',
  DROP = 'drop',
  FREESPIN = 'freespin',
  RISK = 'risk',
  BUYIN = 'buyin',
  BONUS = 'bonus',
  DEAL = 'deal',
  HIT = 'hit',
  STAND = 'stand',
  DOUBLE = 'double',
  INSURE = 'insure',
  NOINSURE = 'noinsure',
  EVENMONEY = 'evenmoney',
  NOEVENMONEY = 'noevenmoney',
  SPLIT = 'split',
  FEATURE = 'feature',
  CALL = 'call',
  FOLD = 'fold',
  BET = 'bet',
  CHECK = 'check',
  BUFFER = 'buffer',
  STANDARD = 'standard',
  STANDART = 'standart',
  FREE = 'free',
}

export enum FREEBET_STATUS {
  UNUSED = 'unused',
  USED = 'used',
  EXPIRED = 'expired',
}

export enum OFFER_STATUS {
  PENDING = 'pending',
  ACTIVE = 'active',
  DEACTIVATED = 'deactivated',
  USED = 'used',
  EXPIRED = 'expired',
}

export enum OFFER_AVAIL_ON {
  DEPOSIT = 'deposit',
}

export enum OFFER_BENEFIT_TYPE {
  FREE_BET = 'free_bet',
  BONUS_AMOUNT = 'bonus_amount',
  BONUS_PERCENTAGE = 'bonus_percentage',
}

export enum OFFER_AVAILED_STATUS {
  PAID = 'paid',
  UNPAID = 'unpaid',
}

export enum AUTH_PROVIDER {
  EMAIL = 'email',
  TELEGRAM = 'telegram',
}

export enum OTP_TYPE {
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFICATION = 'email_verification',
}

export enum OTP_STATUS {
  ACTIVE = 'active',
  USED = 'used',
  EXPIRED = 'expired',
}

export enum CURRENCY {
  SATS = 'SATS',
  USDT = 'USDT',
  USDC = 'USDC',
}

export enum PAYMENT_METHOD {
  LIGHTNING = 'lightning',
  ONCHAIN = 'onchain',
  ETHEREUM = 'ethereum',
  TRON = 'tron',
}

export enum PAYMENT_STATUS {
  UNPAID = 'unpaid',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PARTIAL_PAID = 'partial_paid', // Custom status used internally; not provided by Speed.
  PENDING = 'pending', // Custom status used internally; not provided by Speed.
  // NOTE: Additional status codes may be sent by Speed that are not defined here.
}

// All sent by Speed
export enum PAYMENT_EVENT_TYPE {
  PAID = 'payment.paid',
  CONFIRMED = 'payment.confirmed',
  EXPIRED = 'payment.expired',
  CANCELLED = 'payment.cancelled',
}

export enum DEPOSIT_ADDRESS_KEY {
  LIGHTNING_ADDRESS = 'lightningAddress',
  ONCHAIN_ADDRESS = 'onChainAddress',
  ETHEREUM_ADDRESS = 'ethereumAddress',
  TRON_ADDRESS = 'tronAddress',
}
