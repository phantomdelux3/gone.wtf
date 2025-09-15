export type GlobalStatsHistoryPoint = {
  date: string;
  value: number;
  transactions: number;
};

export type GlobalStatsResponse = {
  success: boolean;
  totalTransactions: number;
  totalValueInPools: number;
  uniqueDepositors: number;
  volume7d: number;
  txPerHour7d: number;
  history: GlobalStatsHistoryPoint[];
  averageDepositSize: number;
};

export async function fetchGlobalStats(signal?: AbortSignal): Promise<GlobalStatsResponse> {
  const res = await fetch("https://www.gone.wtf/api/global-stats", { signal, cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch global stats: ${res.status}`);
  }
  const json = (await res.json()) as GlobalStatsResponse;
  return json;
}


