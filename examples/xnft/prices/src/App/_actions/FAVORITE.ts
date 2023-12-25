import { createSimpleAction, Reducer } from "../_helpers/redux";
import { StateType } from "../../state";

export const FAVORITE = createSimpleAction<
  {
    assetId: string;
    isFavorited: boolean;
  },
  "FAVORITE"
>("FAVORITE");

export const FAVORITE_reducer: Reducer<
  StateType,
  ReturnType<typeof FAVORITE>
> = (state, action) => {
  return {
    ...state,
    favorites: {
      ...state.favorites,
      [action.assetId]: action.isFavorited,
    },
  };
};
