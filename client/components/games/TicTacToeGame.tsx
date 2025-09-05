import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/contexts/GameContext';
import { useWallet } from '@/contexts/WalletContext';
import { 
  Play, 
  RotateCcw, 
  Trophy, 
  Zap,
  User,
  Bot,
  Target
} from 'lucide-react';

type Player = 'X' | 'O' | null;
type GameState = 'MENU' | 'PLAYING' | 'GAME_OVER';
type Difficulty = 'easy' | 'medium' | 'hard';

interface GameStats {
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
}

export default function TicTacToeGame() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameStats, setGameStats] = useState<GameStats>({
    wins: 0,
    losses: 0,
    draws: 0,
    currentStreak: 0
  });
  const [isAiThinking, setIsAiThinking] = useState(false);
  
  const { submitScore, checkRewardEligibility, playerStats } = useGame();
  const { wallet } = useWallet();

  // Load stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('tictactoe_stats');
    if (savedStats) {
      setGameStats(JSON.parse(savedStats));
    }
  }, []);

  // Save stats to localStorage
  const saveStats = useCallback((stats: GameStats) => {
    localStorage.setItem('tictactoe_stats', JSON.stringify(stats));
    setGameStats(stats);
  }, []);

  // Check for winner
  const checkWinner = useCallback((board: Player[]): Player | 'draw' | null => {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    if (board.every(cell => cell !== null)) {
      return 'draw';
    }

    return null;
  }, []);

  // Minimax algorithm for AI
  const minimax = useCallback((board: Player[], depth: number, isMaximizing: boolean, maxDepth: number): number => {
    const winner = checkWinner(board);
    
    if (winner === 'O') return 10 - depth; // AI wins
    if (winner === 'X') return depth - 10; // Player wins
    if (winner === 'draw' || depth >= maxDepth) return 0; // Draw or max depth

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'O';
          const score = minimax(board, depth + 1, false, maxDepth);
          board[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'X';
          const score = minimax(board, depth + 1, true, maxDepth);
          board[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }, [checkWinner]);

  // Get AI move
  const getAiMove = useCallback((board: Player[], difficulty: Difficulty): number => {
    const availableMoves = board.map((cell, index) => cell === null ? index : null).filter(val => val !== null) as number[];
    
    if (availableMoves.length === 0) return -1;

    // Easy: Random move with some strategy
    if (difficulty === 'easy') {
      if (Math.random() < 0.3) {
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
      }
    }

    // Medium: Limited depth minimax
    if (difficulty === 'medium') {
      if (Math.random() < 0.1) {
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
      }
    }

    // Strategic AI move using minimax
    let bestScore = -Infinity;
    let bestMove = availableMoves[0];
    const maxDepth = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 6 : 9;

    for (const move of availableMoves) {
      board[move] = 'O';
      const score = minimax(board, 0, false, maxDepth);
      board[move] = null;
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }, [minimax]);

  // Handle cell click
  const handleCellClick = (index: number) => {
    if (board[index] || gameState !== 'PLAYING' || currentPlayer !== 'X' || isAiThinking) {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const gameResult = checkWinner(newBoard);
    if (gameResult) {
      endGame(gameResult);
      return;
    }

    setCurrentPlayer('O');
  };

  // AI move
  useEffect(() => {
    if (currentPlayer === 'O' && gameState === 'PLAYING' && !winner) {
      setIsAiThinking(true);
      
      // Add delay for better UX
      const timeout = setTimeout(() => {
        const aiMove = getAiMove([...board], difficulty);
        if (aiMove !== -1) {
          const newBoard = [...board];
          newBoard[aiMove] = 'O';
          setBoard(newBoard);

          const gameResult = checkWinner(newBoard);
          if (gameResult) {
            endGame(gameResult);
          } else {
            setCurrentPlayer('X');
          }
        }
        setIsAiThinking(false);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [currentPlayer, gameState, board, difficulty, getAiMove, checkWinner, winner]);

  // End game
  const endGame = (result: Player | 'draw') => {
    setWinner(result);
    setGameState('GAME_OVER');

    // Calculate score and update stats
    let score = 0;
    const newStats = { ...gameStats };

    if (result === 'X') {
      // Player wins
      newStats.wins += 1;
      newStats.currentStreak += 1;
      score = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 3 : 5;
      score += newStats.currentStreak; // Streak bonus
    } else if (result === 'O') {
      // AI wins
      newStats.losses += 1;
      newStats.currentStreak = 0;
    } else {
      // Draw
      newStats.draws += 1;
      score = 1; // Small reward for draw
    }

    saveStats(newStats);

    // Submit score if connected
    if (wallet.isConnected && score > 0) {
      submitScore('tictactoe', score, difficulty).catch(console.error);
    }
  };

  // Start new game
  const startGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setGameState('PLAYING');
    setIsAiThinking(false);
  };

  // Reset all stats
  const resetStats = () => {
    const emptyStats = { wins: 0, losses: 0, draws: 0, currentStreak: 0 };
    saveStats(emptyStats);
  };

  const totalGames = gameStats.wins + gameStats.losses + gameStats.draws;
  const winRate = totalGames > 0 ? Math.round((gameStats.wins / totalGames) * 100) : 0;
  const currentScore = gameStats.wins * 3 + gameStats.draws;
  const reward = checkRewardEligibility('tictactoe', currentScore);
  const highScore = playerStats.gameStats.tictactoe.highScore;

  const renderCell = (index: number) => {
    const value = board[index];
    return (
      <Button
        key={index}
        variant="outline"
        className="aspect-square text-4xl font-bold h-20 w-20 border-border hover:border-neon-cyan/50 transition-all"
        onClick={() => handleCellClick(index)}
        disabled={gameState !== 'PLAYING' || value !== null || currentPlayer !== 'X' || isAiThinking}
      >
        {value === 'X' && <span className="text-neon-cyan">✕</span>}
        {value === 'O' && <span className="text-neon-purple">○</span>}
      </Button>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="bg-game-card border-border">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Target className="h-6 w-6 text-neon-cyan" />
            <span>Tic-Tac-Toe Arena</span>
          </CardTitle>
          <div className="flex justify-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Trophy className="h-4 w-4 text-neon-cyan" />
              <span>Score: {currentScore}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Trophy className="h-4 w-4 text-neon-purple" />
              <span>High: {highScore}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>Win Rate: {winRate}%</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {gameState === 'MENU' && (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Challenge the AI!</h3>
                <p className="text-muted-foreground">
                  Choose your difficulty and test your strategy against AI opponents.
                  Build win streaks for bonus points!
                </p>
                
                {/* Difficulty Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty:</label>
                  <div className="flex justify-center space-x-2">
                    {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                      <Button
                        key={diff}
                        variant={difficulty === diff ? 'default' : 'outline'}
                        onClick={() => setDifficulty(diff)}
                        className={difficulty === diff ? 'bg-gradient-to-r from-neon-cyan to-neon-purple' : ''}
                      >
                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Game Stats */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="p-3 border border-border rounded-lg">
                    <div className="text-green-500 font-bold">{gameStats.wins}</div>
                    <div className="text-muted-foreground">Wins</div>
                  </div>
                  <div className="p-3 border border-border rounded-lg">
                    <div className="text-yellow-500 font-bold">{gameStats.draws}</div>
                    <div className="text-muted-foreground">Draws</div>
                  </div>
                  <div className="p-3 border border-border rounded-lg">
                    <div className="text-red-500 font-bold">{gameStats.losses}</div>
                    <div className="text-muted-foreground">Losses</div>
                  </div>
                </div>

                {gameStats.currentStreak > 0 && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                    🔥 {gameStats.currentStreak} Win Streak!
                  </Badge>
                )}

                {reward.tokens > 0 && (
                  <Badge className="bg-gradient-to-r from-neon-cyan to-neon-purple">
                    <Zap className="h-3 w-3 mr-1" />
                    Current reward: {reward.tokens} tokens
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={startGame} 
                  className="bg-gradient-to-r from-neon-cyan to-neon-purple"
                  size="lg"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Game
                </Button>
                
                {totalGames > 0 && (
                  <Button 
                    onClick={resetStats} 
                    variant="outline"
                    size="sm"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Stats
                  </Button>
                )}
              </div>
            </div>
          )}

          {(gameState === 'PLAYING' || gameState === 'GAME_OVER') && (
            <div className="space-y-6">
              {/* Current Turn Indicator */}
              <div className="text-center">
                {gameState === 'PLAYING' && (
                  <div className="flex items-center justify-center space-x-2">
                    {currentPlayer === 'X' ? (
                      <>
                        <User className="h-5 w-5 text-neon-cyan" />
                        <span>Your turn</span>
                        <span className="text-neon-cyan text-xl font-bold">✕</span>
                      </>
                    ) : (
                      <>
                        <Bot className="h-5 w-5 text-neon-purple" />
                        <span>AI thinking...</span>
                        <span className="text-neon-purple text-xl font-bold">○</span>
                        {isAiThinking && <div className="animate-spin h-4 w-4 border-2 border-neon-purple border-t-transparent rounded-full" />}
                      </>
                    )}
                  </div>
                )}
                
                {gameState === 'GAME_OVER' && (
                  <div className="space-y-2">
                    {winner === 'X' && (
                      <div className="text-green-500 font-bold text-xl">�� You Win!</div>
                    )}
                    {winner === 'O' && (
                      <div className="text-red-500 font-bold text-xl">🤖 AI Wins!</div>
                    )}
                    {winner === 'draw' && (
                      <div className="text-yellow-500 font-bold text-xl">🤝 It's a Draw!</div>
                    )}
                    
                    {winner === 'X' && gameStats.currentStreak > 1 && (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                        🔥 {gameStats.currentStreak} Win Streak!
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Game Board */}
              <div className="flex justify-center">
                <div className="grid grid-cols-3 gap-2 p-4 bg-muted/20 rounded-lg">
                  {Array(9).fill(null).map((_, index) => renderCell(index))}
                </div>
              </div>

              {/* Game Over Actions */}
              {gameState === 'GAME_OVER' && (
                <div className="text-center space-y-4">
                  {wallet.isConnected && winner === 'X' && (
                    <div className="space-y-2">
                      {reward.tokens > 0 && (
                        <Badge className="bg-gradient-to-r from-neon-cyan to-neon-purple">
                          <Zap className="h-3 w-3 mr-1" />
                          Earned tokens this session: {reward.tokens}
                        </Badge>
                      )}
                      {reward.badge && (
                        <Badge className="bg-gradient-to-r from-neon-pink to-neon-purple">
                          🏆 {reward.badge}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="space-x-2">
                    <Button 
                      onClick={startGame} 
                      className="bg-gradient-to-r from-neon-cyan to-neon-purple"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Play Again
                    </Button>
                    <Button 
                      onClick={() => setGameState('MENU')} 
                      variant="outline"
                    >
                      Back to Menu
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>🎯 Get 3 in a row to win • You are ✕, AI is ○</p>
            <p>🏆 Win streaks give bonus points • Higher difficulty = more points</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
