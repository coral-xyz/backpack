import { Infer, number, tuple } from "superstruct";

export type GraphDataPointType = Infer<typeof GraphDataPointType>;
export const GraphDataPointType = tuple([number(), number()]);
