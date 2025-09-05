import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import WalletConnection from "./WalletConnection";
import {
  Gamepad2,
  Trophy,
  User,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigation: NavItem[] = [
  { name: "Games", href: "/games", icon: Gamepad2 },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Profile", href: "/profile", icon: User },
];

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="relative">
              <Zap className="h-8 w-8 text-neon-cyan" />
              <div className="absolute inset-0 h-8 w-8 text-neon-purple animate-glow-pulse opacity-50" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              Algorand Game Hub
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            <WalletConnection />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Hidden for now, can be expanded later */}
      <div className="md:hidden hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card border-t border-border">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 flex items-center space-x-2",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
