import React from "react";
import { Wallet } from "./Wallet";
import { SendLamportButton } from "./SendLamportButton";
import { SignMessageButton } from "./SignMessageButton";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Wallet>
        <SendLamportButton />
        <SignMessageButton />
      </Wallet>
    </div>
  );
}

export default App;
