import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Play,
  Trophy,
  Zap,
  Brain,
  Target,
  Star,
  Puzzle
} from "lucide-react";

const games = [
  {
    id: "snake",
    name: "Snake Challenge",
    description: "Classic snake game with a crypto twist. Collect coins and avoid obstacles!",
    difficulty: "Easy",
    rewards: "5-50 ALGO tokens",
    icon: Target,
    color: "from-green-500 to-emerald-600",
    comingSoon: false
  },
  {
    id: "trivia",
    name: "Crypto Trivia",
    description: "Test your knowledge about blockchain, DeFi, and cryptocurrency.",
    difficulty: "Medium", 
    rewards: "10-100 ALGO tokens",
    icon: Brain,
    color: "from-blue-500 to-cyan-600",
    comingSoon: false
  },
  {
    id: "tictactoe",
    name: "Tic-Tac-Toe Arena",
    description: "Strategic battles against AI with increasing difficulty levels.",
    difficulty: "Easy",
    rewards: "3-30 ALGO tokens",
    icon: Target,
    color: "from-purple-500 to-pink-600",
    comingSoon: false
  },
  {
    id: "memory",
    name: "Memory Match",
    description: "Flip cards to find pairs. Fewer moves and faster time yield better scores.",
    difficulty: "Easy",
    rewards: "5-40 ALGO tokens",
    icon: Puzzle,
    color: "from-orange-500 to-amber-600",
    comingSoon: false
  },
  {
    id: "rps",
    name: "Rock-Paper-Scissors",
    description: "Beat the AI and build win streaks for bonus rewards.",
    difficulty: "Easy",
    rewards: "3-25 ALGO tokens",
    icon: Target,
    color: "from-amber-500 to-yellow-600",
    comingSoon: false
  },
  {
    id: "flappy",
    name: "Flappy Bird",
    description: "Fly through pipes. Precise timing wins!",
    difficulty: "Medium",
    rewards: "5-60 ALGO tokens",
    icon: Target,
    color: "from-teal-500 to-emerald-600",
    comingSoon: false
  },
  {
    id: "puzzle15",
    name: "15 Puzzle",
    description: "Slide tiles to arrange them in order.",
    difficulty: "Medium",
    rewards: "5-40 ALGO tokens",
    icon: Target,
    color: "from-indigo-500 to-blue-600",
    comingSoon: false
  },
  {
    id: "simon",
    name: "Simon Says",
    description: "Repeat the sequence. Memory challenge!",
    difficulty: "Easy",
    rewards: "5-50 ALGO tokens",
    icon: Target,
    color: "from-lime-500 to-green-600",
    comingSoon: false
  },
  {
    id: "sudoku",
    name: "Sudoku",
    description: "Fill the grid with valid numbers.",
    difficulty: "Hard",
    rewards: "10-70 ALGO tokens",
    icon: Target,
    color: "from-yellow-500 to-amber-600",
    comingSoon: false
  },
  {
    id: "chess",
    name: "Chess Mini",
    description: "Capture the king to win.",
    difficulty: "Medium",
    rewards: "5-60 ALGO tokens",
    icon: Target,
    color: "from-slate-500 to-gray-600",
    comingSoon: false
  },
  {
    id: "2048",
    name: "2048",
    description: "Merge tiles to reach 2048.",
    difficulty: "Medium",
    rewards: "5-60 ALGO tokens",
    icon: Target,
    color: "from-rose-500 to-pink-600",
    comingSoon: false
  },
];

export default function Games() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent mb-4">
            Play & Earn Games
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Challenge yourself with our collection of games and earn real ALGO tokens and NFT badges as rewards.
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {games.map((game) => {
            const Icon = game.icon;
            
            return (
              <Card key={game.id} className="bg-game-card border-border hover:border-neon-cyan/50 transition-all duration-300 group relative overflow-hidden">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <CardHeader className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${game.color} bg-opacity-10`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {game.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-foreground">{game.name}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {game.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="relative">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                    <Zap className="h-4 w-4 text-neon-cyan" />
                    <span>Rewards: {game.rewards}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Trophy className="h-4 w-4 text-neon-purple" />
                    <span>NFT badges available</span>
                  </div>
                </CardContent>
                
                <CardFooter className="relative">
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-neon-cyan to-neon-purple hover:from-neon-cyan/80 hover:to-neon-purple/80 text-white font-semibold"
                    disabled={game.comingSoon}
                  >
                    {game.comingSoon ? (
                      <span>
                        <Star className="h-4 w-4 mr-2" />
                        Coming Soon
                      </span>
                    ) : (
                      <Link to={`/games/${game.id}`}>
                        <Play className="h-4 w-4 mr-2" />
                        Play Now
                      </Link>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="bg-game-card border border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-8">
            Game Hub Statistics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-neon-cyan">1,234</div>
              <div className="text-muted-foreground">Total Players</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-3xl font-bold text-neon-purple">45,678</div>
              <div className="text-muted-foreground">ALGO Tokens Earned</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-3xl font-bold text-neon-pink">890</div>
              <div className="text-muted-foreground">NFT Badges Minted</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
