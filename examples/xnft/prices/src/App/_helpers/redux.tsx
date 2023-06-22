import type { Dispatch, MutableRefObject, ReactNode } from "react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

export type Reducer<State, Actions> = (state: State, action: Actions) => State;

export default createRedux;

export const createSimpleAction =
  <V extends { [key: string]: any }, T extends string>(
    type: T
  ): ((values: V) => V & { type: T }) =>
  (values) => ({ type, ...values });

function createRedux<State, Actions>(
  reducer: Reducer<State, Actions>,
  initialState: State
) {
  const StateContext = createContext({ state: initialState });
  const DispatchContext = createContext<{
    dispatch: ThunkDispatch<State, Actions>;
  }>({ dispatch: (() => {}) as ThunkDispatch<State, Actions> });

  const ReduxProvider = ({ children }: { children: ReactNode }) => {
    const { state: initialState } = useContext(StateContext);
    const [state, dispatch] = useThunk<State, Actions>(
      useReducer(reducer, initialState)
    );
    return (
      <StateContext.Provider value={{ state }}>
        {useMemo(
          () => (
            <DispatchContext.Provider value={{ dispatch }}>
              {children}
            </DispatchContext.Provider>
          ),
          []
        )}
      </StateContext.Provider>
    );
  };

  const connect =
    <P, SP>(
      selector: (state: State, props: P, prevSelection: SP | null) => SP | any
    ) =>
    (Component: React.ComponentType<P & SP>) =>
    (props: P) => {
      const currentSelector = selector || (() => null);
      const { state } = useContext(StateContext);
      const [selection, updateSelection] = useState<SP | null>(() =>
        currentSelector(state, props, null)
      );
      const newSelection = currentSelector(state, props, selection) as SP;
      useEffect(() => updateSelection(newSelection), [newSelection]);
      return useMemo(
        () => (
          // @ts-ignore
          <Component {...props} {...(selection ?? ({} as SP))} />
        ),
        [selection, props]
      );
    };

  const useDispatch = () => {
    const { dispatch } = useContext(DispatchContext);
    return dispatch;
  };

  return {
    connect,
    ReduxProvider,
    useDispatch,
  };
}

///////////////////////////////////////////////////////////////////////////////

type Thunk<State, Actions> = (
  dispatch: ThunkDispatch<State, Actions>,
  getState: () => State
) => void;
export type ThunkDispatch<State, Actions> = (
  action: Actions | Thunk<State, Actions>
) => void;

function useThunk<State, Actions>([state, dispatch]: [
  State,
  Dispatch<Actions>
]): [State, ThunkDispatch<State, Actions>] {
  const containerRef: MutableRefObject<State> = useRef<State>(state);
  const thunkDispatch: ThunkDispatch<State, Actions> = useCallback(
    (action: Actions | Thunk<State, Actions>) => {
      switch (typeof action) {
        case "object": {
          dispatch(action as Actions);
          break;
        }
        case "function": {
          const thunk = action as Thunk<State, Actions>;
          thunk(thunkDispatch, () => containerRef.current);
          break;
        }
      }
    },
    [containerRef, dispatch]
  );

  return [state, thunkDispatch];
}
