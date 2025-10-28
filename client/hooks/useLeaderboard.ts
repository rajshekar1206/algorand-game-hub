import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { GetLeaderboardResponse, SubmitScoreRequest } from "@shared/leaderboard";

const keys = {
  leaderboard: ["leaderboard"] as const,
};

export function useLeaderboard() {
  return useQuery<GetLeaderboardResponse>({
    queryKey: keys.leaderboard,
    queryFn: () => api.getLeaderboard(),
  });
}

export function useSubmitScore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitScoreRequest) => api.submitScore(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.leaderboard });
    },
  });
}


