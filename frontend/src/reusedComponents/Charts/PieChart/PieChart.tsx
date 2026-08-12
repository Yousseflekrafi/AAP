import ReactECharts from "echarts-for-react";
import { CHART_PALETTE } from "../palette";
import type { PieChartProps } from "../types";

export function PieChart({ data, height = 300 }: PieChartProps) {
  const option = {
    color: CHART_PALETTE,
    tooltip: { trigger: "item" },
    legend: { bottom: 0 },
    series: [
      {
        type: "pie",
        radius: ["45%", "72%"],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: "#fff", borderWidth: 2 },
        label: { show: false },
        data,
      },
    ],
  };
  return <ReactECharts option={option} style={{ height }} notMerge />;
}
