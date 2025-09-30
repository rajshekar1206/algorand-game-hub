import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGame } from '@/contexts/GameContext';
import { useWallet } from '@/contexts/WalletContext';
import { Play, RotateCcw, Trophy, Zap, Timer, Award } from 'lucide-react';

type GameState = 'MENU' | 'PLAYING' | 'GAME_OVER';

interface MemoryCard {
  id: number;
  symbol: string;
  matched: boolean;
}

const SYMBOLS = ['🍎','🍌','🍇','🍓','🍒','🍍','🥝','🍉','🍑','🥑','🍋','🍐'];
const GRID_SIZE = 16; // 4x4
const PAIRS = GRID_SIZE / 2; // 8

export default function MemoryMatchGame() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matchedIds, setMatchedIds] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [score, setScore] = useState(0);

  const { submitScore, checkRewardEligibility, playerStats } = useGame();
  const { wallet } = useWallet();

  // Generate deck
  const generateDeck = useCallback((): MemoryCard[] => {
    const selected = SYMBOLS.slice(0, PAIRS);
    const deckSymbols = [...selected, ...selected].sort(() => Math.random() - 0.5);
    return deckSymbols.map((sym, idx) => ({ id: idx, symbol: sym, matched: false }));
  }, []);

  const startGame = () => {
    setCards(generateDeck());
    setFlipped([]);
    setMatchedIds(new Set());
    setMoves(0);
    setTime(0);
    setScore(0);
    setGameState('PLAYING');
  };

  // Timer
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const interval = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  // Handle flip
  const onFlip = (index: number) => {
    if (gameState !== 'PLAYING') return;
    if (flipped.includes(index)) return;
    const card = cards[index];
    if (!card || card.matched) return;
    if (flipped.length === 2) return; // wait for resolve
    setFlipped((f) => [...f, index]);
  };

  // Resolve flips
  useEffect(() => {
    if (flipped.length < 2) return;
    const [i, j] = flipped;
    if (i === undefined || j === undefined) return;
    const a = cards[i];
    const b = cards[j];

    setMoves((m) => m + 1);

    if (a && b && a.symbol === b.symbol) {
      // Match
      const newMatched = new Set(matchedIds);
      newMatched.add(a.id);
      newMatched.add(b.id);
      setMatchedIds(newMatched);
      setCards((prev) => prev.map((c, idx) => (idx === i || idx === j ? { ...c, matched: true } : c)));
      setScore((s) => s + 10);
      setFlipped([]);
    } else {
      // No match: brief delay then flip back
      setTimeout(() => setFlipped([]), 700);
      setScore((s) => (s > 0 ? s - 1 : 0));
    }
  }, [flipped, cards, matchedIds]);

  // Check win
  useEffect(() => {
    if (gameState === 'PLAYING' && matchedIds.size === GRID_SIZE) {
      setGameState('GAME_OVER');
      const timePenalty = Math.floor(time / 10); // small penalty for longer games
      const finalScore = Math.max(0, score - timePenalty);
      setScore(finalScore);
      if (wallet.isConnected && finalScore > 0) {
        submitScore('memory', finalScore).catch(console.error);
      }
    }
  }, [matchedIds, gameState, time, score, wallet.isConnected, submitScore]);

  const reward = checkRewardEligibility('memory', score);
  const highScore = playerStats.gameStats.memory?.highScore ?? 0;
  const progress = Math.round((matchedIds.size / GRID_SIZE) * 100);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card className="bg-game-card border-border">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <span className="text-2xl">🧩</span>
            <span>Memory Match</span>
          </CardTitle>
          <div className="flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-1"><Trophy className="h-4 w-4 text-neon-cyan" /><span>Score: {score}</span></div>
            <div className="flex items-center gap-1"><Timer className="h-4 w-4 text-neon-purple" /><span>{time}s</span></div>
            <div className="flex items-center gap-1"><Award className="h-4 w-4 text-neon-pink" /><span>High: {highScore}</span></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {gameState === 'MENU' && (
            <div className="text-center space-y-6">
              <p className="text-muted-foreground max-w-md mx-auto">Flip cards to find pairs. Fewer moves and faster time yield better scores.</p>
              {reward.tokens > 0 && (
                <Badge className="bg-gradient-to-r from-neon-cyan to-neon-purple">
                  <Zap className="h-3 w-3 mr-1" />Potential reward: {reward.tokens} tokens
                </Badge>
              )}
              <Button onClick={startGame} className="bg-gradient-to-r from-neon-cyan to-neon-purple" size="lg">
                <Play className="h-4 w-4 mr-2" /> Start Game
              </Button>
            </div>
          )}

          {gameState !== 'MENU' && (
            <>
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <div className="text-xs text-muted-foreground text-center">Matched {matchedIds.size / 2}/{PAIRS} pairs • Moves: {moves}</div>
              </div>
              <div className="grid grid-cols-4 gap-3 max-w-lg mx-auto">
                {cards.map((card, idx) => {
                  const isFlipped = flipped.includes(idx) || card.matched;
                  return (
                    <button
                      key={card.id}
                      onClick={() => onFlip(idx)}
                      className={`aspect-square rounded-lg border border-border flex items-center justify-center text-2xl select-none transition-transform duration-300 ${
                        isFlipped ? 'bg-neon-purple/20 rotate-0' : 'bg-muted rotate-180'
                      } ${card.matched ? 'opacity-70' : ''}`}
                      disabled={card.matched || (flipped.length === 2 && !isFlipped)}
                    >
                      <span className={`${isFlipped ? 'opacity-100' : 'opacity-0'}`}>{card.symbol}</span>
                    </button>
                  );
                })}
              </div>

              {gameState === 'GAME_OVER' && (
                <div className="text-center space-y-4">
                  {wallet.isConnected && (
                    <div className="space-y-2">
                      {reward.tokens > 0 && (
                        <Badge className="bg-gradient-to-r from-neon-cyan to-neon-purple">
                          <Zap className="h-3 w-3 mr-1" />Earned {reward.tokens} tokens
                        </Badge>
                      )}
                      {reward.badge && (
                        <Badge className="bg-gradient-to-r from-neon-pink to-neon-purple">🏆 {reward.badge}</Badge>
                      )}
                    </div>
                  )}
                  <Button onClick={startGame} className="bg-gradient-to-r from-neon-cyan to-neon-purple">
                    <RotateCcw className="h-4 w-4 mr-2" /> Play Again
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
