import { array, Infer, type } from "superstruct";
import { GraphDataPointType } from "./GraphDataPointType";

export type ChartDataType = Infer<typeof ChartDataType>;
export const ChartDataType = type({
  prices: array(GraphDataPointType),
});
