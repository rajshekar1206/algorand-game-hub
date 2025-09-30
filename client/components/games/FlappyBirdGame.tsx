import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/contexts/GameContext';
import { useWallet } from '@/contexts/WalletContext';
import { Play, RotateCcw, Trophy, Zap, Feather } from 'lucide-react';

const W = 400;
const H = 600;

export default function FlappyBirdGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loopRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [birdY, setBirdY] = useState(H / 2);
  const [vel, setVel] = useState(0);
  const [pipes, setPipes] = useState<{ x: number; gapY: number }[]>([]);

  const { submitScore, checkRewardEligibility, playerStats } = useGame();
  const { wallet } = useWallet();

  const highScore = playerStats.gameStats.flappy?.highScore ?? 0;
  const gravity = 0.5;
  const jump = -7.5;
  const speed = 2.5;
  const gap = 140;
  const pipeWidth = 60;

  const reset = useCallback(() => {
    setBirdY(H / 2);
    setVel(0);
    setScore(0);
    setPipes([
      { x: W + 200, gapY: 200 + Math.random() * 150 - 75 },
      { x: W + 200 + 200, gapY: 200 + Math.random() * 150 - 75 },
      { x: W + 200 + 400, gapY: 200 + Math.random() * 150 - 75 },
    ]);
  }, []);

  const start = () => {
    reset();
    setPlaying(true);
  };

  const gameOver = useCallback(() => {
    setPlaying(false);
    if (wallet.isConnected && score > 0) {
      submitScore('flappy', score).catch(console.error);
    }
  }, [wallet.isConnected, score, submitScore]);

  const flap = () => {
    if (!playing) return;
    setVel(jump);
  };

  // Input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!playing) start(); else flap();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [playing]);

  // Loop
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const tick = () => {
      // physics
      setVel((v) => v + gravity);
      setBirdY((y) => y + vel);
      setPipes((pp) => pp.map(p => ({ ...p, x: p.x - speed })));

      // pipe recycle and scoring
      setPipes((pp) => {
        let arr = pp;
        if (pp.length && pp[0].x + pipeWidth < 0) {
          arr = pp.slice(1).concat({ x: (pp[pp.length-1]?.x ?? W) + 200, gapY: 200 + Math.random() * 150 - 75 });
        }
        return arr;
      });

      // score when passing pipe
      setPipes((pp) => {
        const first = pp[0];
        if (first && Math.abs(first.x + pipeWidth - (W/4)) < speed + 0.5) {
          setScore((s) => s + 1);
        }
        return pp;
      });

      // collision
      setPipes((pp) => {
        const bx = W/4;
        const by = birdY;
        for (const p of pp) {
          if (bx > p.x && bx < p.x + pipeWidth) {
            if (by < p.gapY - gap/2 || by > p.gapY + gap/2) {
              gameOver();
              break;
            }
          }
        }
        if (by < 0 || by > H) gameOver();
        return pp;
      });

      // render
      ctx.fillStyle = '#0b1020';
      ctx.fillRect(0, 0, W, H);

      // pipes
      ctx.fillStyle = '#34d399';
      for (const p of pipes) {
        ctx.fillRect(p.x, 0, pipeWidth, p.gapY - gap/2);
        ctx.fillRect(p.x, p.gapY + gap/2, pipeWidth, H - (p.gapY + gap/2));
      }

      // bird
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.arc(W/4, birdY, 12, 0, Math.PI*2);
      ctx.fill();

      loopRef.current = requestAnimationFrame(tick);
    };

    if (playing) {
      loopRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
      loopRef.current = null;
    };
  }, [playing, birdY, pipes, vel, gravity, speed, gap, pipeWidth, gameOver]);

  const reward = checkRewardEligibility('flappy', score);

  return (
    <div className="max-w-xl mx-auto p-4">
      <Card className="bg-game-card border-border">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Feather className="h-6 w-6 text-neon-cyan" />
            <span>Flappy Bird</span>
          </CardTitle>
          <div className="flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-1"><Trophy className="h-4 w-4 text-neon-cyan" /><span>Score: {score}</span></div>
            <div className="flex items-center gap-1"><Trophy className="h-4 w-4 text-neon-purple" /><span>High: {highScore}</span></div>
            {reward.tokens > 0 && (
              <Badge className="bg-gradient-to-r from-neon-cyan to-neon-purple"><Zap className="h-3 w-3 mr-1"/>+{reward.tokens}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center"><canvas ref={canvasRef} width={W} height={H} className="rounded-lg border border-border bg-game-bg" onClick={()=> playing? flap(): start()} /></div>
          {!playing ? (
            <div className="text-center space-y-2">
              <Button onClick={start} size="lg" className="bg-gradient-to-r from-neon-cyan to-neon-purple"><Play className="h-4 w-4 mr-2"/>Start</Button>
              <div className="text-xs text-muted-foreground">Click or press Space to flap. Pass pipes to score.</div>
            </div>
          ) : (
            <div className="text-center">
              <Button onClick={()=>{reset(); setPlaying(false);}} variant="outline"><RotateCcw className="h-4 w-4 mr-2"/>Reset</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
