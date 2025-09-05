import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useGame } from "@/contexts/GameContext";
import { useWallet } from "@/contexts/WalletContext";
import { useRewards } from "@/contexts/RewardsContext";
import {
  useNFT,
  getRarityColor,
  getRarityGradient,
} from "@/contexts/NFTContext";
import { format } from "date-fns";
import {
  User,
  Wallet,
  Trophy,
  Zap,
  Star,
  History,
  Award,
  Settings,
  Copy,
  ExternalLink,
  Calendar,
  Target,
  Coins,
  RefreshCw,
  TrendingUp,
  GamepadIcon,
} from "lucide-react";

export default function Profile() {
  const { wallet, connectWallet } = useWallet();
  const { playerStats, gameHistory } = useGame();
  const { rewardHistory, tokenBalance, refreshTokenBalance } = useRewards();
  const { userBadges, refreshBadges } = useNFT();

  const handleCopyAddress = async () => {
    if (wallet.address) {
      await navigator.clipboard.writeText(wallet.address);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  if (!wallet.isConnected) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-game-card border-border max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <div className="mb-4">
                <Wallet className="h-12 w-12 mx-auto text-neon-cyan opacity-50" />
              </div>
              <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
              <p className="text-muted-foreground mb-4">
                Connect your Algorand wallet to view your profile and gaming
                statistics.
              </p>
              <Button
                className="bg-gradient-to-r from-neon-cyan to-neon-purple"
                onClick={connectWallet}
              >
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const getNextBadgeProgress = () => {
    // Calculate progress towards next badge milestones
    const milestones = [
      {
        name: "First Steps",
        threshold: 1,
        completed: playerStats.gamesPlayed >= 1,
      },
      {
        name: "High Scorer",
        threshold: 100,
        completed: playerStats.totalScore >= 100,
      },
      {
        name: "Crypto Enthusiast",
        threshold: 10,
        completed: rewardHistory.length >= 1,
      },
    ];

    const nextMilestone = milestones.find((m) => !m.completed);
    if (!nextMilestone) return null;

    let currentProgress = 0;
    if (nextMilestone.name === "First Steps")
      currentProgress = playerStats.gamesPlayed;
    if (nextMilestone.name === "High Scorer")
      currentProgress = playerStats.totalScore;
    if (nextMilestone.name === "Crypto Enthusiast")
      currentProgress = rewardHistory.length;

    return {
      ...nextMilestone,
      progress: Math.min(
        (currentProgress / nextMilestone.threshold) * 100,
        100,
      ),
    };
  };

  const nextBadge = getNextBadgeProgress();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-gradient-to-r from-neon-cyan to-neon-purple text-white text-xl">
                  {wallet.address?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                  Player Profile
                </h1>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <span>{truncateAddress(wallet.address!)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyAddress}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={refreshTokenBalance}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(
                    `https://testnet.algoexplorer.io/address/${wallet.address}`,
                    "_blank",
                  )
                }
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Explorer
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="games">Games</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-game-card border-border">
                <CardContent className="p-6 text-center">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-neon-cyan" />
                  <div className="text-2xl font-bold text-neon-cyan">
                    {playerStats.totalScore}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Score
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-game-card border-border">
                <CardContent className="p-6 text-center">
                  <GamepadIcon className="h-8 w-8 mx-auto mb-2 text-neon-purple" />
                  <div className="text-2xl font-bold text-neon-purple">
                    {playerStats.gamesPlayed}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Games Played
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-game-card border-border">
                <CardContent className="p-6 text-center">
                  <Coins className="h-8 w-8 mx-auto mb-2 text-neon-pink" />
                  <div className="text-2xl font-bold text-neon-pink">
                    {tokenBalance}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Game Tokens
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-game-card border-border">
                <CardContent className="p-6 text-center">
                  <Award className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <div className="text-2xl font-bold text-yellow-500">
                    {userBadges.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    NFT Badges
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-game-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-neon-cyan" />
                    <span>Achievement Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {nextBadge ? (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Next Badge: {nextBadge.name}</span>
                        <span>{Math.round(nextBadge.progress)}%</span>
                      </div>
                      <Progress value={nextBadge.progress} className="h-2" />
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>All available badges earned!</p>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    {playerStats.lastPlayed && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Last played: {format(playerStats.lastPlayed, "PPp")}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-game-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-neon-purple" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {gameHistory.slice(0, 3).map((game) => (
                      <div
                        key={game.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div>
                          <div className="font-medium capitalize">
                            {game.gameType}
                          </div>
                          <div className="text-muted-foreground">
                            {format(game.timestamp, "MMM d, h:mm a")}
                          </div>
                        </div>
                        <Badge variant="outline">{game.score} pts</Badge>
                      </div>
                    ))}

                    {gameHistory.length === 0 && (
                      <div className="text-center text-muted-foreground py-4">
                        <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No games played yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Wallet Info */}
            <Card className="bg-game-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wallet className="h-5 w-5 text-neon-cyan" />
                  <span>Wallet Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Address
                    </div>
                    <div className="flex items-center space-x-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {wallet.address}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyAddress}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      ALGO Balance
                    </div>
                    <div className="text-lg font-bold text-neon-cyan">
                      {wallet.balance.toFixed(6)} ALGO
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="games" className="space-y-6">
            <Card className="bg-game-card border-border">
              <CardHeader>
                <CardTitle>Game Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(playerStats.gameStats).map(
                    ([gameType, stats]) => (
                      <div
                        key={gameType}
                        className="p-4 border border-border rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold capitalize">
                            {gameType} Game
                          </h3>
                          <Badge variant="outline">{stats.played} games</Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-lg font-bold text-neon-cyan">
                              {stats.highScore}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              High Score
                            </div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-neon-purple">
                              {stats.totalScore}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Total Score
                            </div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-neon-pink">
                              {stats.played > 0
                                ? Math.round(stats.totalScore / stats.played)
                                : 0}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Avg Score
                            </div>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="badges" className="space-y-6">
            <Card className="bg-game-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>NFT Badge Collection</CardTitle>
                <Button variant="outline" size="sm" onClick={refreshBadges}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {userBadges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userBadges.map((badge) => (
                      <Card
                        key={badge.id}
                        className={`border bg-gradient-to-br ${getRarityGradient(badge.rarity)}/10`}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-4xl mb-2">{badge.image}</div>
                          <h3 className="font-bold mb-1">{badge.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {badge.description}
                          </p>
                          <div className="flex justify-between items-center text-xs">
                            <Badge className={getRarityColor(badge.rarity)}>
                              {badge.rarity}
                            </Badge>
                            <span className="text-muted-foreground">
                              {format(badge.mintedAt, "MMM d, yyyy")}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No badges earned yet.</p>
                    <p className="text-sm">
                      Play games to earn your first NFT badge!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6">
            <Card className="bg-game-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Coins className="h-5 w-5 text-neon-cyan" />
                  <span>Token Rewards</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="font-medium">Game Token Balance</div>
                      <div className="text-sm text-muted-foreground">
                        GAMETOKEN
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-neon-cyan">
                        {tokenBalance}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        tokens
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Recent Rewards</h4>
                    <div className="space-y-2">
                      {rewardHistory.slice(0, 5).map((reward) => (
                        <div
                          key={reward.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <div className="font-medium">
                              +{reward.amount} tokens
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {reward.gameType} • {reward.score} points
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={
                                reward.status === "confirmed"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {reward.status}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {format(reward.timestamp, "MMM d, h:mm a")}
                            </div>
                          </div>
                        </div>
                      ))}

                      {rewardHistory.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No rewards earned yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="bg-game-card border-border">
              <CardHeader>
                <CardTitle>Game History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {gameHistory.map((game) => (
                    <div
                      key={game.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div>
                        <div className="font-medium capitalize">
                          {game.gameType} Game
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(game.timestamp, "PPp")}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{game.score} points</div>
                        {game.rewardTokens && (
                          <div className="text-sm text-neon-cyan">
                            +{game.rewardTokens} tokens
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {gameHistory.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No games played yet.</p>
                      <p className="text-sm">
                        Start playing to build your history!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
