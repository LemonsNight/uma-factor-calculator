
import { Rank, RankData, FactorCalculationResult } from './types';

export const RANKS: RankData[] = [
  { rank: 'G', index: 0, color: 'text-gray-500', bgColor: 'bg-gray-100' },
  { rank: 'F', index: 1, color: 'text-gray-400', bgColor: 'bg-gray-50' },
  { rank: 'E', index: 2, color: 'text-blue-500', bgColor: 'bg-blue-50' },
  { rank: 'D', index: 3, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { rank: 'C', index: 4, color: 'text-green-500', bgColor: 'bg-green-100' },
  { rank: 'B', index: 5, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { rank: 'A', index: 6, color: 'text-pink-600', bgColor: 'bg-pink-100' },
  { rank: 'S', index: 7, color: 'text-orange-500', bgColor: 'bg-orange-100' },
];

export const RANK_MAP = RANKS.reduce((acc, curr) => {
  acc[curr.rank] = curr;
  return acc;
}, {} as Record<Rank, RankData>);

export const calculateFactors = (current: Rank, target: Rank): FactorCalculationResult => {
  const startIndex = RANK_MAP[current].index;
  const targetIndex = RANK_MAP[target].index;
  const steps = targetIndex - startIndex;

  if (steps <= 0) {
    return { factors: 0, isPossible: true, steps: 0 };
  }

  // Uma Musume Rules:
  // Initial factors can only boost a rank by MAX 4 stages (e.g., E -> A).
  // 1 rank up: 1 factor
  // 2 ranks up: 4 factors
  // 3 ranks up: 7 factors
  // 4 ranks up: 10 factors
  
  if (steps > 4 || target === 'S') {
    return {
      factors: -1,
      isPossible: false,
      steps,
      message: target === 'S' 
        ? "S级无法通过初始因子达成，需在育成中继承。" 
        : `从${current}到${target}跨越了${steps}个档位，初始因子上限为4档。`
    };
  }

  const factors = 1 + (steps - 1) * 3;
  return { factors, isPossible: true, steps };
};

export const calculateRankFromFactors = (current: Rank, factors: number): Rank | null => {
  const startIndex = RANK_MAP[current].index;
  
  // Inverse of factors = 1 + (steps - 1) * 3
  // steps = (factors - 1) / 3 + 1
  // But factors are discrete: 1, 4, 7, 10
  // Actually, any number of factors between 1-3 gives 1 step, 4-6 gives 2 steps, 7-9 gives 3 steps, 10+ gives 4 steps.
  // Wait, the game rule is usually:
  // 1-3 stars: +1 rank
  // 4-6 stars: +2 ranks
  // 7-9 stars: +3 ranks
  // 10+ stars: +4 ranks
  
  let steps = 0;
  if (factors >= 10) steps = 4;
  else if (factors >= 7) steps = 3;
  else if (factors >= 4) steps = 2;
  else if (factors >= 1) steps = 1;

  const targetIndex = Math.min(startIndex + steps, RANKS.length - 1);
  const targetRank = RANKS[targetIndex].rank;

  // S rank cannot be reached initially
  if (targetRank === 'S' && startIndex + steps >= 7) {
    return 'A'; // Cap at A for initial factors
  }

  return targetRank;
};
