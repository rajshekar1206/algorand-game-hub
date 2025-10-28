import { useQuery } from "@tanstack/react-query";

interface WalletBalanceResponse {
  address: string;
  microAlgos: number;
  algos: number;
}

export function useWalletBalance(address?: string) {
  return useQuery<WalletBalanceResponse>({
    enabled: Boolean(address),
    queryKey: ["walletBalance", address],
    queryFn: async () => {
      const res = await fetch(`/api/wallet/${address}/balance`);
      if (!res.ok) throw new Error("Failed to fetch balance");
      return res.json();
    },
  });
}


