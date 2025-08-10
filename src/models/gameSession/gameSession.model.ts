import { Schema, model } from 'mongoose';
import { GameSessionDocument } from './gameSession.type';

const gameSessionSchema = new Schema<GameSessionDocument>(
  {
    gameSessionId: {
      type: String,
    },
    token: {
      type: String,
    },
    signature: {
      type: String,
    },
    userAgent: {
      type: String,
    },

    expiredAt: {
      type: Schema.Types.Date,
      default: null,
    },

    gameId: {
      type: Schema.Types.ObjectId,
      ref: 'games',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Model creation
const GameSessionModel = model<GameSessionDocument>('game-sessions', gameSessionSchema);

export default GameSessionModel;
