import React, { createContext, useContext, useState, useCallback } from 'react';
import { useWallet, algodClient, signTransaction, sendTransaction } from './WalletContext';
import algosdk from 'algosdk';

export interface NFTBadge {
  id: string;
  assetId?: number;
  name: string;
  description: string;
  image: string;
  gameType: string;
  requirement: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  mintedAt: Date;
  txId?: string;
  ipfsHash?: string;
}

interface NFTMintProgress {
  badgeName: string;
  status: 'minting' | 'uploading' | 'confirmed' | 'failed';
  txId?: string;
  error?: string;
}

interface NFTContextType {
  // Badge operations
  mintBadge: (badgeName: string, gameType: string, score: number) => Promise<NFTBadge>;
  
  // User's NFT collection
  userBadges: NFTBadge[];
  refreshBadges: () => Promise<void>;
  
  // Available badges catalog
  availableBadges: NFTBadge[];
  
  // Minting status
  mintProgress: NFTMintProgress | null;
  
  // State
  isLoading: boolean;
  error: string | null;
}

const NFTContext = createContext<NFTContextType | undefined>(undefined);

export const useNFT = () => {
  const context = useContext(NFTContext);
  if (context === undefined) {
    throw new Error('useNFT must be used within a NFTProvider');
  }
  return context;
};

// Badge catalog with metadata
const BADGE_CATALOG: Omit<NFTBadge, 'id' | 'mintedAt' | 'txId' | 'assetId'>[] = [
  {
    name: 'Snake Master',
    description: 'Achieved a score of 500+ in Snake Challenge',
    image: '🐍',
    gameType: 'snake',
    requirement: 'Score 500+ points in Snake Challenge',
    rarity: 'epic',
    ipfsHash: 'QmSnakeMaster123...' // Mock IPFS hash
  },
  {
    name: 'Trivia Champion',
    description: 'Perfect score in Crypto Trivia Challenge',
    image: '🧠',
    gameType: 'trivia',
    requirement: 'Score 100% in Trivia Challenge',
    rarity: 'legendary',
    ipfsHash: 'QmTriviaChampion123...'
  },
  {
    name: 'Strategy Master',
    description: 'Won 25 consecutive Tic-Tac-Toe games',
    image: '♟️',
    gameType: 'tictactoe',
    requirement: 'Win 25 Tic-Tac-Toe games',
    rarity: 'rare',
    ipfsHash: 'QmStrategyMaster123...'
  },
  {
    name: 'First Steps',
    description: 'Played your first game on Algorand Game Hub',
    image: '👶',
    gameType: 'any',
    requirement: 'Play any game',
    rarity: 'common',
    ipfsHash: 'QmFirstSteps123...'
  },
  {
    name: 'High Scorer',
    description: 'Achieved a personal best score',
    image: '🎯',
    gameType: 'any',
    requirement: 'Set a new personal record',
    rarity: 'common',
    ipfsHash: 'QmHighScorer123...'
  },
  {
    name: 'Crypto Enthusiast',
    description: 'Completed your first blockchain transaction',
    image: '💰',
    gameType: 'any',
    requirement: 'Complete a token reward transaction',
    rarity: 'rare',
    ipfsHash: 'QmCryptoEnthusiast123...'
  }
];

interface NFTProviderProps {
  children: React.ReactNode;
}

