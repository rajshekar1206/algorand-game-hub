export interface LeaderboardEntryDTO {
  rank: number;
  address: string;
  displayName: string;
  totalScore: number;
  tokensEarned: number;
  badges: number;
}

export interface SubmitScoreRequest {
  address: string;
  displayName?: string;
  gameType: string;
  score: number;
  tokensEarned?: number;
  badgesAwarded?: number;
}

export interface SubmitScoreResponse {
  success: boolean;
  message?: string;
}

export interface GetLeaderboardResponse {
  leaderboard: LeaderboardEntryDTO[];
}

export type LeaderboardStorageRecord = {
  address: string;
  displayName: string;
  totalScore: number;
  tokensEarned: number;
  badges: number;
};


