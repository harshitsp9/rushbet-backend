import { Schema, model } from 'mongoose';
import { GamesDocument, StatsDocument } from './games.type';

const statsSchema = new Schema<StatsDocument>(
  {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: String,
    },
  },
  { _id: true }
);

const gamesSchema = new Schema<GamesDocument>(
  {
    name: {
      type: String,
      maxlength: 50,
      required: true,
    },
    slug: {
      type: String,
    },
    provider: {
      type: String,
      maxlength: 80,
      required: true,
    },
    providerGameId: {
      type: String,
      maxlength: 80,
    },
    homeUrl: {
      type: String,
    },
    defaultCurrency: {
      type: String,
      default: 'usd',
    },
    isUnderMaintenance: {
      type: Boolean,
      default: false,
    },
    gameKey: {
      type: String,
      maxlength: 80,
    },
    merchantAccountId: {
      type: String,
      required: true,
    },
    config: {
      type: Schema.Types.Mixed, // This allows for dynamic configuration data
      default: {},
    },
    gameStats: [statsSchema],
    tips: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Model creation
const GamesModel = model<GamesDocument>('games', gamesSchema);

export default GamesModel;
