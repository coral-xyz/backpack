import { Wallet } from "./Wallet";
import { SendLamportButton } from "./SendLamportButton";
import { SendAllButton } from "./SendAllButton";
import { SignMessageButton } from "./SignMessageButton";
import { SendTokenButton } from "./SendTokenButton";

function App() {
  return (
    <div className="App">
      <h1>Solana</h1>
      <Wallet>
        <SendLamportButton />
        <SendAllButton />
        <SendTokenButton />
        <SignMessageButton />
      </Wallet>

      <h1>Ethereum</h1>
    </div>
  );
}

export default App;
