import { Schema, Types, model } from 'mongoose';
import { GameEventDocument } from './gameEvent.type';
import { GAME_EVENT_SUB_TYPE, GAME_EVENT_TYPE } from '@/types/enums/enums.common';

const gameEventSchema = new Schema<GameEventDocument>(
  {
    amount: {
      type: Types.Decimal128,
      default: 0.0,
    },

    currency: {
      type: String,
      default: 'usd',
    },
    sourceId: {
      //it is game transaction id for us
      type: String,
    },
    roundId: {
      type: String,
    },
    roundClosed: {
      type: Boolean,
      default: false,
    },
    signature: {
      type: String,
    },
    eventType: {
      type: String,
      enum: Object.values(GAME_EVENT_TYPE),
      required: true,
    },
    eventSubType: {
      type: String,
      enum: Object.values(GAME_EVENT_SUB_TYPE),
    },
    freebetId: {
      type: Schema.Types.ObjectId,
      ref: 'freebets',
    },
    gameId: {
      type: Schema.Types.ObjectId,
      ref: 'games',
      required: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'game-sessions',
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
const GameEventModel = model<GameEventDocument>('game-events', gameEventSchema);

export default GameEventModel;
