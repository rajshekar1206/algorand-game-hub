import React, { createContext, useContext, useState, useCallback } from "react";
import {
  useWallet,
  algodClient,
  createAlgoTransfer,
  sendTransaction,
} from "./WalletContext";
import algosdk from "algosdk";

// Mock ASA token configuration (in production, this would be a real ASA)
const GAME_TOKEN_CONFIG = {
  assetId: 123456789, // This would be the actual ASA ID on testnet
  unitName: "GAMETOKEN",
  assetName: "Algorand Game Token",
  decimals: 6,
  total: 10000000000, // 10 billion with 6 decimals
  url: "https://algorandgamehub.com",
  clawback: "", // Empty for no clawback
  freeze: "", // Empty for no freeze
  manager: "", // Game contract address would go here
  reserve: "", // Reserve address
};

interface RewardTransaction {
  id: string;
  txId: string;
  amount: number;
  timestamp: Date;
  gameType: string;
  score: number;
  status: "pending" | "confirmed" | "failed";
}

interface RewardsContextType {
  // Token operations
  sendTokenReward: (
    amount: number,
    gameType: string,
    score: number,
  ) => Promise<string>;

  // Transaction history
  rewardHistory: RewardTransaction[];

  // Token balance
  tokenBalance: number;
  refreshTokenBalance: () => Promise<void>;

  // State
  isLoading: boolean;
  error: string | null;
}

const RewardsContext = createContext<RewardsContextType | undefined>(undefined);

export const useRewards = () => {
  const context = useContext(RewardsContext);
  if (context === undefined) {
    throw new Error("useRewards must be used within a RewardsProvider");
  }
  return context;
};

interface RewardsProviderProps {
  children: React.ReactNode;
}

