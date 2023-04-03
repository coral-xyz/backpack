import debounce from "debounce";

import type { Actions, StateType } from "../../state";

import type { Reducer } from "./redux";

const debouncedLocalstorageUpdate = debounce(
  async (state) => {
    window.localStorage.setItem("PricesState", state);
  },
  500,
  true
);

const persistentReducer: (
  reducer: Reducer<StateType, Actions>
) => Reducer<StateType, Actions> = (reducer) => (state, action) => {
  const newState = reducer(state, action);
  if (newState !== state) {
    debouncedLocalstorageUpdate(newState);
  }
  return newState;
};

export default persistentReducer;
