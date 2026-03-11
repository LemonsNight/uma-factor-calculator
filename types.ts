
export type Rank = 'G' | 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export interface RankData {
  rank: Rank;
  index: number;
  color: string;
  bgColor: string;
}

export interface FactorCalculationResult {
  factors: number;
  isPossible: boolean;
  steps: number;
  message?: string;
}
