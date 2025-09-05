import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useWallet } from "./WalletContext";
import { useRewards } from "./RewardsContext";
import { useNFT } from "./NFTContext";

export type GameType = "snake" | "trivia" | "tictactoe";

export interface GameScore {
  id: string;
  gameType: GameType;
  score: number;
  timestamp: Date;
  playerAddress: string;
  difficulty?: string;
  rewardTokens?: number;
  nftBadgeEarned?: string;
}

export interface PlayerStats {
  totalScore: number;
  gamesPlayed: number;
  highestScore: number;
  tokensEarned: number;
  nftBadges: string[];
  lastPlayed: Date | null;
  gameStats: {
    [key in GameType]: {
      played: number;
      highScore: number;
      totalScore: number;
    };
  };
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  displayName: string;
  totalScore: number;
  tokensEarned: number;
  badges: number;
}

interface GameContextType {
  // Player stats
  playerStats: PlayerStats;

  // Scoring
  submitScore: (
    gameType: GameType,
    score: number,
    difficulty?: string,
  ) => Promise<void>;

  // Leaderboard
  leaderboard: LeaderboardEntry[];
  refreshLeaderboard: () => Promise<void>;

  // Rewards
  checkRewardEligibility: (
    gameType: GameType,
    score: number,
  ) => { tokens: number; badge?: string };
  claimReward: (tokens: number, badge?: string) => Promise<void>;

  // Game history
  gameHistory: GameScore[];

  // State
  isLoading: boolean;
  error: string | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

// Initial player stats
const createInitialStats = (): PlayerStats => ({
  totalScore: 0,
  gamesPlayed: 0,
  highestScore: 0,
  tokensEarned: 0,
  nftBadges: [],
  lastPlayed: null,
  gameStats: {
    snake: { played: 0, highScore: 0, totalScore: 0 },
    trivia: { played: 0, highScore: 0, totalScore: 0 },
    tictactoe: { played: 0, highScore: 0, totalScore: 0 },
  },
});

// Reward tiers
const REWARD_TIERS = {
  snake: [
    { minScore: 50, tokens: 5 },
    { minScore: 100, tokens: 10 },
    { minScore: 200, tokens: 25 },
    { minScore: 500, tokens: 50, badge: "Snake Master" },
  ],
  trivia: [
    { minScore: 60, tokens: 10 },
    { minScore: 80, tokens: 20 },
    { minScore: 90, tokens: 50 },
    { minScore: 100, tokens: 100, badge: "Trivia Champion" },
  ],
  tictactoe: [
    { minScore: 3, tokens: 3 },
    { minScore: 5, tokens: 8 },
    { minScore: 10, tokens: 20 },
    { minScore: 25, tokens: 50, badge: "Strategy Master" },
  ],
};

// Mock leaderboard data - in a real app, this would come from a backend
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    address: "ALGO123...XYZ",
    displayName: "CryptoGamer",
    totalScore: 2450,
    tokensEarned: 245,
    badges: 3,
  },
  {
    rank: 2,
    address: "ALGO456...ABC",
    displayName: "SnakeMaster",
    totalScore: 2100,
    tokensEarned: 210,
    badges: 2,
  },
  {
    rank: 3,
    address: "ALGO789...DEF",
    displayName: "TriviaKing",
    totalScore: 1890,
    tokensEarned: 189,
    badges: 2,
  },
  {
    rank: 4,
    address: "ALGO012...GHI",
    displayName: "Player4",
    totalScore: 1650,
    tokensEarned: 165,
    badges: 1,
  },
  {
    rank: 5,
    address: "ALGO345...JKL",
    displayName: "GameNinja",
    totalScore: 1420,
    tokensEarned: 142,
    badges: 1,
  },
];

interface GameProviderProps {
  children: React.ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const { wallet } = useWallet();
  const { sendTokenReward } = useRewards();
  const { mintBadge } = useNFT();
  const [playerStats, setPlayerStats] =
    useState<PlayerStats>(createInitialStats());
  const [gameHistory, setGameHistory] = useState<GameScore[]>([]);
  const [leaderboard, setLeaderboard] =
    useState<LeaderboardEntry[]>(MOCK_LEADERBOARD);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load player data when wallet connects
  useEffect(() => {
    if (wallet.address) {
      loadPlayerData(wallet.address);
    } else {
      // Reset data when wallet disconnects
      setPlayerStats(createInitialStats());
      setGameHistory([]);
    }
  }, [wallet.address]);

