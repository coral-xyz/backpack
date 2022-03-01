import React from "react";
import { Button } from "@material-ui/core";
import {
  PortChannelClient,
  EXTENSION_WIDTH,
  EXTENSION_HEIGHT,
} from "../common";
import "./App.css";

let _backgroundClient: PortChannelClient | null = null;

export function setBackgroundClient(backgroundClient: PortChannelClient) {
  _backgroundClient = backgroundClient;
}

function App() {
  const clickButton = async () => {
    const resp = await _backgroundClient!.request({
      method: "test ayyyyy",
      params: [1234],
    });
    console.log("resp", resp);
  };

  return (
    <div
      style={{ width: `${EXTENSION_WIDTH}px`, height: `${EXTENSION_HEIGHT}px` }}
    >
      The Anchor Wallet
      <Button onClick={() => clickButton()}>Request</Button>
    </div>
  );
}

export default App;
