import { createSimpleAction, Reducer } from "../_helpers/redux";
import { StateType } from "../../state";
import { TokenChartType } from "../_types/TokenChartType";
import { ChartType } from "../_types/ChartType";
import { GraphDataPointType } from "../_types/GraphDataPointType";

export const SET_TOKEN_CHART = createSimpleAction<
  {
    tokenId: string;
    chartData: Partial<TokenChartType>;
  },
  "SET_TOKEN_CHART"
>("SET_TOKEN_CHART");

export const SET_TOKEN_CHART_reducer: Reducer<
  StateType,
  ReturnType<typeof SET_TOKEN_CHART>
> = (state, action) => {
  return {
    ...state,
    tokenCharts: {
      ...state.tokenCharts,
      [action.tokenId]: {
        ...state.tokenCharts[action.tokenId],
        ...action.chartData,
      },
    },
  };
};
