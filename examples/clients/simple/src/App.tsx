import { Wallet } from "./Wallet";
import { SendLamportButton } from "./SendLamportButton";
import { SendAllButton } from "./SendAllButton";
import { SignMessageButton } from "./SignMessageButton";
import { SendTokenButton } from "./SendTokenButton";

function App() {
  return (
    <div className="App">
      <Wallet>
        <SendLamportButton />
        <SendAllButton />
        <SendTokenButton />
        <SignMessageButton />
      </Wallet>
    </div>
  );
}

export default App;
