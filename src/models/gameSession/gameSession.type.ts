import { Document, Types } from 'mongoose';

interface GameSession {
  gameSessionId: string;
  userId: Types.ObjectId;
  gameId: Types.ObjectId;
  signature: string;
  token: string;
  userAgent: string;
  expiredAt: Date | null;
}

interface GameSessionDocument extends GameSession, Document {}

export { GameSession, GameSessionDocument };
