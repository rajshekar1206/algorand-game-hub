import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/contexts/GameContext';
import { useWallet } from '@/contexts/WalletContext';
import { Play, RotateCcw, Trophy, Zap, Sword, Swords, Sparkles } from 'lucide-react';

type GameState = 'MENU' | 'PLAYING' | 'GAME_OVER';
type Choice = 'rock' | 'paper' | 'scissors';
type Result = 'win' | 'lose' | 'draw';

type Difficulty = 'easy' | 'medium' | 'hard';

const CHOICES: Choice[] = ['rock', 'paper', 'scissors'];

const beats = (a: Choice, b: Choice): boolean =>
  (a === 'rock' && b === 'scissors') || (a === 'paper' && b === 'rock') || (a === 'scissors' && b === 'paper');

export default function RockPaperScissorsGame() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [aiChoice, setAiChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [rounds, setRounds] = useState(0);

  const { submitScore, checkRewardEligibility, playerStats } = useGame();
  const { wallet } = useWallet();

  const highScore = playerStats.gameStats.rps?.highScore ?? 0;

  const aiPick = useCallback((playerLast?: Choice | null): Choice => {
    const rand = Math.random();
    if (difficulty === 'easy') {
      // 10% chance to throw the losing choice intentionally
      if (playerLast && rand < 0.1) {
        if (playerLast === 'rock') return 'scissors';
        if (playerLast === 'paper') return 'rock';
        return 'paper';
      }
    }
    if (difficulty === 'hard') {
      // 35% chance to counter player's last choice
      if (playerLast && rand < 0.35) {
        if (playerLast === 'rock') return 'paper';
        if (playerLast === 'paper') return 'scissors';
        return 'rock';
      }
    }
    // Default random
    return CHOICES[Math.floor(Math.random() * CHOICES.length)];
  }, [difficulty]);

  const playRound = (choice: Choice) => {
    if (gameState !== 'PLAYING') return;
    const enemy = aiPick(choice);
    setPlayerChoice(choice);
    setAiChoice(enemy);

    let r: Result = 'draw';
    if (choice === enemy) r = 'draw';
    else if (beats(choice, enemy)) r = 'win';
    else r = 'lose';

    setResult(r);
    setRounds((n) => n + 1);

    if (r === 'win') {
      setScore((s) => s + (difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3));
      setStreak((st) => st + 1);
    } else if (r === 'lose') {
      setStreak(0);
    }
  };

  const startGame = () => {
    setGameState('PLAYING');
    setPlayerChoice(null);
    setAiChoice(null);
    setResult(null);
    setScore(0);
    setStreak(0);
    setRounds(0);
  };

  const finishGame = () => {
    setGameState('GAME_OVER');
    if (wallet.isConnected && score > 0) {
      submitScore('rps', score, difficulty).catch(console.error);
    }
  };

  const reward = checkRewardEligibility('rps', score);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="bg-game-card border-border">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Swords className="h-6 w-6 text-neon-cyan" />
            <span>Rock – Paper – Scissors</span>
          </CardTitle>
          <div className="flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-1"><Trophy className="h-4 w-4 text-neon-cyan" /><span>Score: {score}</span></div>
            <div className="flex items-center gap-1"><Sparkles className="h-4 w-4 text-neon-pink" /><span>Streak: {streak}</span></div>
            <div className="flex items-center gap-1"><Trophy className="h-4 w-4 text-neon-purple" /><span>High: {highScore}</span></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {gameState === 'MENU' && (
            <div className="text-center space-y-6">
              <p className="text-muted-foreground max-w-md mx-auto">Beat the AI. Build win streaks for bonus rewards.</p>
              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty</label>
                <div className="flex justify-center gap-2">
                  {(['easy','medium','hard'] as Difficulty[]).map((d) => (
                    <Button key={d} variant={difficulty===d? 'default':'outline'} onClick={()=>setDifficulty(d)} className={difficulty===d? 'bg-gradient-to-r from-neon-cyan to-neon-purple':''}>
                      {d.charAt(0).toUpperCase()+d.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
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

          {gameState === 'PLAYING' && (
            <div className="space-y-6">
              <div className="text-center text-sm text-muted-foreground">Make your choice</div>
              <div className="flex justify-center gap-3">
                {CHOICES.map((c) => (
                  <Button key={c} variant="outline" className="h-20 w-24 text-lg" onClick={()=>playRound(c)}>
                    {c === 'rock' && '🪨 Rock'}
                    {c === 'paper' && '📄 Paper'}
                    {c === 'scissors' && '✂️ Scissors'}
                  </Button>
                ))}
              </div>

              {result && (
                <div className="text-center space-y-2">
                  <div className="text-muted-foreground">You chose <b>{playerChoice}</b> • AI chose <b>{aiChoice}</b></div>
                  {result === 'win' && <div className="text-green-400 font-semibold">You win this round!</div>}
                  {result === 'lose' && <div className="text-red-400 font-semibold">You lose this round</div>}
                  {result === 'draw' && <div className="text-yellow-400 font-semibold">It's a draw</div>}
                </div>
              )}

              <div className="flex justify-center gap-2">
                <Button onClick={finishGame} variant="outline">Finish</Button>
                <Button onClick={startGame} className="bg-gradient-to-r from-neon-cyan to-neon-purple">
                  <RotateCcw className="h-4 w-4 mr-2" /> Reset
                </Button>
              </div>

              <div className="text-center text-xs text-muted-foreground">Wins give 1/2/3 points for Easy/Medium/Hard. Build streaks for badge eligibility.</div>
            </div>
          )}

          {gameState === 'GAME_OVER' && (
            <div className="text-center space-y-4">
              <div className="text-2xl font-bold">Game Over</div>
              {wallet.isConnected && (
                <div className="space-y-2">
                  {reward.tokens > 0 && (
                    <Badge className="bg-gradient-to-r from-neon-cyan to-neon-purple"><Zap className="h-3 w-3 mr-1" /> Earned {reward.tokens} tokens</Badge>
                  )}
                </div>
              )}
              <Button onClick={startGame} className="bg-gradient-to-r from-neon-cyan to-neon-purple">
                <Play className="h-4 w-4 mr-2" /> Play Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
