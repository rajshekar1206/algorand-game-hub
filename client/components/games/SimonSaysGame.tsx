import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/contexts/GameContext';
import { useWallet } from '@/contexts/WalletContext';
import { Play, RotateCcw, Trophy, Zap, Waves } from 'lucide-react';

type GameState = 'MENU' | 'SHOW' | 'INPUT' | 'GAME_OVER';

const pads = [
  { id: 0, color: 'bg-red-500' },
  { id: 1, color: 'bg-green-500' },
  { id: 2, color: 'bg-blue-500' },
  { id: 3, color: 'bg-yellow-400' },
];

export default function SimonSaysGame() {
  const [sequence, setSequence] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [state, setState] = useState<GameState>('MENU');
  const [score, setScore] = useState(0);

  const { submitScore, checkRewardEligibility, playerStats } = useGame();
  const { wallet } = useWallet();

  const highScore = playerStats.gameStats.simon?.highScore ?? 0;

  const start = () => {
    setSequence([Math.floor(Math.random()*4)]);
    setStep(0);
    setScore(0);
    setState('SHOW');
  };

  useEffect(() => {
    if (state !== 'SHOW') return;
    const delay = 700;
    let i = 0;
    const showNext = () => {
      if (i >= sequence.length) { setActive(null); setState('INPUT'); return; }
      setActive(sequence[i]);
      setTimeout(()=>{ setActive(null); i++; setTimeout(showNext, 250); }, 400);
    };
    setTimeout(showNext, 300);
  }, [state, sequence]);

  const press = (id: number) => {
    if (state !== 'INPUT') return;
    if (sequence[step] === id) {
      setStep(step+1);
      if (step+1 === sequence.length) {
        const next = [...sequence, Math.floor(Math.random()*4)];
        setSequence(next);
        setStep(0);
        setScore(next.length);
        setState('SHOW');
      }
    } else {
      setState('GAME_OVER');
      if (wallet.isConnected && score > 0) submitScore('simon', score).catch(console.error);
    }
  };

  const reward = checkRewardEligibility('simon', score);

  return (
    <div className="max-w-md mx-auto p-4">
      <Card className="bg-game-card border-border">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2"><Waves className="h-6 w-6 text-neon-cyan"/>Simon Says</CardTitle>
          <div className="flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-1"><Trophy className="h-4 w-4 text-neon-cyan"/><span>Score: {score}</span></div>
            <div className="flex items-center gap-1"><Trophy className="h-4 w-4 text-neon-purple"/><span>High: {highScore}</span></div>
            {reward.tokens>0 && <Badge className="bg-gradient-to-r from-neon-cyan to-neon-purple"><Zap className="h-3 w-3 mr-1"/>+{reward.tokens}</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {state === 'MENU' && (
            <div className="text-center space-y-2">
              <Button onClick={start} size="lg" className="bg-gradient-to-r from-neon-cyan to-neon-purple"><Play className="h-4 w-4 mr-2"/>Start</Button>
            </div>
          )}
          {(state === 'SHOW' || state === 'INPUT') && (
            <div className="grid grid-cols-2 gap-3">
              {pads.map(p => (
                <button key={p.id} onClick={()=> press(p.id)} className={`aspect-square rounded-lg ${p.color} ${active===p.id? 'brightness-125':'brightness-100'} transition`}></button>
              ))}
            </div>
          )}
          {state === 'GAME_OVER' && (
            <div className="text-center space-y-2">
              <div className="text-xl font-bold">Game Over</div>
              <Button onClick={start} className="bg-gradient-to-r from-neon-cyan to-neon-purple"><RotateCcw className="h-4 w-4 mr-2"/>Play Again</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
