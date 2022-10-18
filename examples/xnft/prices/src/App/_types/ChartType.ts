import { Infer, enums } from "superstruct";

export type ChartType = Infer<typeof ChartType>;
export const ChartType = enums(["1H", "1D", "1W", "1M", "1Y", "ALL"]);
