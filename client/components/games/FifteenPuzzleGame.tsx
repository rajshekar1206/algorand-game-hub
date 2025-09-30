import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/contexts/GameContext';
import { useWallet } from '@/contexts/WalletContext';
import { Play, RotateCcw, Trophy, Zap, Grid2X2 } from 'lucide-react';

type Board = number[]; // 0 is empty

const GOAL: Board = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0];

const isSolvable = (b: Board) => {
  let inv = 0;
  for (let i=0;i<16;i++) for (let j=i+1;j<16;j++) if (b[i] && b[j] && b[i] > b[j]) inv++;
  const rowFromBottom = 4 - Math.floor(b.indexOf(0) / 4);
  return (rowFromBottom % 2 === 0) ? (inv % 2 === 1) : (inv % 2 === 0);
};

const shuffleSolvable = (): Board => {
  let arr = [...GOAL];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  if (!isSolvable(arr)) {
    [arr[0], arr[1]] = [arr[1], arr[0]];
  }
  return arr;
};

export default function FifteenPuzzleGame() {
  const [board, setBoard] = useState<Board>(shuffleSolvable());
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [playing, setPlaying] = useState(false);
  const { submitScore, checkRewardEligibility, playerStats } = useGame();
  const { wallet } = useWallet();

  const highScore = playerStats.gameStats.puzzle15?.highScore ?? 0;

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(()=> setSeconds(s=> s+1), 1000);
    return ()=> clearInterval(t);
  }, [playing]);

  const canMove = (idx: number) => {
    const empty = board.indexOf(0);
    const r1 = Math.floor(idx/4), c1 = idx%4;
    const r2 = Math.floor(empty/4), c2 = empty%4;
    return (r1 === r2 && Math.abs(c1 - c2) === 1) || (c1 === c2 && Math.abs(r1 - r2) === 1);
  };

  const move = (idx: number) => {
    if (!playing || !canMove(idx)) return;
    const empty = board.indexOf(0);
    const newBoard = [...board];
    [newBoard[idx], newBoard[empty]] = [newBoard[empty], newBoard[idx]];
    setBoard(newBoard);
    setMoves(m=>m+1);
    if (newBoard.every((v,i)=> v===GOAL[i])) finish(newBoard);
  };

  const start = () => {
    setBoard(shuffleSolvable());
    setMoves(0);
    setSeconds(0);
    setPlaying(true);
  };

  const finish = (b: Board) => {
    setPlaying(false);
    const timeBonus = Math.max(0, 300 - seconds); // faster is better
    const score = Math.max(0, 400 + timeBonus - moves*5);
    if (wallet.isConnected && score > 0) submitScore('puzzle15', score).catch(console.error);
  };

  const reward = checkRewardEligibility('puzzle15', Math.max(0, 400 + Math.max(0, 300 - seconds) - moves*5));

  return (
    <div className="max-w-xl mx-auto p-4">
      <Card className="bg-game-card border-border">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2"><Grid2X2 className="h-6 w-6 text-neon-cyan"/>15 Puzzle</CardTitle>
          <div className="flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-1"><Trophy className="h-4 w-4 text-neon-cyan"/><span>Moves: {moves}</span></div>
            <div className="flex items-center gap-1"><Trophy className="h-4 w-4 text-neon-purple"/><span>Time: {seconds}s</span></div>
            <div className="flex items-center gap-1"><Trophy className="h-4 w-4 text-neon-pink"/><span>High: {highScore}</span></div>
            {reward.tokens>0 && <Badge className="bg-gradient-to-r from-neon-cyan to-neon-purple"><Zap className="h-3 w-3 mr-1"/>+{reward.tokens}</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
            {board.map((v, idx)=> (
              <button key={idx} onClick={()=> move(idx)} disabled={!playing}
                className={`aspect-square rounded-lg border border-border flex items-center justify-center text-xl ${v===0? 'bg-muted/30 text-muted-foreground':'bg-muted hover:border-neon-cyan/50'} ${canMove(idx)? '':'opacity-70'}`}>
                {v!==0? v: ''}
              </button>
            ))}
          </div>
          {!playing ? (
            <div className="text-center">
              <Button onClick={start} size="lg" className="bg-gradient-to-r from-neon-cyan to-neon-purple"><Play className="h-4 w-4 mr-2"/>Start</Button>
            </div>
          ) : (
            <div className="text-center">
              <Button onClick={()=> setPlaying(false)} variant="outline"><RotateCcw className="h-4 w-4 mr-2"/>Pause</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
