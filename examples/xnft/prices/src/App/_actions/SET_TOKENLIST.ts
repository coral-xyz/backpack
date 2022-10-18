import { createSimpleAction, Reducer } from "../_helpers/redux";
import { StateType } from "../../state";
import TokenDetails from "../TokenDetails";
import { TokenListType } from "../_types/TokenListType";

export const SET_TOKENLIST = createSimpleAction<
  {
    tokenData: TokenListType;
  },
  "SET_TOKENLIST"
>("SET_TOKENLIST");

export const SET_TOKENLIST_reducer: Reducer<
  StateType,
  ReturnType<typeof SET_TOKENLIST>
> = (state, action) => {
  const tokenInfos = {};
  const tokenList = action.tokenData.map((token) => {
    tokenInfos[token.id] = token;
    return token.id;
  });
  return {
    ...state,
    tokenList,
    tokenInfos,
  };
};
