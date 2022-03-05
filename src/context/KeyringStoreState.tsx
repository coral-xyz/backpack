import React, { useContext, useState, useEffect } from "react";
import { KeyringStoreState } from "../keyring/store";

// Define this state setting function so that we can access it from
// the background script notification handler, which allows us to rerender
// components on notifications.
export let setKeyringStoreState: null | ((state: KeyringStoreState) => void) =
  null;

type KeyringStoreStateContext = {
  keyringStoreState: KeyringStoreState;
  setKeyringStoreState: (keyringStoreState: KeyringStoreState) => void;
};
const _KeyringStoreStateContext =
  React.createContext<KeyringStoreStateContext | null>(null);

export function KeyringStoreStateProvider(props: any) {
  const [keyringStoreState, _setKeyringStoreState] = useState(
    props.keyringStoreState
  );

  useEffect(() => {
    setKeyringStoreState = _setKeyringStoreState;
  }, [_setKeyringStoreState]);

  return (
    <_KeyringStoreStateContext.Provider
      value={{
        keyringStoreState,
        setKeyringStoreState: _setKeyringStoreState,
      }}
    >
      {props.children}
    </_KeyringStoreStateContext.Provider>
  );
}

export function useKeyringStoreStateContext(): KeyringStoreStateContext {
  const ctx = useContext(_KeyringStoreStateContext);
  if (ctx === null) {
    throw new Error("Context not available");
  }
  return ctx;
}
