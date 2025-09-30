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
import MemoryPage from "./pages/games/Memory";
import RPSPage from "./pages/games/RPS";
import NotFound from "./pages/NotFound";
import FlappyPage from "./pages/games/Flappy";
import Puzzle15Page from "./pages/games/Puzzle15";
import SimonPage from "./pages/games/Simon";
import SudokuPage from "./pages/games/Sudoku";
import ChessMiniPage from "./pages/games/ChessMini";
import Game2048Page from "./pages/games/Game2048";

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
                  <Route path="/games/memory" element={<MemoryPage />} />
                  <Route path="/games/rps" element={<RPSPage />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/games/flappy" element={<FlappyPage />} />
                  <Route path="/games/puzzle15" element={<Puzzle15Page />} />
                  <Route path="/games/simon" element={<SimonPage />} />
                  <Route path="/games/sudoku" element={<SudokuPage />} />
                  <Route path="/games/chess" element={<ChessMiniPage />} />
                  <Route path="/games/2048" element={<Game2048Page />} />
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
