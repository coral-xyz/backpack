import { Wallet } from "./Wallet";
import { SendLamportButton } from "./SendLamportButton";
import { SendAllButton } from "./SendAllButton";
import { SignMessageButton } from "./SignMessageButton";

function App() {
  return (
    <div className="App">
      <Wallet>
        <SendLamportButton />
        <SendAllButton />
        <SignMessageButton />
      </Wallet>
    </div>
  );
}

export default App;
