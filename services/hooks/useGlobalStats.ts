"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchGlobalStats, GlobalStatsResponse } from "../globalStats";

export function useGlobalStats() {
  return useQuery<GlobalStatsResponse, Error>({
    queryKey: ["global-stats"],
    queryFn: ({ signal }) => fetchGlobalStats(signal),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  });
}


