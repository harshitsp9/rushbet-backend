//for middleware
declare namespace Express {
  export interface Request {
    userId?: Types.ObjectId;
    gameId?: Types.ObjectId;
    sessionId?: Types.ObjectId;
    rawBody?: Buffer;
    currentTime?: number;
    gameCurrency?: string;
    balance?: Types.Decimal128;
    userName?: string;
    provider?: string;
    gameName?: string;
    gameConfig?: {
      decimals?: number;
      minBet?: number;
      maxBet?: number;
      restrictGamePlay?: boolean;
    };
  }
}
