export interface CategorySeries {
  name: string;
  data: number[];
}

export interface CategoryChartProps {
  categories: string[];
  series: CategorySeries[];
  height?: number;
}

export interface PieDatum {
  name: string;
  value: number;
}

export interface PieChartProps {
  data: PieDatum[];
  height?: number;
}
