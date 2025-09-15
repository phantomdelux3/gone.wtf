"use client";

import AreaChartSimple from "./area-chart";
import { useGlobalStats } from "@/services/hooks/useGlobalStats";

type Props = {
  metric: "value" | "transactions";
  height?: number;
  colorVar?: string;
};

export default function GlobalStatsChart({ metric, height = 220, colorVar = "var(--foreground)" }: Props) {
  const { data, isLoading, isError } = useGlobalStats();

  if (isLoading) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <div className="text-sm opacity-70">Loading…</div>
      </div>
    );
  }

  if (isError || !data?.history?.length) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <div className="text-sm opacity-70">No data</div>
      </div>
    );
  }

  const chartData = data.history.map((h) => ({
    date: h.date,
    value: h.value,
    transactions: h.transactions,
  }));

  return (
    <AreaChartSimple
      data={chartData}
      xKey="date"
      yKey={metric}
      height={height}
      colorVar={colorVar}
      xTickFormatter={(v) => String(v).slice(5)}
      tooltipFormatter={(v) => [v as string, metric]}
    />
  );
}


