export type TopWinnerFilterType = 'daily' | 'weekly' | 'monthly';

export type FireStoreGamePlayContext = {
  wonAmount: number;
  userName: string;
  betAmount: number;
  country?: string;
  betType?: string;
};
