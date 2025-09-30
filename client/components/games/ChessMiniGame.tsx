import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/contexts/GameContext';
import { useWallet } from '@/contexts/WalletContext';
import { Play, RotateCcw, Trophy, Zap, Crown } from 'lucide-react';

type Piece = { t: 'p'|'r'|'n'|'b'|'q'|'k'; c: 'w'|'b' } | null;

type Board = Piece[][];

const startBoard: Board = [
  [{t:'r',c:'b'},{t:'n',c:'b'},{t:'b',c:'b'},{t:'q',c:'b'},{t:'k',c:'b'},{t:'b',c:'b'},{t:'n',c:'b'},{t:'r',c:'b'}],
  Array(8).fill(null).map(()=> ({t:'p',c:'b'})) as Piece[],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  Array(8).fill(null).map(()=> ({t:'p',c:'w'})) as Piece[],
  [{t:'r',c:'w'},{t:'n',c:'w'},{t:'b',c:'w'},{t:'q',c:'w'},{t:'k',c:'w'},{t:'b',c:'w'},{t:'n',c:'w'},{t:'r',c:'w'}],
];

const inBounds = (r: number,c: number)=> r>=0&&r<8&&c>=0&&c<8;

const dirs = {
  n: [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]],
  r: [[1,0],[-1,0],[0,1],[0,-1]],
  b: [[1,1],[1,-1],[-1,1],[-1,-1]],
  qk: [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]
};

function moves(board: Board, r: number, c: number): [number,number][] {
  const p = board[r][c]; if (!p) return [];
  const out: [number,number][] = [];
  if (p.t === 'p') {
    const dir = p.c==='w' ? -1 : 1;
    const startRow = p.c==='w' ? 6 : 1;
    if (inBounds(r+dir,c) && !board[r+dir][c]) out.push([r+dir,c]);
    if (r===startRow && !board[r+dir][c] && !board[r+2*dir][c]) out.push([r+2*dir,c]);
    for (const dc of [-1,1]) if (inBounds(r+dir,c+dc) && board[r+dir][c+dc] && board[r+dir][c+dc]!.c!==p.c) out.push([r+dir,c+dc]);
  } else if (p.t === 'n') {
    for (const [dr,dc] of dirs.n) { const nr=r+dr,nc=c+dc; if (inBounds(nr,nc) && (!board[nr][nc] || board[nr][nc]!.c!==p.c)) out.push([nr,nc]); }
  } else if (p.t === 'r' || p.t==='b' || p.t==='q') {
    const vecs = p.t==='r'? dirs.r : p.t==='b'? dirs.b : dirs.qk;
    for (const [dr,dc] of vecs) {
      let nr=r+dr,nc=c+dc;
      while (inBounds(nr,nc) && !board[nr][nc]) { out.push([nr,nc]); nr+=dr; nc+=dc; }
      if (inBounds(nr,nc) && board[nr][nc] && board[nr][nc]!.c!==p.c) out.push([nr,nc]);
    }
  } else if (p.t === 'k') {
    for (const [dr,dc] of dirs.qk) { const nr=r+dr,nc=c+dc; if (inBounds(nr,nc) && (!board[nr][nc] || board[nr][nc]!.c!==p.c)) out.push([nr,nc]); }
  }
  return out;
}

export default function ChessMiniGame() {
  const [board, setBoard] = useState<Board>(startBoard.map(row=> row.map(cell=> cell? {...cell}: null)));
  const [turn, setTurn] = useState<'w'|'b'>('w');
  const [sel, setSel] = useState<[number,number]|null>(null);
  const [legal, setLegal] = useState<string>('');
  const { submitScore, checkRewardEligibility, playerStats } = useGame();
  const { wallet } = useWallet();

  const highScore = playerStats.gameStats.chess?.highScore ?? 0;

  useEffect(() => {
    if (sel) {
      const [r,c]=sel; const mv = moves(board,r,c).map(([rr,cc])=> `${rr},${cc}`);
      setLegal(JSON.stringify(mv));
    } else setLegal('');
  }, [sel, board]);

  const click = (r: number, c: number) => {
    const p = board[r][c];
    const list = sel ? JSON.parse(legal) as string[] : [];
    const isLegal = list.includes(`${r},${c}`);
    if (sel && isLegal) {
      const [sr,sc] = sel; const piece = board[sr][sc]!;
      const target = board[r][c];
      const newBoard = board.map(row=> row.slice());
      newBoard[r][c] = piece; newBoard[sr][sc] = null;
      setBoard(newBoard); setSel(null); setTurn(turn==='w'?'b':'w');
      if (target && target.t==='k') {
        const score = 1; // win counts
        if (wallet.isConnected) submitScore('chess', score).catch(console.error);
      }
    } else if (p && p.c===turn) {
      setSel([r,c]);
    } else {
      setSel(null);
    }
  };

  const reward = checkRewardEligibility('chess', 1);

  const pieceChar = (p: Piece) => {
    if (!p) return '';
    const map: Record<string,string> = {
      'pw':'♙','pb':'♟︎','rw':'♖','rb':'♜','nw':'♘','nb':'♞','bw':'♗','bb':'♝','qw':'♕','qb':'♛','kw':'♔','kb':'♚'
    };
    return map[p.t + p.c] || '';
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <Card className="bg-game-card border-border">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2"><Crown className="h-6 w-6 text-neon-cyan"/>Chess Mini</CardTitle>
          <div className="flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-1"><Trophy className="h-4 w-4 text-neon-cyan"/><span>Turn: {turn==='w'? 'White':'Black'}</span></div>
            <div className="flex items-center gap-1"><Trophy className="h-4 w-4 text-neon-purple"/><span>High: {highScore}</span></div>
            {reward.tokens>0 && <Badge className="bg-gradient-to-r from-neon-cyan to-neon-purple"><Zap className="h-3 w-3 mr-1"/>+{reward.tokens}</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-8 gap-1 max-w-sm mx-auto select-none">
            {board.map((row,r)=> row.map((cell,c)=> {
              const selected = sel && sel[0]===r && sel[1]===c;
              const canMove = (sel && (JSON.parse(legal) as string[]).includes(`${r},${c}`));
              return (
                <button key={`${r}-${c}`} onClick={()=> click(r,c)} className={`h-10 w-10 md:h-12 md:w-12 border flex items-center justify-center text-xl ${ (r+c)%2? 'bg-muted':'bg-background'} ${selected? 'border-neon-cyan':'border-border'} ${canMove? 'ring-2 ring-neon-cyan/50':''}`}>{pieceChar(cell)}</button>
              );
            }))}
          </div>
          <div className="text-center">
            <Button onClick={()=> { setBoard(startBoard.map(row=> row.map(cell=> cell? {...cell}: null))); setTurn('w'); setSel(null); }} className="bg-gradient-to-r from-neon-cyan to-neon-purple"><RotateCcw className="h-4 w-4 mr-2"/>Reset</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
