import ReactECharts from "echarts-for-react";
import { CHART_PALETTE } from "../palette";
import type { CategoryChartProps } from "../types";

export function BarChart({ categories, series, height = 300 }: CategoryChartProps) {
  const option = {
    color: CHART_PALETTE,
    grid: { left: 8, right: 8, top: 24, bottom: 8, containLabel: true },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: series.length > 1 ? { top: 0 } : undefined,
    xAxis: { type: "category", data: categories },
    yAxis: { type: "value" },
    series: series.map((s) => ({ name: s.name, type: "bar", data: s.data })),
  };
  return <ReactECharts option={option} style={{ height }} notMerge />;
}
