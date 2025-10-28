import type { GetLeaderboardResponse, SubmitScoreRequest, SubmitScoreResponse } from "@shared/leaderboard";

const API_BASE = "/api";

async function http<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed with ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getLeaderboard(): Promise<GetLeaderboardResponse> {
    return http<GetLeaderboardResponse>(`${API_BASE}/leaderboard`);
  },
  submitScore(payload: SubmitScoreRequest): Promise<SubmitScoreResponse> {
    return http<SubmitScoreResponse>(`${API_BASE}/leaderboard/submit`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};


