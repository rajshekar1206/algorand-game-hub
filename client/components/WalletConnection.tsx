import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/contexts/WalletContext";
import { 
  Wallet, 
  ChevronDown, 
  Copy, 
  LogOut, 
  User,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function WalletConnection() {
  const { wallet, connectWallet, disconnectWallet } = useWallet();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    if (wallet.address) {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (wallet.isConnecting) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        disabled
        className="border-neon-cyan text-neon-cyan"
      >
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Connecting...
      </Button>
    );
  }

  if (!wallet.isConnected) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        onClick={connectWallet}
        className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-game-bg transition-all duration-200"
      >
        <Wallet className="h-4 w-4 mr-2" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-game-bg transition-all duration-200"
        >
          <div className="flex items-center space-x-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">
              {truncateAddress(wallet.address!)}
            </span>
            <Badge variant="secondary" className="hidden md:inline-flex text-xs">
              {wallet.balance.toFixed(2)} ALGO
            </Badge>
            <ChevronDown className="h-3 w-3" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56 bg-game-card border-border">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Wallet Connected</p>
            <p className="text-xs leading-none text-muted-foreground">
              {truncateAddress(wallet.address!)}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="flex flex-col items-start space-y-1 cursor-default">
          <div className="text-sm font-medium">Balance</div>
          <div className="text-lg font-bold text-neon-cyan">
            {wallet.balance.toFixed(2)} ALGO
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleCopyAddress}
          className="cursor-pointer hover:bg-muted"
        >
          <Copy className="mr-2 h-4 w-4" />
          <span>{copied ? "Copied!" : "Copy Address"}</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <a href="/profile" className="cursor-pointer hover:bg-muted">
            <User className="mr-2 h-4 w-4" />
            <span>View Profile</span>
          </a>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={disconnectWallet}
          className="cursor-pointer hover:bg-muted text-red-400 hover:text-red-300"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
