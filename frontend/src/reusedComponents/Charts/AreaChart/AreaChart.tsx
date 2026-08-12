import ReactECharts from "echarts-for-react";
import { CHART_PALETTE } from "../palette";
import type { CategoryChartProps } from "../types";

export function AreaChart({ categories, series, height = 300 }: CategoryChartProps) {
  const option = {
    color: CHART_PALETTE,
    grid: { left: 8, right: 8, top: 24, bottom: 8, containLabel: true },
    tooltip: { trigger: "axis" },
    legend: series.length > 1 ? { top: 0 } : undefined,
    xAxis: { type: "category", data: categories, boundaryGap: false },
    yAxis: { type: "value" },
    series: series.map((s) => ({
      name: s.name,
      type: "line",
      smooth: true,
      areaStyle: { opacity: 0.15 },
      data: s.data,
    })),
  };
  return <ReactECharts option={option} style={{ height }} notMerge />;
}
