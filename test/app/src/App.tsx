import React from "react";
import { Wallet } from "./Wallet";
import { SendLamportButton } from "./SendLamportButton";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Wallet>
        <SendLamportButton />
      </Wallet>
    </div>
  );
}

export default App;
