import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/contexts/GameContext';
import { useWallet } from '@/contexts/WalletContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Trophy, 
  Zap,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

const CANVAS_SIZE = 400;
const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 200, y: 200 }];
const INITIAL_DIRECTION: Direction = 'RIGHT';
const GAME_SPEED = 150;

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<NodeJS.Timeout>();
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Position>({ x: 100, y: 100 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  const { submitScore, checkRewardEligibility, playerStats } = useGame();
  const { wallet } = useWallet();

  // Load high score on mount
  useEffect(() => {
    setHighScore(playerStats.gameStats.snake.highScore);
  }, [playerStats.gameStats.snake.highScore]);

  // Generate random food position
  const generateFood = useCallback((): Position => {
    const x = Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)) * GRID_SIZE;
    const y = Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)) * GRID_SIZE;
    return { x, y };
  }, []);

  // Reset game state
  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood());
    setScore(0);
    setGameState('MENU');
  }, [generateFood]);

  // Check collision with walls or self
  const checkCollision = useCallback((head: Position, body: Position[]): boolean => {
    // Wall collision
    if (head.x < 0 || head.x >= CANVAS_SIZE || head.y < 0 || head.y >= CANVAS_SIZE) {
      return true;
    }
    
    // Self collision
    return body.some(segment => segment.x === head.x && segment.y === head.y);
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };

      // Move head based on direction
      switch (direction) {
        case 'UP':
          head.y -= GRID_SIZE;
          break;
        case 'DOWN':
          head.y += GRID_SIZE;
          break;
        case 'LEFT':
          head.x -= GRID_SIZE;
          break;
        case 'RIGHT':
          head.x += GRID_SIZE;
          break;
      }

      // Check collision
      if (checkCollision(head, newSnake)) {
        setGameState('GAME_OVER');
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prevScore => prevScore + 10);
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, checkCollision, generateFood]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING') return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
        case ' ':
          e.preventDefault();
          setGameState('PAUSED');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameState]);

  // Game loop effect
  useEffect(() => {
    if (gameState === 'PLAYING') {
      gameLoopRef.current = setInterval(gameLoop, GAME_SPEED);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState, gameLoop]);

  // Handle game over
  useEffect(() => {
    if (gameState === 'GAME_OVER' && wallet.isConnected) {
      if (score > highScore) {
        setHighScore(score);
      }
      
      // Submit score to context
      submitScore('snake', score).catch(console.error);
    }
  }, [gameState, score, highScore, wallet.isConnected, submitScore]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw grid
    ctx.strokeStyle = '#16213e';
    ctx.lineWidth = 1;
    for (let i = 0; i <= CANVAS_SIZE; i += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_SIZE);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_SIZE, i);
      ctx.stroke();
    }

    // Draw snake
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#4ade80' : '#22c55e'; // Head is brighter
      ctx.fillRect(segment.x, segment.y, GRID_SIZE - 2, GRID_SIZE - 2);
      
      // Add glow effect to head
      if (index === 0) {
        ctx.shadowColor = '#4ade80';
        ctx.shadowBlur = 10;
        ctx.fillRect(segment.x, segment.y, GRID_SIZE - 2, GRID_SIZE - 2);
        ctx.shadowBlur = 0;
      }
    });

    // Draw food
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 15;
    ctx.fillRect(food.x, food.y, GRID_SIZE - 2, GRID_SIZE - 2);
    ctx.shadowBlur = 0;

  }, [snake, food]);

  const startGame = () => {
    resetGame();
    setGameState('PLAYING');
  };

  const pauseGame = () => {
    setGameState('PAUSED');
  };

  const resumeGame = () => {
    setGameState('PLAYING');
  };

  const reward = checkRewardEligibility('snake', score);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="bg-game-card border-border">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <span className="text-2xl">🐍</span>
            <span>Snake Challenge</span>
          </CardTitle>
          <div className="flex justify-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Trophy className="h-4 w-4 text-neon-cyan" />
              <span>Score: {score}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Trophy className="h-4 w-4 text-neon-purple" />
              <span>High: {highScore}</span>
            </div>
            {reward.tokens > 0 && (
              <Badge className="bg-gradient-to-r from-neon-cyan to-neon-purple">
                <Zap className="h-3 w-3 mr-1" />
                +{reward.tokens} tokens
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Game Canvas */}
          <div className="flex justify-center">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className="border border-border rounded-lg bg-game-bg"
              />
              
              {/* Game State Overlays */}
              {gameState === 'MENU' && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-xl font-bold mb-4">Snake Challenge</h3>
                    <p className="mb-4 text-sm opacity-80">Use arrow keys or WASD to move</p>
                    <Button onClick={startGame} className="bg-gradient-to-r from-neon-cyan to-neon-purple">
                      <Play className="h-4 w-4 mr-2" />
                      Start Game
                    </Button>
                  </div>
                </div>
              )}
              
              {gameState === 'PAUSED' && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-xl font-bold mb-4">Paused</h3>
                    <Button onClick={resumeGame} className="bg-gradient-to-r from-neon-cyan to-neon-purple">
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </Button>
                  </div>
                </div>
              )}
              
              {gameState === 'GAME_OVER' && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-xl font-bold mb-2">Game Over!</h3>
                    <p className="mb-2">Final Score: {score}</p>
                    {score > 0 && wallet.isConnected && (
                      <div className="mb-4">
                        {reward.tokens > 0 && (
                          <Badge className="bg-gradient-to-r from-neon-cyan to-neon-purple mb-2">
                            <Zap className="h-3 w-3 mr-1" />
                            Earned {reward.tokens} tokens!
                          </Badge>
                        )}
                        {reward.badge && (
                          <Badge className="bg-gradient-to-r from-neon-pink to-neon-purple">
                            🏆 {reward.badge}
                          </Badge>
                        )}
                      </div>
                    )}
                    <Button onClick={startGame} className="bg-gradient-to-r from-neon-cyan to-neon-purple">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Play Again
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Game Controls */}
          <div className="flex justify-center space-x-4">
            {gameState === 'PLAYING' && (
              <Button onClick={pauseGame} variant="outline">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            
            {gameState !== 'PLAYING' && gameState !== 'MENU' && (
              <Button onClick={startGame} className="bg-gradient-to-r from-neon-cyan to-neon-purple">
                <Play className="h-4 w-4 mr-2" />
                New Game
              </Button>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="md:hidden">
            <div className="text-center mb-4 text-sm text-muted-foreground">Mobile Controls</div>
            <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto">
              <div></div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => gameState === 'PLAYING' && direction !== 'DOWN' && setDirection('UP')}
                disabled={gameState !== 'PLAYING'}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <div></div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => gameState === 'PLAYING' && direction !== 'RIGHT' && setDirection('LEFT')}
                disabled={gameState !== 'PLAYING'}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div></div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => gameState === 'PLAYING' && direction !== 'LEFT' && setDirection('RIGHT')}
                disabled={gameState !== 'PLAYING'}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
              
              <div></div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => gameState === 'PLAYING' && direction !== 'UP' && setDirection('DOWN')}
                disabled={gameState !== 'PLAYING'}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <div></div>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center text-sm text-muted-foreground">
            <p>🎯 Eat the red food to grow and score points</p>
            <p>⌨️ Use arrow keys, WASD, or mobile controls to move</p>
            <p>🏆 Higher scores earn more ALGO token rewards!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
