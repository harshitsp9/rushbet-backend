import { Document, Types } from 'mongoose';

interface GameEvent {
  gameId: Types.ObjectId;
  userId: Types.ObjectId;
  sessionId: Types.ObjectId;
  amount: Types.Decimal128;
  freebetId: Types.ObjectId;
  roundId: string;
  roundClosed: boolean;
  metadata: object;
  currency: string;
  sourceId: string;
  signature: string;
  eventType: string;
  eventSubType: string;
  merchantAccountId: string;
  createdAt: Date;
}

interface GameEventDocument extends GameEvent, Document {}

export { GameEvent, GameEventDocument };
