import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/contexts/GameContext';
import { useWallet } from '@/contexts/WalletContext';
import { Play, RotateCcw, Trophy, Zap, Square } from 'lucide-react';

type Grid = number[][];

const emptyGrid = (): Grid => Array.from({ length: 4 }, () => Array(4).fill(0));

const addRandom = (g: Grid) => {
  const empty: [number, number][] = [];
  for (let r=0;r<4;r++) for (let c=0;c<4;c++) if (!g[r][c]) empty.push([r,c]);
  if (!empty.length) return g;
  const [r,c] = empty[Math.floor(Math.random()*empty.length)];
  g[r][c] = Math.random() < 0.9 ? 2 : 4;
  return g;
};

const rotate = (g: Grid): Grid => {
  const n = 4; const out = emptyGrid();
  for (let r=0;r<n;r++) for (let c=0;c<n;c++) out[c][n-1-r] = g[r][c];
  return out;
};

const slideLeft = (row: number[]) => {
  const newRow = row.filter(v=>v!==0);
  for (let i=0;i<newRow.length-1;i++) {
    if (newRow[i] === newRow[i+1]) { newRow[i]*=2; newRow.splice(i+1,1); }
  }
  while (newRow.length<4) newRow.push(0);
  return newRow;
};

export default function Game2048() {
  const [grid, setGrid] = useState<Grid>(addRandom(addRandom(emptyGrid())));
  const [score, setScore] = useState(0);
  const [playing, setPlaying] = useState(false);
  const { submitScore, checkRewardEligibility, playerStats } = useGame();
  const { wallet } = useWallet();

  const highScore = playerStats.gameStats.game2048?.highScore ?? 0;

  const makeMove = (dir: 'left'|'right'|'up'|'down') => {
    let g = grid.map(row=> [...row]);
    // rotate grid to reuse left slide
    if (dir === 'up') { g = rotate(rotate(rotate(g))); }
    if (dir === 'right') { g = rotate(rotate(g)); }
    if (dir === 'down') { g = rotate(g); }
    const before = JSON.stringify(g);
    g = g.map(row => slideLeft(row));
    if (JSON.stringify(g) === before) return;
    // rotate back
    if (dir === 'up') { g = rotate(g); }
    if (dir === 'right') { g = rotate(rotate(g)); }
    if (dir === 'down') { g = rotate(rotate(rotate(g))); }
    g = addRandom(g);
    setGrid(g);
    let s = 0; for (let r=0;r<4;r++) for (let c=0;c<4;c++) s += g[r][c];
    setScore(s);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!playing) return;
      if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','a','d','w','s','A','D','W','S'].includes(e.key)) e.preventDefault();
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') makeMove('left');
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') makeMove('right');
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') makeMove('up');
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') makeMove('down');
    };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  }, [playing, grid]);

  const start = () => {
    setGrid(addRandom(addRandom(emptyGrid())));
    setScore(0);
    setPlaying(true);
  };

  const end = () => {
    setPlaying(false);
    const maxTile = Math.max(...grid.flat());
    if (wallet.isConnected && maxTile>0) submitScore('game2048', maxTile).catch(console.error);
  };

  const reward = checkRewardEligibility('game2048', Math.max(...grid.flat()));

  const tileClass = (v: number) => {
    const map: Record<number,string> = {
      0: 'bg-muted text-transparent', 2:'bg-gray-700',4:'bg-gray-600',8:'bg-amber-600',16:'bg-amber-500',32:'bg-orange-500',64:'bg-orange-600',128:'bg-pink-500',256:'bg-pink-600',512:'bg-purple-500',1024:'bg-purple-600',2048:'bg-green-600'
    };
    return map[v] || 'bg-green-700';
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <Card className="bg-game-card border-border">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2"><Square className="h-6 w-6 text-neon-cyan"/>2048</CardTitle>
          <div className="flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-1"><Trophy className="h-4 w-4 text-neon-cyan"/><span>Score: {score}</span></div>
            <div className="flex items-center gap-1"><Trophy className="h-4 w-4 text-neon-purple"/><span>High: {highScore}</span></div>
            {reward.tokens>0 && <Badge className="bg-gradient-to-r from-neon-cyan to-neon-purple"><Zap className="h-3 w-3 mr-1"/>+{reward.tokens}</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto select-none">
            {grid.map((row,r)=> row.map((v,c)=> (
              <div key={`${r}-${c}`} className={`aspect-square rounded-lg border border-border flex items-center justify-center font-bold text-xl ${tileClass(v)}`}>{v||''}</div>
            )))}
          </div>
          {!playing ? (
            <div className="text-center space-x-2">
              <Button onClick={start} size="lg" className="bg-gradient-to-r from-neon-cyan to-neon-purple"><Play className="h-4 w-4 mr-2"/>Start</Button>
            </div>
          ) : (
            <div className="text-center space-x-2">
              <Button onClick={end} variant="outline">Finish</Button>
              <Button onClick={start} className="bg-gradient-to-r from-neon-cyan to-neon-purple"><RotateCcw className="h-4 w-4 mr-2"/>Reset</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
