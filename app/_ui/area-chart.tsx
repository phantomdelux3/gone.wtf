"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  TooltipProps,
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
  className?: string
  customTooltip?: TooltipProps<any, any>['content'];
}

export default function AreaChartSimple<TData extends Record<string, any>>({
  data,
  xKey,
  yKey,
  colorVar = "var(--foreground)",
  strokeWidth = 2,
  xTickFormatter,
  tooltipFormatter,
  className,
  customTooltip: CustomTooltip,
}: AreaChartProps<TData>) {
  return (
    <div className={className} >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ left: 12, right: 12 }}
        >
          <CartesianGrid vertical={false} horizontal={false} stroke={colorVar} strokeOpacity={0.12} />
          <XAxis
            dataKey={xKey as string}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={xTickFormatter}
            hide={true}
          />
          <YAxis hide={true} />
          <Tooltip cursor={false} content={CustomTooltip} formatter={tooltipFormatter} />
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


