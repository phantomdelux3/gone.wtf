"use client";

import { CHART_DATA } from "../_constants/ChartData";
import AreaChartSimple from "./area-chart";
// import { useGlobalStats } from "@/services/hooks/useGlobalStats";

type Props = {
  metric: "value" | "transactions";
  height?: number;
  colorVar?: string;
};

export default function GlobalStatsChart({ metric, colorVar = "var(--foreground)" }: Props) {
  // const { data, isLoading, isError } = useGlobalStats();

  // if (isLoading) {
  //   return (
  //     <div className="flex w-full h-full items-center justify-center">
  //       <div className="text-sm opacity-70">Loading…</div>
  //     </div>
  //   );
  // }

  // if (isError || !data?.history?.length) {
  //   return (
  //     <div className="flex w-full h-full items-center justify-center">
  //       <div className="text-sm opacity-70">No data</div>
  //     </div>
  //   );
  // }

  const chartData = CHART_DATA.history.map((h) => ({
    date: h.date,
    value: h.value,
    transactions: h.transactions,
  }));

  return (
    <AreaChartSimple
      data={chartData}
      xKey="date"
      yKey={metric}
      colorVar={colorVar}
      xTickFormatter={(v) => String(v).slice(5)}
      tooltipFormatter={(v) => [v, metric]}
      customTooltip={({ active, payload, label }) => {
        if (active && payload && payload.length) {
          const value = payload[0].value;
          const date = new Date(label || "").toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          return (
            <div className="rounded-md border border-zinc-800 bg-zinc-950/70 p-3 shadow-xl backdrop-blur-md">
              <p className="text-sm text-white opacity-70">{date}</p>
              <p className="text-md font-bold text-white">
                {metric === "value" ? "$" : ""}{value?.toLocaleString()}
              </p>
            </div>
          );
        }
        return null;
      }}
      className="h-[6.875rem] md:h-full"
    />
  );
}


