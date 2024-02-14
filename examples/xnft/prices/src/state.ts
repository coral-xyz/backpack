import {
  INITIALIZE_STATE,
  INITIALIZE_STATE_reducer,
} from "./App/_actions/INITIALIZE_STATE";
import createRedux, { Reducer } from "./App/_helpers/redux";
import {
  SET_TOKENLIST,
  SET_TOKENLIST_reducer,
} from "./App/_actions/SET_TOKENLIST";
import {
  nullable,
  boolean,
  Infer,
  array,
  number,
  object,
  string,
  type,
  record,
  union,
  literal,
  tuple,
} from "superstruct";
import { TokenListType } from "./App/_types/TokenListType";
import persistentReducer from "./App/_helpers/persistentReducer";
import { FAVORITE, FAVORITE_reducer } from "./App/_actions/FAVORITE";
import { TokenChartType } from "./App/_types/TokenChartType";
import {
  SET_TOKEN_CHART,
  SET_TOKEN_CHART_reducer,
} from "./App/_actions/SET_TOKEN_CHART";
import { TokenInfoType } from "./App/_types/TokenInfoType";

export type StateType = Infer<typeof StateType>;
export const StateType = type({
  initialized: boolean(),
  loadingStatus: record(
    string(),
    union([literal("LOADING"), literal("SUCCESS"), literal("ERROR")])
  ),
  tokenCharts: record(string(), TokenChartType),
  tokenInfo: nullable(
    object({
      updated: number(),
      data: TokenListType,
    })
  ),
  tokenInfos: record(string(), TokenInfoType),
  tokenList: nullable(array(string())),
  favorites: record(string(), boolean()),
});

export type Actions =
  | ReturnType<typeof INITIALIZE_STATE>
  | ReturnType<typeof SET_TOKENLIST>
  | ReturnType<typeof SET_TOKEN_CHART>
  | ReturnType<typeof FAVORITE>;

const reducer: Reducer<StateType, Actions> = (state, action) => {
  switch (action.type) {
    case "INITIALIZE_STATE":
      return INITIALIZE_STATE_reducer(state, action);
    case "SET_TOKENLIST":
      return SET_TOKENLIST_reducer(state, action);
    case "SET_TOKEN_CHART":
      return SET_TOKEN_CHART_reducer(state, action);
    case "FAVORITE":
      return FAVORITE_reducer(state, action);
    default:
      return state;
  }
};

const initialState: StateType = {
  initialized: false,
  tokenInfo: null,
  tokenInfos: {},
  tokenList: null,
  tokenCharts: {},
  loadingStatus: {},
  favorites: {},
};

export const { useDispatch, ReduxProvider, connect } = createRedux<
  StateType,
  Actions
>(persistentReducer(reducer), initialState);
