import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useGame } from "@/contexts/GameContext";
import { useWallet } from "@/contexts/WalletContext";
import { useEffect, useState } from "react";
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  RefreshCw,
  Crown,
  Star,
  Zap,
  Users,
} from "lucide-react";

export default function Leaderboard() {
  const { leaderboard, refreshLeaderboard, isLoading, playerStats } = useGame();
  const { wallet } = useWallet();
  const [selectedTab, setSelectedTab] = useState<"global" | "personal">(
    "global",
  );

  useEffect(() => {
    refreshLeaderboard();
    // Refresh when identity or score changes
  }, [wallet.address, playerStats.totalScore]);

  const playerRank =
    leaderboard.findIndex((entry) => entry.address === wallet.address) + 1;
  const playerEntry = leaderboard.find(
    (entry) => entry.address === wallet.address,
  );

  const getTrophyIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return (
          <span className="text-lg font-bold text-muted-foreground">
            #{rank}
          </span>
        );
    }
  };

  const getDisplayName = (address: string) => {
    if (address === wallet.address) return "You";
    return `Player_${address.slice(-4)}`;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent mb-4">
            Leaderboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Compete with players worldwide and climb the ranks to earn exclusive
            rewards.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={selectedTab === "global" ? "default" : "ghost"}
              onClick={() => setSelectedTab("global")}
              className={
                selectedTab === "global"
                  ? "bg-gradient-to-r from-neon-cyan to-neon-purple"
                  : ""
              }
            >
              <Users className="h-4 w-4 mr-2" />
              Global Rankings
            </Button>
            <Button
              variant={selectedTab === "personal" ? "default" : "ghost"}
              onClick={() => setSelectedTab("personal")}
              className={
                selectedTab === "personal"
                  ? "bg-gradient-to-r from-neon-cyan to-neon-purple"
                  : ""
              }
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Personal Stats
            </Button>
          </div>
        </div>

        {selectedTab === "global" && (
          <div className="space-y-6">
            {/* Refresh Button */}
            <div className="flex justify-end">
              <Button
                onClick={refreshLeaderboard}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>

            {/* Player's Current Rank (if connected and has scores) */}
            {wallet.isConnected && playerEntry && (
              <Card className="bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 border-neon-cyan/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getTrophyIcon(playerRank)}
                        <span className="text-lg font-bold">Your Rank</span>
                      </div>
                      <Badge className="bg-gradient-to-r from-neon-cyan to-neon-purple">
                        #{playerRank} of {leaderboard.length}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-neon-cyan">
                        {playerEntry.totalScore}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Score
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {leaderboard.slice(0, 3).map((entry, index) => (
                <Card
                  key={entry.address}
                  className={`text-center ${
                    index === 0
                      ? "border-yellow-500 bg-yellow-500/10"
                      : index === 1
                        ? "border-gray-400 bg-gray-400/10"
                        : "border-amber-600 bg-amber-600/10"
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="mx-auto mb-2">
                      {getTrophyIcon(entry.rank)}
                    </div>
                    <CardTitle className="text-lg">
                      {getDisplayName(entry.address)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-neon-cyan">
                        {entry.totalScore}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Score
                      </div>
                      <div className="flex justify-center space-x-4 text-xs">
                        <div>
                          <div className="font-bold text-neon-purple">
                            {entry.tokensEarned}
                          </div>
                          <div>Tokens</div>
                        </div>
                        <div>
                          <div className="font-bold text-neon-pink">
                            {entry.badges}
                          </div>
                          <div>Badges</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Full Leaderboard */}
            <Card className="bg-game-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-neon-cyan" />
                  <span>Global Rankings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.address}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                        entry.address === wallet.address
                          ? "border-neon-cyan bg-neon-cyan/10"
                          : "border-border hover:border-neon-cyan/30"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-8 flex justify-center">
                          {entry.rank <= 3 ? (
                            getTrophyIcon(entry.rank)
                          ) : (
                            <span className="text-lg font-bold text-muted-foreground">
                              #{entry.rank}
                            </span>
                          )}
                        </div>

                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-r from-neon-cyan to-neon-purple text-white">
                            {getDisplayName(entry.address)
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <div className="font-semibold">
                            {getDisplayName(entry.address)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {entry.address.slice(0, 8)}...
                            {entry.address.slice(-4)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 text-right">
                        <div>
                          <div className="font-bold text-neon-cyan">
                            {entry.totalScore}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Score
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-neon-purple">
                            {entry.tokensEarned}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Tokens
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-neon-pink">
                            {entry.badges}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Badges
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {leaderboard.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No players on the leaderboard yet.</p>
                      <p className="text-sm">
                        Play some games to be the first!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === "personal" && (
          <div className="space-y-6">
            {wallet.isConnected ? (
              <>
                {/* Personal Overview */}
                <Card className="bg-game-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-neon-cyan" />
                      <span>Your Gaming Stats</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 border border-border rounded-lg">
                        <div className="text-3xl font-bold text-neon-cyan">
                          {playerStats.totalScore}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Score
                        </div>
                      </div>
                      <div className="text-center p-4 border border-border rounded-lg">
                        <div className="text-3xl font-bold text-neon-purple">
                          {playerStats.gamesPlayed}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Games Played
                        </div>
                      </div>
                      <div className="text-center p-4 border border-border rounded-lg">
                        <div className="text-3xl font-bold text-neon-pink">
                          {playerStats.tokensEarned}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Tokens Earned
                        </div>
                      </div>
                      <div className="text-center p-4 border border-border rounded-lg">
                        <div className="text-3xl font-bold text-yellow-500">
                          {playerStats.nftBadges.length}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          NFT Badges
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Game Breakdown */}
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
                            className="flex items-center justify-between p-4 border border-border rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="capitalize font-semibold">
                                {gameType} Game
                              </div>
                            </div>
                            <div className="flex space-x-6 text-sm">
                              <div className="text-center">
                                <div className="font-bold text-neon-cyan">
                                  {stats.played}
                                </div>
                                <div className="text-muted-foreground">
                                  Played
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-neon-purple">
                                  {stats.highScore}
                                </div>
                                <div className="text-muted-foreground">
                                  High Score
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-neon-pink">
                                  {stats.totalScore}
                                </div>
                                <div className="text-muted-foreground">
                                  Total Score
                                </div>
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* NFT Badges */}
                {playerStats.nftBadges.length > 0 && (
                  <Card className="bg-game-card border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Award className="h-5 w-5 text-neon-pink" />
                        <span>Your NFT Badges</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {playerStats.nftBadges.map((badge, index) => (
                          <div
                            key={index}
                            className="text-center p-4 border border-border rounded-lg"
                          >
                            <div className="text-2xl mb-2">🏆</div>
                            <div className="font-semibold text-sm">{badge}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {playerRank > 0 && (
                  <Card className="bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 border-neon-cyan/30">
                    <CardContent className="p-6 text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <Trophy className="h-6 w-6 text-neon-cyan" />
                        <span className="text-xl font-bold">
                          Global Rank: #{playerRank}
                        </span>
                      </div>
                      <p className="text-muted-foreground">
                        You're ranked #{playerRank} out of {leaderboard.length}{" "}
                        players globally!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="bg-game-card border-border">
                <CardContent className="p-8 text-center">
                  <div className="mb-4">
                    <Zap className="h-12 w-12 mx-auto text-neon-cyan opacity-50" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    Connect Your Wallet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Connect your Algorand wallet to view your personal gaming
                    statistics and rankings.
                  </p>
                  <Button className="bg-gradient-to-r from-neon-cyan to-neon-purple">
                    Connect Wallet
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
