import React from "react";
import ReactDOM from "react-dom";
import * as recoil from "@200ms/recoil";
import {
  NAV_COMPONENT_BALANCES_NETWORK,
  NAV_COMPONENT_TOKEN,
  NAV_COMPONENT_PLUGINS,
  TAB_BALANCES,
  TAB_BRIDGE,
  TAB_QUEST,
  TAB_FRIENDS,
} from "@200ms/common";
import "./index.css";
import App from "./app/App";
import reportWebVitals from "./reportWebVitals";
import * as background from "./background/client";
import { Balances } from "./components/Unlocked/Balances";
import { Quests } from "./components/Unlocked/Quests";
import { Bridge } from "./components/Unlocked/Bridge";
import { Settings } from "./components/Unlocked/Settings";
import { Network } from "./components/Unlocked/Balances/Network";
import { Token } from "./components/Unlocked/Balances/Token";
import { PluginDisplay } from "./components/Unlocked/Balances/Plugin";

async function main() {
  //
  // Initialize the client to the backgroudn script.
  //
  background.setupClient();

  //
  // Setup recoil. The recoil package doesn't have any knowledge of the
  // extension UI or its components and so we inject these components in.
  //
  recoil.setupTabComponents((tab: string) => {
    return () => {
      return (
        <>
          {tab === TAB_BALANCES && <Balances />}
          {tab === TAB_QUEST && <Quests />}
          {tab === TAB_BRIDGE && <Bridge />}
          {tab === TAB_FRIENDS && <Settings />}
        </>
      );
    };
  });
  recoil.setupNavigationMap((navId: string) => {
    switch (navId) {
      case NAV_COMPONENT_BALANCES_NETWORK:
        return (props: any) => <Network {...props} />;
      case NAV_COMPONENT_TOKEN:
        return (props: any) => <Token {...props} />;
      case NAV_COMPONENT_PLUGINS:
        return (props: any) => <PluginDisplay {...props} />;
      default:
        throw new Error("invariant violation");
    }
  });

  //
  // Render the UI.
  //
  render();
}

function render() {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById("root")
  );
}

main();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
