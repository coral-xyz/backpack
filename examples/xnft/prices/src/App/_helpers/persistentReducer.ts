import debounce from "debounce";
import { LocalStorage } from "react-xnft";
import { Actions, StateType } from "../../state";
import { Reducer } from "./redux";

const debouncedLocalstorageUpdate = debounce(
  async (state) => {
    await LocalStorage.set("PricesState", state);
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
