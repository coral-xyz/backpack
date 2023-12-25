import React, { useEffect } from "react";
import ReactXnft, { View } from "react-xnft";
import { createSelector } from "reselect";

import { connect, ReduxProvider, StateType, useDispatch } from "../state";

import { INITIALIZE_STATE } from "./_actions/INITIALIZE_STATE";
import useRefreshTokenList from "./_hooks/useRefreshTokenList";
import CenteredLoader from "./CenteredLoader";
import Navigation from "./Navigation";

// On connection to the host environment, warm the cache.
//
ReactXnft.events.on("connect", () => {
  // no-op
});

const defaultTokenList = ["bitcoin", "ethereum", "solana"];

type Props = {};

type StateProps = {
  initialized: boolean;
};

function _App({ initialized }: Props & StateProps) {
  useRefreshTokenList();
  const dispatch = useDispatch();
  useEffect(() => {
    if (!initialized) {
      const state = window.localStorage.getItem("PricesState");
      if (StateType.is(state)) {
        dispatch(INITIALIZE_STATE({ state }));
      } else {
        console.error(
          "Prices xNFT:",
          "INVALID STATE",
          StateType.validate(state)[0]
        );
        dispatch(INITIALIZE_STATE({ state: null }));
      }
    }
  }, [initialized]);

  if (!initialized) {
    return <CenteredLoader />;
  }

  return (
    <View
      style={{
        position: "relative",
        height: "100%",
        background: "rgb(0,0,0, 0.87)",
      }}
    >
      <Navigation />
    </View>
  );
}

const selector = createSelector(
  (state: StateType) => state.initialized,
  (initialized) => ({ initialized })
);
const ConnectedApp = connect<Props, StateProps>(selector)(_App);

export function App() {
  return (
    <ReduxProvider>
      <ConnectedApp />
    </ReduxProvider>
  );
}
