import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./app/App";
import reportWebVitals from "./reportWebVitals";
import {
  debug,
  PortChannel,
  UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE,
  CONNECTION_POPUP_RPC,
  CONNECTION_POPUP_RESPONSE,
} from "./common";
import {
	setBackgroundClient,
	setBackgroundResponseClient,
} from "./background/client";

async function main() {
  bootstrap();
  render();
}

function bootstrap() {
  debug("bootstrapping ui");

  // Client to communicate from the UI to the background script.
  const backgroundClient = PortChannel.client(CONNECTION_POPUP_RPC);
  setBackgroundClient(backgroundClient);

	// Client to send responses from the UI to the background script.
	// Used when the background script asks the UI to do something, e.g.,
	// approve a transaction.
	const backgroundResponseClient = PortChannel.client(CONNECTION_POPUP_RESPONSE);
	setBackgroundResponseClient(backgroundResponseClient);

  // Keep the keyring store unlocked with a continuous poll.
  setInterval(() => {
    backgroundClient.request({
      method: UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE,
      params: [],
    });
  }, 5 * 60 * 1000);
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