  const loadPlayerData = async (address: string) => {
    try {
      setIsLoading(true);

      // In a real app, this would fetch from a backend/database
      const savedStats = localStorage.getItem(`gameStats_${address}`);
      const savedHistory = localStorage.getItem(`gameHistory_${address}`);

      if (savedStats) {
        setPlayerStats(JSON.parse(savedStats));
      }

      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        setGameHistory(
          history.map((h: any) => ({ ...h, timestamp: new Date(h.timestamp) })),
        );
      }
    } catch (error) {
      console.error("Error loading player data:", error);
      setError("Failed to load player data");
    } finally {
      setIsLoading(false);
    }
  };

  const savePlayerData = (stats: PlayerStats, history: GameScore[]) => {
    if (wallet.address) {
      localStorage.setItem(
        `gameStats_${wallet.address}`,
        JSON.stringify(stats),
      );
      localStorage.setItem(
        `gameHistory_${wallet.address}`,
        JSON.stringify(history),
      );
    }
  };

  const submitScore = useCallback(
    async (gameType: GameType, score: number, difficulty = "normal") => {
      if (!wallet.address) {
        throw new Error("Wallet not connected");
      }

      try {
        setIsLoading(true);
        setError(null);

        // Create game score entry
        const gameScore: GameScore = {
          id: `${Date.now()}_${Math.random()}`,
          gameType,
          score,
          timestamp: new Date(),
          playerAddress: wallet.address,
          difficulty,
        };

        // Check for rewards
        const reward = checkRewardEligibility(gameType, score);
        if (reward.tokens > 0) {
          gameScore.rewardTokens = reward.tokens;
          gameScore.nftBadgeEarned = reward.badge;
        }

        // Update player stats
        const newStats = { ...playerStats };
        newStats.gamesPlayed += 1;
        newStats.totalScore += score;
        newStats.lastPlayed = new Date();

        if (score > newStats.highestScore) {
          newStats.highestScore = score;
        }

        if (score > newStats.gameStats[gameType].highScore) {
          newStats.gameStats[gameType].highScore = score;
        }

        newStats.gameStats[gameType].played += 1;
        newStats.gameStats[gameType].totalScore += score;

        if (reward.tokens > 0) {
          newStats.tokensEarned += reward.tokens;
        }

        if (reward.badge && !newStats.nftBadges.includes(reward.badge)) {
          newStats.nftBadges.push(reward.badge);
        }

        // Update state
        const newHistory = [gameScore, ...gameHistory];
        setPlayerStats(newStats);
        setGameHistory(newHistory);

        // Save to localStorage
        savePlayerData(newStats, newHistory);

        // Auto-claim rewards if any
        if (reward.tokens > 0) {
          await claimReward(reward.tokens, reward.badge, gameType, score);
        }
      } catch (error) {
        console.error("Error submitting score:", error);
        setError("Failed to submit score");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [wallet.address, playerStats, gameHistory],
  );

  const checkRewardEligibility = useCallback(
    (gameType: GameType, score: number) => {
      const tiers = REWARD_TIERS[gameType];
      let bestReward = { tokens: 0, badge: undefined as string | undefined };

      for (const tier of tiers) {
        if (score >= tier.minScore) {
          bestReward = { tokens: tier.tokens, badge: tier.badge };
        }
      }

      return bestReward;
    },
    [],
  );

  const claimReward = useCallback(
    async (
      tokens: number,
      badge?: string,
      gameType: GameType | string = "unknown",
      score: number = 0,
    ) => {
      if (!wallet.address) {
        throw new Error("Wallet not connected");
      }

      try {
        // Send token reward (simulated on testnet in RewardsContext)
        await sendTokenReward(tokens, String(gameType), score);

        // Mint NFT badge if applicable (simulated in NFTContext)
        if (badge) {
          await mintBadge(badge, String(gameType), score);
        }
      } catch (error) {
        console.error("Error claiming reward:", error);
        throw error;
      }
    },
    [wallet.address, sendTokenReward, mintBadge],
  );

  const refreshLeaderboard = useCallback(async () => {
    try {
      setIsLoading(true);

      // In a real app, this would fetch from backend
      // For now, we'll simulate updating the leaderboard with current player
      if (wallet.address && playerStats.totalScore > 0) {
        const playerEntry: LeaderboardEntry = {
          rank: 0, // Will be calculated
          address: wallet.address,
          displayName: `Player_${wallet.address.slice(-4)}`,
          totalScore: playerStats.totalScore,
          tokensEarned: playerStats.tokensEarned,
          badges: playerStats.nftBadges.length,
        };

        // Insert player into leaderboard if not already present
        const existingIndex = leaderboard.findIndex(
          (entry) => entry.address === wallet.address,
        );
        let newLeaderboard = [...leaderboard];

        if (existingIndex >= 0) {
          newLeaderboard[existingIndex] = playerEntry;
        } else {
          newLeaderboard.push(playerEntry);
        }

        // Sort by total score and update ranks
        newLeaderboard.sort((a, b) => b.totalScore - a.totalScore);
        newLeaderboard.forEach((entry, index) => {
          entry.rank = index + 1;
        });

        setLeaderboard(newLeaderboard);
      }
    } catch (error) {
      console.error("Error refreshing leaderboard:", error);
      setError("Failed to refresh leaderboard");
    } finally {
      setIsLoading(false);
    }
  }, [wallet.address, playerStats, leaderboard]);

  return (
    <GameContext.Provider
      value={{
        playerStats,
        submitScore,
        leaderboard,
        refreshLeaderboard,
        checkRewardEligibility,
        claimReward,
        gameHistory,
        isLoading,
        error,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
