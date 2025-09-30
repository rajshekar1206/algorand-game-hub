import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/contexts/GameContext';
import { useWallet } from '@/contexts/WalletContext';
import { Play, RotateCcw, Trophy, Zap, Grid3X3 } from 'lucide-react';

type Cell = { value: number; fixed: boolean };

type Grid = Cell[][];

const puzzles: number[][] = [
  // 0 means empty; simple preset puzzle
  [0,0,0,2,6,0,7,0,1, 6,8,0,0,7,0,0,9,0, 1,9,0,0,0,4,5,0,0, 8,2,0,1,0,0,0,4,0, 0,0,4,6,0,2,9,0,0, 0,5,0,0,0,3,0,2,8, 0,0,9,3,0,0,0,7,4, 0,4,0,0,5,0,0,3,6, 7,0,3,0,1,8,0,0,0],
];

const chunk = (arr: any[], size: number) => Array.from({length: Math.ceil(arr.length/size)}, (_,i)=> arr.slice(i*size, i*size+size));

const toGrid = (nums: number[]): Grid => chunk(nums, 9).map(row => row.map(n => ({ value: n, fixed: n!==0 })));

const isValid = (g: Grid, r: number, c: number, v: number) => {
  for (let i=0;i<9;i++) if (g[r][i].value===v || g[i][c].value===v) return false;
  const br = Math.floor(r/3)*3, bc = Math.floor(c/3)*3;
  for (let i=0;i<3;i++) for (let j=0;j<3;j++) if (g[br+i][bc+j].value===v) return false;
  return true;
};

export default function SudokuGame() {
  const [grid, setGrid] = useState<Grid>(toGrid(puzzles[0]));
  const [selected, setSelected] = useState<[number,number]|null>(null);
  const [startTs, setStartTs] = useState<number|null>(null);
  const [finished, setFinished] = useState(false);
  const { submitScore, checkRewardEligibility, playerStats } = useGame();
  const { wallet } = useWallet();

  const time = startTs ? Math.floor((Date.now()-startTs)/1000) : 0;
  const highScore = playerStats.gameStats.sudoku?.highScore ?? 0;

  const start = () => {
    setGrid(toGrid(puzzles[0]));
    setSelected(null);
    setStartTs(Date.now());
    setFinished(false);
  };

  const setCell = (r: number, c: number, v: number) => {
    setGrid((g) => g.map((row, ri) => row.map((cell, ci) => (ri===r && ci===c? { ...cell, value: v }: cell))));
  };

  const handleKey = (e: KeyboardEvent) => {
    if (!selected || finished) return;
    const [r,c] = selected;
    if (grid[r][c].fixed) return;
    if (e.key>='1' && e.key<='9') {
      const v = parseInt(e.key,10);
      if (isValid(grid, r, c, v)) setCell(r,c,v);
    }
    if (e.key==='Backspace' || e.key==='Delete' || e.key==='0') setCell(r,c,0);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return ()=> window.removeEventListener('keydown', handleKey);
  });

  useEffect(() => {
    if (grid.every(row=> row.every(c=> c.value!==0))) {
      setFinished(true);
      const score = Math.max(0, 500 - time);
      if (wallet.isConnected && score>0) submitScore('sudoku', score).catch(console.error);
    }
  }, [grid, time, wallet.isConnected, submitScore]);

  const reward = checkRewardEligibility('sudoku', Math.max(0, 500 - time));

  return (
    <div className="max-w-xl mx-auto p-4">
      <Card className="bg-game-card border-border">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2"><Grid3X3 className="h-6 w-6 text-neon-cyan"/>Sudoku</CardTitle>
          <div className="flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-1"><Trophy className="h-4 w-4 text-neon-cyan"/><span>Time: {time}s</span></div>
            <div className="flex items-center gap-1"><Trophy className="h-4 w-4 text-neon-purple"/><span>High: {highScore}</span></div>
            {reward.tokens>0 && <Badge className="bg-gradient-to-r from-neon-cyan to-neon-purple"><Zap className="h-3 w-3 mr-1"/>+{reward.tokens}</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-9 gap-1 max-w-2xl mx-auto">
            {grid.map((row, r)=> row.map((cell, c)=> (
              <button key={`${r}-${c}`} onClick={()=> setSelected([r,c])}
                className={`h-9 w-9 md:h-12 md:w-12 border ${cell.fixed? 'bg-muted/40':'bg-background'} ${selected && selected[0]===r && selected[1]===c? 'border-neon-cyan':'border-border'}`}>
                {cell.value || ''}
              </button>
            )))}
          </div>
          <div className="text-center space-x-2">
            <Button onClick={start} size="lg" className="bg-gradient-to-r from-neon-cyan to-neon-purple"><Play className="h-4 w-4 mr-2"/>Start</Button>
            {finished && <Button onClick={start} variant="outline"><RotateCcw className="h-4 w-4 mr-2"/>Restart</Button>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
