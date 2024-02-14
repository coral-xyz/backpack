import { ChartType } from "../_types/ChartType";

export const getChartDataTime = (chart: ChartType) =>
  ["1H", "1D"].includes(chart)
    ? "minute"
    : ["1W", "1M"].includes(chart)
    ? "hour"
    : "day";
