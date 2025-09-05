import "./polyfills";
import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./contexts/WalletContext";
import { GameProvider } from "./contexts/GameContext";
import { RewardsProvider } from "./contexts/RewardsContext";
import { NFTProvider } from "./contexts/NFTContext";
import Index from "./pages/Index";
import Games from "./pages/Games";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import SnakePage from "./pages/games/Snake";
import TriviaPage from "./pages/games/Trivia";
import TicTacToePage from "./pages/games/TicTacToe";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletProvider>
      <RewardsProvider>
        <NFTProvider>
          <GameProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/games" element={<Games />} />
                  <Route path="/games/snake" element={<SnakePage />} />
                  <Route path="/games/trivia" element={<TriviaPage />} />
                  <Route path="/games/tictactoe" element={<TicTacToePage />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/profile" element={<Profile />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </GameProvider>
        </NFTProvider>
      </RewardsProvider>
    </WalletProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
