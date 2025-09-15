"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts"

type AreaChartProps<TData extends Record<string, any>> = {
  data: TData[]
  xKey: keyof TData
  yKey: keyof TData
  height?: number
  colorVar?: string
  strokeWidth?: number
  xTickFormatter?: (value: any) => string
  tooltipFormatter?: (value: any, name: string, props: any) => any
}

export default function AreaChartSimple<TData extends Record<string, any>>({
  data,
  xKey,
  yKey,
  height = 240,
  colorVar = "var(--foreground)",
  strokeWidth = 2,
  xTickFormatter,
  tooltipFormatter,
}: AreaChartProps<TData>) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ left: 12, right: 12 }}
        >
          <CartesianGrid vertical={false} stroke={colorVar} strokeOpacity={0.12} />
          <XAxis
            dataKey={xKey as string}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={xTickFormatter}
          />
          <Tooltip formatter={tooltipFormatter} cursor={{ stroke: colorVar, strokeOpacity: 0.2 }} />
          <Area
            dataKey={yKey as string}
            type="natural"
            fill={colorVar}
            fillOpacity={0.18}
            stroke={colorVar}
            strokeWidth={strokeWidth}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}


