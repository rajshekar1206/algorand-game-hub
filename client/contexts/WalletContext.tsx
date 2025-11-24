import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { PeraWalletConnect } from '@perawallet/connect';
import algosdk from 'algosdk';

// Testnet configuration
const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '');
const peraWallet = new PeraWalletConnect();

interface WalletState {
  address: string | null;
  addresses: string[];
  selectedIndex: number;
  balance: number;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

interface WalletContextType {
  wallet: WalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchWallet: (index: number) => Promise<void>;
  signTransaction: (txn: algosdk.Transaction) => Promise<Uint8Array>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: React.ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    addresses: [],
    selectedIndex: -1,
    balance: 0,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  // Check for existing connection on mount
  useEffect(() => {
    peraWallet
      .reconnectSession()
      .then((accounts) => {
        if (accounts.length > 0) {
          void handleConnection(accounts, 0);
        }
      })
      .catch((error) => {
        console.log('No existing session:', error);
      });
  }, []);

  const handleConnection = async (accounts: string[] | string, selectIndex: number) => {
    const list = Array.isArray(accounts) ? accounts : [accounts];
    const address = list[selectIndex] ?? list[0];
    try {
      const accountInfo = await algodClient.accountInformation(address).do();
      const balance = accountInfo.amount / 1000000;
      setWallet({
        address,
        addresses: list,
        selectedIndex: list.findIndex(a=> a===address),
        balance,
        isConnected: true,
        isConnecting: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching account info:', error);
      setWallet(prev => ({
        ...prev,
        balance: 0,
        isConnecting: false,
        error: 'Failed to fetch account information',
      }));
    }
  };

  const connectWallet = useCallback(async () => {
    setWallet(prev => ({ ...prev, isConnecting: true, error: null }));
    try {
      const newAccounts = await peraWallet.connect();
      if (newAccounts.length > 0) {
        await handleConnection(newAccounts, 0);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setWallet(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Failed to connect wallet'
      }));
    }
  }, []);

  const switchWallet = useCallback(async (index: number) => {
    if (!wallet.addresses || index < 0 || index >= wallet.addresses.length) return;
    await handleConnection(wallet.addresses, index);
  }, [wallet.addresses]);

  const disconnectWallet = useCallback(() => {
    peraWallet.disconnect();
    setWallet({
      address: null,
      balance: 0,
      isConnected: false,
      isConnecting: false,
      error: null,
    });
  }, []);

  const signTransaction = useCallback(async (txn: algosdk.Transaction): Promise<Uint8Array> => {
    if (!wallet.address) {
      throw new Error('Wallet not connected');
    }

    try {
      const txnToSign = [{ txn, signers: [wallet.address] }];
      const signedTxns = await peraWallet.signTransaction(txnToSign);
      return signedTxns[0];
    } catch (error) {
      console.error('Transaction signing failed:', error);
      throw error;
    }
  }, [wallet.address]);

  return (
    <WalletContext.Provider value={{ wallet, connectWallet, disconnectWallet, signTransaction }}>
      {children}
    </WalletContext.Provider>
  );
};

// Utility functions for blockchain operations
export const createAlgoTransfer = async (
  from: string,
  to: string,
  amount: number,
  note?: string
): Promise<algosdk.Transaction> => {
  const suggestedParams = await algodClient.getTransactionParams().do();
  
  return algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from,
    to,
    amount: amount * 1000000, // Convert Algos to microAlgos
    note: note ? new TextEncoder().encode(note) : undefined,
    suggestedParams,
  });
};

export const sendTransaction = async (signedTxn: Uint8Array): Promise<string> => {
  const txn = await algodClient.sendRawTransaction(signedTxn).do();
  return txn.txId;
};

export { algodClient, peraWallet };