export const NFTProvider: React.FC<NFTProviderProps> = ({ children }) => {
  const { wallet } = useWallet();
  const [userBadges, setUserBadges] = useState<NFTBadge[]>([]);
  const [mintProgress, setMintProgress] = useState<NFTMintProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available badges (from catalog)
  const availableBadges: NFTBadge[] = BADGE_CATALOG.map(badge => ({
    ...badge,
    id: `available_${badge.name.toLowerCase().replace(/\s+/g, '_')}`,
    mintedAt: new Date(),
  }));

  // Load user badges from localStorage
  React.useEffect(() => {
    if (wallet.address) {
      const savedBadges = localStorage.getItem(`nftBadges_${wallet.address}`);
      if (savedBadges) {
        const badges = JSON.parse(savedBadges);
        setUserBadges(badges.map((b: any) => ({ ...b, mintedAt: new Date(b.mintedAt) })));
      }
    } else {
      setUserBadges([]);
    }
  }, [wallet.address]);

  // Save user badges to localStorage
  const saveBadges = (badges: NFTBadge[]) => {
    if (wallet.address) {
      localStorage.setItem(`nftBadges_${wallet.address}`, JSON.stringify(badges));
      setUserBadges(badges);
    }
  };

  // Create NFT metadata
  const createNFTMetadata = (badge: Omit<NFTBadge, 'id' | 'mintedAt'>) => {
    return {
      name: badge.name,
      description: badge.description,
      image: badge.image,
      image_url: `https://algorandgamehub.com/badges/${badge.name.toLowerCase().replace(/\s+/g, '_')}.png`,
      external_url: 'https://algorandgamehub.com',
      attributes: [
        {
          trait_type: 'Game Type',
          value: badge.gameType
        },
        {
          trait_type: 'Rarity',
          value: badge.rarity
        },
        {
          trait_type: 'Requirement',
          value: badge.requirement
        }
      ]
    };
  };

  // Upload metadata to IPFS (simulated)
  const uploadToIPFS = async (metadata: any): Promise<string> => {
    // In a real implementation, this would upload to IPFS
    // For demo purposes, we'll simulate with a mock hash
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockHash = `Qm${Math.random().toString(36).substring(2)}${Date.now()}`;
        resolve(mockHash);
      }, 1000);
    });
  };

  // Mint NFT badge
  const mintBadge = useCallback(async (badgeName: string, gameType: string, score: number): Promise<NFTBadge> => {
    if (!wallet.address) {
      throw new Error('Wallet not connected');
    }

    const badgeTemplate = BADGE_CATALOG.find(b => b.name === badgeName);
    if (!badgeTemplate) {
      throw new Error('Badge template not found');
    }

    // Check if user already has this badge
    const existingBadge = userBadges.find(b => b.name === badgeName);
    if (existingBadge) {
      throw new Error('Badge already owned');
    }

    setIsLoading(true);
    setError(null);
    setMintProgress({ badgeName, status: 'uploading' });

    try {
      // Create metadata
      const metadata = createNFTMetadata(badgeTemplate);
      
      // Upload metadata to IPFS (simulated)
      const ipfsHash = await uploadToIPFS(metadata);
      
      setMintProgress({ badgeName, status: 'minting' });
      
      // In a real implementation, this would create an NFT ASA
      /*
      const suggestedParams = await algodClient.getTransactionParams().do();
      
      const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        from: wallet.address,
        suggestedParams,
        defaultFrozen: false,
        unitName: badgeName.substring(0, 8).toUpperCase(),
        assetName: badgeName,
        manager: wallet.address,
        reserve: wallet.address,
        freeze: undefined,
        clawback: undefined,
        assetURL: `ipfs://${ipfsHash}`,
        assetMetadataHash: new TextEncoder().encode(ipfsHash).slice(0, 32),
        total: 1, // NFT - only 1 unit
        decimals: 0,
      });

      const signedTxn = await signTransaction(txn);
      const txId = await sendTransaction(signedTxn);
      
      // Wait for confirmation
      await algosdk.waitForConfirmation(algodClient, txId, 4);
      
      // Get the asset ID
      const ptx = await algodClient.pendingTransactionInformation(txId).do();
      const assetId = ptx['asset-index'];
      */

      // For demo purposes, simulate the NFT creation
      const mockTxId = `NFTMINT_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      const mockAssetId = Math.floor(Math.random() * 1000000) + 1000000;

      const newBadge: NFTBadge = {
        id: `badge_${Date.now()}_${Math.random()}`,
        assetId: mockAssetId,
        name: badgeName,
        description: badgeTemplate.description,
        image: badgeTemplate.image,
        gameType,
        requirement: badgeTemplate.requirement,
        rarity: badgeTemplate.rarity,
        mintedAt: new Date(),
        txId: mockTxId,
        ipfsHash: ipfsHash,
      };

      // Add to user's collection
      const updatedBadges = [...userBadges, newBadge];
      saveBadges(updatedBadges);
      
      setMintProgress({ badgeName, status: 'confirmed', txId: mockTxId });
      
      // Clear progress after delay
      setTimeout(() => {
        setMintProgress(null);
      }, 3000);

      return newBadge;
    } catch (error) {
      console.error('Error minting badge:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to mint badge';
      setError(errorMessage);
      setMintProgress({ badgeName, status: 'failed', error: errorMessage });
      
      // Clear progress after delay
      setTimeout(() => {
        setMintProgress(null);
      }, 5000);
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [wallet.address, userBadges]);

  // Refresh badges (check blockchain for new NFTs)
  const refreshBadges = useCallback(async () => {
    if (!wallet.address) return;

    setIsLoading(true);
    try {
      // In a real implementation, this would:
      // 1. Query the user's account for all NFT assets
      // 2. Filter for game hub badges (by creator address or metadata)
      // 3. Fetch metadata from IPFS for each badge
      
      // For demo, we'll just keep the locally stored badges
      // In production, this would sync with the blockchain
      
    } catch (error) {
      console.error('Error refreshing badges:', error);
      setError('Failed to refresh badges');
    } finally {
      setIsLoading(false);
    }
  }, [wallet.address]);

  return (
    <NFTContext.Provider value={{
      mintBadge,
      userBadges,
      refreshBadges,
      availableBadges,
      mintProgress,
      isLoading,
      error,
    }}>
      {children}
    </NFTContext.Provider>
  );
};

// Utility functions
export const getRarityColor = (rarity: NFTBadge['rarity']): string => {
  switch (rarity) {
    case 'common':
      return 'text-gray-400';
    case 'rare':
      return 'text-blue-400';
    case 'epic':
      return 'text-purple-400';
    case 'legendary':
      return 'text-yellow-400';
    default:
      return 'text-gray-400';
  }
};

export const getRarityGradient = (rarity: NFTBadge['rarity']): string => {
  switch (rarity) {
    case 'common':
      return 'from-gray-500 to-gray-600';
    case 'rare':
      return 'from-blue-500 to-blue-600';
    case 'epic':
      return 'from-purple-500 to-purple-600';
    case 'legendary':
      return 'from-yellow-500 to-orange-500';
    default:
      return 'from-gray-500 to-gray-600';
  }
};