export const RewardsProvider: React.FC<RewardsProviderProps> = ({
  children,
}) => {
  const { wallet, signTransaction } = useWallet();
  const [rewardHistory, setRewardHistory] = useState<RewardTransaction[]>([]);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load transaction history from localStorage
  React.useEffect(() => {
    if (wallet.address) {
      const savedHistory = localStorage.getItem(
        `rewardHistory_${wallet.address}`,
      );
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        setRewardHistory(
          history.map((h: any) => ({ ...h, timestamp: new Date(h.timestamp) })),
        );
      }
    }
  }, [wallet.address]);

  // Save transaction history to localStorage
  const saveHistory = (history: RewardTransaction[]) => {
    if (wallet.address) {
      localStorage.setItem(
        `rewardHistory_${wallet.address}`,
        JSON.stringify(history),
      );
      setRewardHistory(history);
    }
  };

  // Create ASA (for demo purposes - in production this would be done once)
  const createGameToken = useCallback(async (): Promise<number> => {
    if (!wallet.address) {
      throw new Error("Wallet not connected");
    }

    try {
      const suggestedParams = await algodClient.getTransactionParams().do();

      const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        from: wallet.address,
        suggestedParams,
        defaultFrozen: false,
        unitName: GAME_TOKEN_CONFIG.unitName,
        assetName: GAME_TOKEN_CONFIG.assetName,
        manager: wallet.address, // In production, this would be a smart contract
        reserve: wallet.address,
        freeze: undefined,
        clawback: undefined,
        assetURL: GAME_TOKEN_CONFIG.url,
        assetMetadataHash: undefined,
        total: GAME_TOKEN_CONFIG.total,
        decimals: GAME_TOKEN_CONFIG.decimals,
      });

      const signedTxn = await signTransaction(txn);
      const txId = await sendTransaction(signedTxn);

      // Wait for confirmation
      await algosdk.waitForConfirmation(algodClient, txId, 4);

      // Get the asset ID from the transaction
      const ptx = await algodClient.pendingTransactionInformation(txId).do();
      const assetId = ptx["asset-index"];

      return assetId;
    } catch (error) {
      console.error("Error creating ASA:", error);
      throw error;
    }
  }, [wallet.address, signTransaction]);

  // Opt-in to ASA
  const optInToAsset = useCallback(
    async (assetId: number): Promise<void> => {
      if (!wallet.address) {
        throw new Error("Wallet not connected");
      }

      try {
        const suggestedParams = await algodClient.getTransactionParams().do();

        const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          from: wallet.address,
          to: wallet.address,
          amount: 0,
          assetIndex: assetId,
          suggestedParams,
        });

        const signedTxn = await signTransaction(txn);
        await sendTransaction(signedTxn);
      } catch (error) {
        console.error("Error opting in to asset:", error);
        throw error;
      }
    },
    [wallet.address, signTransaction],
  );

  // Send token reward
  const sendTokenReward = useCallback(
    async (
      amount: number,
      gameType: string,
      score: number,
    ): Promise<string> => {
      if (!wallet.address) {
        throw new Error("Wallet not connected");
      }

      setIsLoading(true);
      setError(null);

      try {
        // For demo purposes, we'll simulate token rewards
        // In production, this would involve:
        // 1. Calling a smart contract that validates the game score
        // 2. The contract would mint/transfer tokens to the player

        // Create a mock transaction
        const rewardTx: RewardTransaction = {
          id: `reward_${Date.now()}_${Math.random()}`,
          txId: `MOCK_${Date.now()}`, // In production, this would be the real transaction ID
          amount,
          timestamp: new Date(),
          gameType,
          score,
          status: "pending",
        };

        const newHistory = [rewardTx, ...rewardHistory];
        saveHistory(newHistory);

        // Simulate transaction processing
        setTimeout(() => {
          // Update status to confirmed
          const updatedHistory = newHistory.map((tx) =>
            tx.id === rewardTx.id
              ? { ...tx, status: "confirmed" as const }
              : tx,
          );
          saveHistory(updatedHistory);

          // Update token balance
          setTokenBalance((prev) => prev + amount);
        }, 2000);

        // For a real implementation, you would:
        /*
      const suggestedParams = await algodClient.getTransactionParams().do();
      
      // This would be a call to your reward smart contract
      const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        from: wallet.address,
        suggestedParams,
        appIndex: REWARD_CONTRACT_ID,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [
          new TextEncoder().encode('claim_reward'),
          algosdk.encodeUint64(amount),
          new TextEncoder().encode(gameType),
          algosdk.encodeUint64(score),
        ],
      });

      const signedTxn = await signTransaction(appCallTxn);
      const txId = await sendTransaction(signedTxn);
      
      // Wait for confirmation
      await algosdk.waitForConfirmation(algodClient, txId, 4);
      */

        return rewardTx.txId;
      } catch (error) {
        console.error("Error sending token reward:", error);
        setError(
          error instanceof Error ? error.message : "Failed to send reward",
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [wallet.address, rewardHistory],
  );

  // Refresh token balance
  const refreshTokenBalance = useCallback(async () => {
    if (!wallet.address) return;

    try {
      // In production, this would check the actual ASA balance
      const accountInfo = await algodClient
        .accountInformation(wallet.address)
        .do();

      // Look for the game token in assets
      const gameTokenAsset = accountInfo.assets?.find(
        (asset: any) => asset["asset-id"] === GAME_TOKEN_CONFIG.assetId,
      );

      if (gameTokenAsset) {
        setTokenBalance(
          gameTokenAsset.amount / Math.pow(10, GAME_TOKEN_CONFIG.decimals),
        );
      } else {
        // For demo, calculate from history
        const confirmedRewards = rewardHistory
          .filter((tx) => tx.status === "confirmed")
          .reduce((total, tx) => total + tx.amount, 0);
        setTokenBalance(confirmedRewards);
      }
    } catch (error) {
      console.error("Error refreshing token balance:", error);
    }
  }, [wallet.address, rewardHistory]);

  // Refresh balance when wallet connects/disconnects
  React.useEffect(() => {
    if (wallet.address) {
      // Call once when address becomes available
      void refreshTokenBalance();
    } else {
      // Avoid unnecessary state updates that can cause render loops
      setTokenBalance((prev) => (prev !== 0 ? 0 : prev));
      setRewardHistory((prev) => (prev.length ? [] : prev));
    }
  }, [wallet.address]);

  return (
    <RewardsContext.Provider
      value={{
        sendTokenReward,
        rewardHistory,
        tokenBalance,
        refreshTokenBalance,
        isLoading,
        error,
      }}
    >
      {children}
    </RewardsContext.Provider>
  );
};

// Utility function to format token amount
export const formatTokenAmount = (amount: number): string => {
  return (amount / Math.pow(10, GAME_TOKEN_CONFIG.decimals)).toFixed(
    GAME_TOKEN_CONFIG.decimals,
  );
};

// Export token config for use in other components
export { GAME_TOKEN_CONFIG };
