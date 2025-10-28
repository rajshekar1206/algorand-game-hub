import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { LeaderboardEntryDTO } from "@shared/leaderboard";

interface LeaderboardTableProps {
  title?: string;
  entries: LeaderboardEntryDTO[];
}

export default function LeaderboardTable({ title = "Leaderboard", entries }: LeaderboardTableProps) {
  return (
    <Card className="bg-game-card border-border">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">#</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-right">Total Score</TableHead>
              <TableHead className="text-right">Tokens</TableHead>
              <TableHead className="text-right">Badges</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((e) => (
              <TableRow key={e.address}>
                <TableCell className="font-medium">{e.rank}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{e.displayName}</span>
                    <span className="text-xs text-muted-foreground">({e.address.slice(0, 6)}...{e.address.slice(-4)})</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">{e.totalScore}</TableCell>
                <TableCell className="text-right">{e.tokensEarned}</TableCell>
                <TableCell className="text-right">{e.badges}</TableCell>
              </TableRow>
            ))}
            {entries.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No entries yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}


