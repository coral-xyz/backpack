import { SolanaWallet } from "./SolanaWallet";
import { SendLamportButton } from "./solana/SendLamportButton";
import { SendAllButton } from "./solana/SendAllButton";
import { SignMessageButton } from "./solana/SignMessageButton";
import { SendTokenButton } from "./solana/SendTokenButton";
import { OpenXnftButton } from "./solana/OpenXnftButton";

import { EthereumWallet } from "./EthereumWallet";
import { SignMessageButton as EthereumSignMessageButton } from "./ethereum/SignMessageButton";
import { SendWeiButton } from "./ethereum/SendWeiButton";

function App() {
  return (
    <div className="App">
      <h1>Solana</h1>
      <SolanaWallet>
        <SendLamportButton />
        <SendAllButton />
        <SendTokenButton />
        <SignMessageButton />
        <OpenXnftButton />
      </SolanaWallet>

      <h1>Ethereum</h1>
      <EthereumWallet>
        <SendWeiButton />
        <EthereumSignMessageButton />
      </EthereumWallet>
    </div>
  );
}

export default App;
