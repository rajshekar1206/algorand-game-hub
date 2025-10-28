import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/contexts/WalletContext";
import { useWalletBalance } from "@/hooks/useWalletBalance";

export default function WalletBadge() {
  const { wallet } = useWallet();
  const { data, isLoading } = useWalletBalance(wallet.address || undefined);

  const label = wallet.isConnected && wallet.address
    ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
    : "Not Connected";

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary">{label}</Badge>
      {wallet.isConnected && (
        <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/40">
          {isLoading ? "..." : `${(data?.algos ?? 0).toFixed(3)} ALGO`}
        </Badge>
      )}
    </div>
  );
}


