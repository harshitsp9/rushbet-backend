import { Document } from 'mongoose';

interface Stats {
  label: string;
  value: string;
}
interface Games {
  name: string;
  slug: string;
  defaultCurrency: string;
  provider: string;
  config: object;
  gameStats: Stats[];
  tips: string;
  homeUrl: string;
  gameKey: string;
  providerGameId: string;
  merchantAccountId: string;
  isUnderMaintenance: boolean;
}

interface StatsDocument extends Stats, Document {}
interface GamesDocument extends Games, Document {}

export { Games, GamesDocument, StatsDocument, Stats };
