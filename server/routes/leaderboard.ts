import { Router } from "express";
import {
  GetLeaderboardResponse,
  LeaderboardEntryDTO,
  LeaderboardStorageRecord,
  SubmitScoreRequest,
  SubmitScoreResponse,
} from "@shared/leaderboard";

const router = Router();

// In-memory store (replace with DB in production)
const records: Map<string, LeaderboardStorageRecord> = new Map();

function toDTO(list: LeaderboardStorageRecord[]): LeaderboardEntryDTO[] {
  const sorted = [...list].sort((a, b) => b.totalScore - a.totalScore);
  return sorted.map((r, idx) => ({
    rank: idx + 1,
    address: r.address,
    displayName: r.displayName,
    totalScore: r.totalScore,
    tokensEarned: r.tokensEarned,
    badges: r.badges,
  }));
}

router.get("/leaderboard", (_req, res) => {
  const leaderboard: GetLeaderboardResponse = {
    leaderboard: toDTO(Array.from(records.values())),
  };
  res.json(leaderboard);
});

router.post("/leaderboard/submit", (req, res) => {
  const body: SubmitScoreRequest = req.body;
  if (!body || !body.address || typeof body.score !== "number") {
    const response: SubmitScoreResponse = {
      success: false,
      message: "Invalid payload",
    };
    return res.status(400).json(response);
  }

  const existing = records.get(body.address);
  const displayName = body.displayName || existing?.displayName || `Player_${body.address.slice(-4)}`;
  const tokensEarnedDelta = body.tokensEarned || 0;
  const badgesDelta = body.badgesAwarded || 0;

  const updated: LeaderboardStorageRecord = {
    address: body.address,
    displayName,
    totalScore: (existing?.totalScore || 0) + body.score,
    tokensEarned: (existing?.tokensEarned || 0) + tokensEarnedDelta,
    badges: (existing?.badges || 0) + badgesDelta,
  };
  records.set(body.address, updated);

  const response: SubmitScoreResponse = { success: true };
  res.json(response);
});

export default router;


