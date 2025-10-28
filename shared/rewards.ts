export interface RewardTier {
  minScore: number;
  tokens: number;
  badge?: string;
}

export interface BestReward {
  tokens: number;
  badge?: string;
}

export function computeBestReward(score: number, tiers: RewardTier[]): BestReward {
  let best: BestReward = { tokens: 0 };
  for (const tier of tiers) {
    if (score >= tier.minScore) {
      best = { tokens: tier.tokens, badge: tier.badge };
    }
  }
  return best;
}

export function formatTokens(amount: number, decimals = 6): string {
  return amount.toFixed(0);
}


