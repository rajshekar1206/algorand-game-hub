import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGame } from '@/contexts/GameContext';
import { useWallet } from '@/contexts/WalletContext';
import { 
  Play, 
  RotateCcw, 
  Trophy, 
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  Brain
} from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
}

type GameState = 'MENU' | 'PLAYING' | 'QUESTION_RESULT' | 'GAME_OVER';

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What is the consensus mechanism used by Algorand?",
    options: ["Proof of Work", "Proof of Stake", "Pure Proof of Stake", "Delegated Proof of Stake"],
    correctAnswer: 2,
    difficulty: 'medium',
    explanation: "Algorand uses Pure Proof of Stake (PPoS), which is more energy-efficient and faster than traditional PoS."
  },
  {
    id: 2,
    question: "What is the native token of the Algorand blockchain?",
    options: ["ALG", "ALGO", "ALD", "AGO"],
    correctAnswer: 1,
    difficulty: 'easy',
    explanation: "ALGO is the native cryptocurrency of the Algorand blockchain ecosystem."
  },
  {
    id: 3,
    question: "What does ASA stand for in the Algorand ecosystem?",
    options: ["Algorand Smart Asset", "Algorand Staking Asset", "Algorand Security Asset", "Algorand System Asset"],
    correctAnswer: 0,
    difficulty: 'medium',
    explanation: "ASA stands for Algorand Smart Asset, which represents tokens created on the Algorand blockchain."
  },
  {
    id: 4,
    question: "What is the approximate block time for Algorand?",
    options: ["1 second", "4.5 seconds", "10 seconds", "15 seconds"],
    correctAnswer: 1,
    difficulty: 'medium',
    explanation: "Algorand has an average block time of approximately 4.5 seconds, making it very fast for transactions."
  },
  {
    id: 5,
    question: "Who founded Algorand?",
    options: ["Vitalik Buterin", "Silvio Micali", "Charles Hoskinson", "Gavin Wood"],
    correctAnswer: 1,
    difficulty: 'hard',
    explanation: "Silvio Micali, a Turing Award winner and MIT professor, founded Algorand in 2017."
  },
  {
    id: 6,
    question: "What is the maximum supply of ALGO tokens?",
    options: ["1 billion", "10 billion", "21 million", "No maximum supply"],
    correctAnswer: 1,
    difficulty: 'hard',
    explanation: "Algorand has a maximum supply of 10 billion ALGO tokens."
  },
  {
    id: 7,
    question: "What is a smart contract called on Algorand?",
    options: ["dApp", "Smart Contract", "Algorand Smart Contract (ASC1)", "Teal Contract"],
    correctAnswer: 2,
    difficulty: 'medium',
    explanation: "Smart contracts on Algorand are called Algorand Smart Contracts version 1 (ASC1)."
  },
  {
    id: 8,
    question: "What programming language is primarily used for Algorand smart contracts?",
    options: ["Solidity", "Rust", "TEAL", "JavaScript"],
    correctAnswer: 2,
    difficulty: 'medium',
    explanation: "TEAL (Transaction Execution Approval Language) is the primary language for Algorand smart contracts."
  },
  {
    id: 9,
    question: "What is the finality time for transactions on Algorand?",
    options: ["Instant", "~4.5 seconds", "1 minute", "10 minutes"],
    correctAnswer: 1,
    difficulty: 'easy',
    explanation: "Algorand provides transaction finality in approximately 4.5 seconds with immediate finality guarantees."
  },
  {
    id: 10,
    question: "What is Algorand's approach to scalability called?",
    options: ["Sharding", "Layer 2", "Co-Chains", "State Channels"],
    correctAnswer: 2,
    difficulty: 'hard',
    explanation: "Algorand uses Co-Chains for scalability, allowing multiple chains to run in parallel."
  }
];

const QUESTION_TIME = 30; // seconds
const TOTAL_QUESTIONS = 10;

