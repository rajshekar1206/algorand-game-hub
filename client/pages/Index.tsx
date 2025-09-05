import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Play,
  Trophy,
  Zap,
  Shield,
  Users,
  Coins,
  Star,
  ArrowRight,
  Gamepad2,
  Brain,
  Target,
} from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";

const featuredGames = [
  {
    id: "snake",
    name: "Snake Challenge",
    description: "Classic snake with crypto rewards",
    icon: Target,
    color: "from-green-500 to-emerald-600",
    players: "1.2k",
  },
  {
    id: "trivia",
    name: "Crypto Trivia",
    description: "Test your blockchain knowledge",
    icon: Brain,
    color: "from-blue-500 to-cyan-600",
    players: "890",
  },
  {
    id: "tictactoe",
    name: "Tic-Tac-Toe Arena",
    description: "Strategic AI battles",
    icon: Target,
    color: "from-purple-500 to-pink-600",
    players: "654",
  },
];

const features = [
  {
    icon: Zap,
    title: "Play-to-Earn",
    description: "Earn real ALGO tokens and NFT badges by playing games",
  },
  {
    icon: Shield,
    title: "Blockchain Secured",
    description: "All rewards are secured and verified on Algorand blockchain",
  },
  {
    icon: Users,
    title: "Global Leaderboards",
    description: "Compete with players worldwide for exclusive rewards",
  },
  {
    icon: Coins,
    title: "Instant Payouts",
    description: "Receive your earnings directly to your wallet instantly",
  },
];

export default function Index() {
  const { connectWallet } = useWallet();
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-game-bg via-game-bg to-neon-purple/5" />

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-cyan/5 rounded-full blur-3xl animate-float" />
          <div
            className="absolute top-3/4 right-1/4 w-48 h-48 bg-neon-purple/5 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/2 left-3/4 w-32 h-32 bg-neon-pink/5 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
                Game. Earn. Win.
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The first play-to-earn arcade on Algorand. Play classic games,
              compete globally, and earn real crypto rewards.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-neon-cyan to-neon-purple hover:from-neon-cyan/80 hover:to-neon-purple/80 text-white font-semibold text-lg px-8 py-4"
              >
                <Link to="/games">
                  <Play className="h-5 w-5 mr-2" />
                  Start Playing
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-game-bg text-lg px-8 py-4"
              >
                <Link to="/leaderboard">
                  <Trophy className="h-5 w-5 mr-2" />
                  View Leaderboard
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-neon-cyan mb-1">
                  1,234+
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Players
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-neon-purple mb-1">
                  45,678
                </div>
                <div className="text-sm text-muted-foreground">ALGO Earned</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-neon-pink mb-1">
                  890+
                </div>
                <div className="text-sm text-muted-foreground">NFTs Minted</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Games Section */}
      <section className="py-20 bg-gradient-to-b from-transparent to-game-card/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                Featured Games
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Challenge yourself with our collection of skill-based games and
              earn rewards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {featuredGames.map((game) => {
              const Icon = game.icon;

              return (
                <Card
                  key={game.id}
                  className="bg-game-card border-border hover:border-neon-cyan/50 transition-all duration-300 group cursor-pointer"
                >
                  <CardHeader className="text-center">
                    <div
                      className={`mx-auto mb-4 p-4 rounded-lg bg-gradient-to-r ${game.color} bg-opacity-10 w-fit group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{game.name}</CardTitle>
                    <CardDescription>{game.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground mb-4">
                      <Users className="h-4 w-4" />
                      <span>{game.players} players</span>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 hover:from-neon-cyan/30 hover:to-neon-purple/30 border border-neon-cyan/30">
                      Play Now
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-white"
            >
              <Link to="/games">
                View All Games
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                Algorand Game Hub
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience the future of gaming with blockchain-powered rewards
              and true ownership
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <Card
                  key={index}
                  className="bg-game-card border-border text-center group hover:border-neon-cyan/30 transition-all duration-300"
                >
                  <CardHeader>
                    <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 rounded-lg w-fit group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-8 w-8 text-neon-cyan" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-neon-cyan/5 to-neon-purple/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to{" "}
            <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              Start Earning?
            </span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Connect your Algorand wallet and start playing games to earn real
            crypto rewards today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={connectWallet}
              className="bg-gradient-to-r from-neon-cyan to-neon-purple hover:from-neon-cyan/80 hover:to-neon-purple/80 text-white font-semibold text-lg px-8 py-4"
            >
              <Gamepad2 className="h-5 w-5 mr-2" />
              Connect Wallet & Play
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