export default function TriviaGame() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  
  const { submitScore, checkRewardEligibility, playerStats } = useGame();
  const { wallet } = useWallet();

  // Shuffle questions on game start
  const shuffleQuestions = useCallback(() => {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, TOTAL_QUESTIONS);
  }, []);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameState === 'PLAYING' && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (gameState === 'PLAYING' && timeLeft === 0) {
      // Time's up - auto submit with no answer
      handleAnswerSubmit();
    }
    
    return () => clearTimeout(timer);
  }, [gameState, timeLeft]);

  const startGame = () => {
    const shuffledQuestions = shuffleQuestions();
    setQuestions(shuffledQuestions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setCorrectAnswers(0);
    setTimeLeft(QUESTION_TIME);
    setShowExplanation(false);
    setGameState('PLAYING');
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (gameState === 'PLAYING') {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleAnswerSubmit = () => {
    if (gameState !== 'PLAYING') return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      // Award points based on difficulty and time remaining
      let points = 10; // base points
      if (currentQuestion.difficulty === 'medium') points = 15;
      if (currentQuestion.difficulty === 'hard') points = 20;
      
      // Bonus for quick answers
      const timeBonus = Math.floor(timeLeft / 5); // 1 point per 5 seconds remaining
      points += timeBonus;
      
      setScore(prev => prev + points);
    }
    
    setShowExplanation(true);
    setGameState('QUESTION_RESULT');
    
    // Auto advance after showing explanation
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(QUESTION_TIME);
      setShowExplanation(false);
      setGameState('PLAYING');
    } else {
      // Game finished
      setGameState('GAME_OVER');
      if (wallet.isConnected && score > 0) {
        submitScore('trivia', score).catch(console.error);
      }
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / TOTAL_QUESTIONS) * 100;
  const reward = checkRewardEligibility('trivia', score);
  const highScore = playerStats.gameStats.trivia.highScore;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="bg-game-card border-border">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Brain className="h-6 w-6 text-neon-cyan" />
            <span>Crypto Trivia Challenge</span>
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
            {gameState !== 'MENU' && (
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{correctAnswers}/{TOTAL_QUESTIONS}</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {gameState === 'MENU' && (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Test Your Crypto Knowledge!</h3>
                <p className="text-muted-foreground">
                  Answer {TOTAL_QUESTIONS} questions about Algorand and blockchain technology.
                  Earn bonus points for quick answers!
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 border border-border rounded-lg">
                    <div className="text-green-500 font-bold">Easy Questions</div>
                    <div className="text-muted-foreground">10 points</div>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <div className="text-yellow-500 font-bold">Medium Questions</div>
                    <div className="text-muted-foreground">15 points</div>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <div className="text-red-500 font-bold">Hard Questions</div>
                    <div className="text-muted-foreground">20 points</div>
                  </div>
                </div>
                
                {reward.tokens > 0 && (
                  <Badge className="bg-gradient-to-r from-neon-cyan to-neon-purple">
                    <Zap className="h-3 w-3 mr-1" />
                    Potential reward: {reward.tokens} tokens
                  </Badge>
                )}
              </div>
              
              <Button 
                onClick={startGame} 
                className="bg-gradient-to-r from-neon-cyan to-neon-purple"
                size="lg"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Quiz
              </Button>
            </div>
          )}

          {(gameState === 'PLAYING' || gameState === 'QUESTION_RESULT') && currentQuestion && (
            <div className="space-y-6">
              {/* Progress and Timer */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Question {currentQuestionIndex + 1} of {TOTAL_QUESTIONS}</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span className={timeLeft <= 5 ? 'text-red-400' : ''}>{timeLeft}s</span>
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
                <Progress 
                  value={(timeLeft / QUESTION_TIME) * 100} 
                  className={`h-1 ${timeLeft <= 5 ? 'bg-red-900' : ''}`}
                />
              </div>

              {/* Question */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline"
                    className={
                      currentQuestion.difficulty === 'easy' ? 'border-green-500 text-green-500' :
                      currentQuestion.difficulty === 'medium' ? 'border-yellow-500 text-yellow-500' :
                      'border-red-500 text-red-500'
                    }
                  >
                    {currentQuestion.difficulty.toUpperCase()}
                  </Badge>
                </div>
                
                <h3 className="text-lg font-semibold">{currentQuestion.question}</h3>
                
                <div className="grid gap-3">
                  {currentQuestion.options.map((option, index) => {
                    let buttonClass = "text-left p-4 border border-border hover:border-neon-cyan/50 transition-all";
                    
                    if (gameState === 'QUESTION_RESULT') {
                      if (index === currentQuestion.correctAnswer) {
                        buttonClass += " border-green-500 bg-green-500/20";
                      } else if (index === selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer) {
                        buttonClass += " border-red-500 bg-red-500/20";
                      }
                    } else if (selectedAnswer === index) {
                      buttonClass += " border-neon-cyan bg-neon-cyan/20";
                    }
                    
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        className={buttonClass}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={gameState === 'QUESTION_RESULT'}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span>{option}</span>
                          {gameState === 'QUESTION_RESULT' && index === currentQuestion.correctAnswer && (
                            <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                          )}
                          {gameState === 'QUESTION_RESULT' && index === selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer && (
                            <XCircle className="h-4 w-4 text-red-500 ml-auto" />
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>

                {/* Submit Button */}
                {gameState === 'PLAYING' && selectedAnswer !== null && (
                  <Button 
                    onClick={handleAnswerSubmit}
                    className="w-full bg-gradient-to-r from-neon-cyan to-neon-purple"
                  >
                    Submit Answer
                  </Button>
                )}

                {/* Explanation */}
                {gameState === 'QUESTION_RESULT' && showExplanation && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Explanation:</h4>
                    <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {gameState === 'GAME_OVER' && (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Quiz Complete!</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-neon-cyan">{score}</div>
                    <div className="text-sm text-muted-foreground">Final Score</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-neon-purple">{correctAnswers}/{TOTAL_QUESTIONS}</div>
                    <div className="text-sm text-muted-foreground">Correct Answers</div>
                  </div>
                </div>

                {wallet.isConnected && (
                  <div className="space-y-2">
                    {reward.tokens > 0 && (
                      <Badge className="bg-gradient-to-r from-neon-cyan to-neon-purple">
                        <Zap className="h-3 w-3 mr-1" />
                        Earned {reward.tokens} ALGO tokens!
                      </Badge>
                    )}
                    {reward.badge && (
                      <Badge className="bg-gradient-to-r from-neon-pink to-neon-purple">
                        🏆 {reward.badge}
                      </Badge>
                    )}
                  </div>
                )}

                {score > highScore && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                    🎉 New High Score!
                  </Badge>
                )}
              </div>
              
              <Button 
                onClick={startGame} 
                className="bg-gradient-to-r from-neon-cyan to-neon-purple"
                size="lg"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Play Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
