import { SendWeiButton } from "./ethereum/SendWeiButton";
import { SignMessageButton as EthereumSignMessageButton } from "./ethereum/SignMessageButton";
import { OpenXnftButton } from "./solana/OpenXnftButton";
import { SendAllButton } from "./solana/SendAllButton";
import { SendLamportButton } from "./solana/SendLamportButton";
import { SendTokenButton } from "./solana/SendTokenButton";
import { SignMessageButton } from "./solana/SignMessageButton";
import { SignMessageButtonSolanaOffchain } from "./solana/SignMessageButtonSolanaOffchain";
import { SignMessageButtonSolanaOffchainASCII } from "./solana/SignMessageButtonSolanaOffchainASCII";
import { EthereumWallet } from "./EthereumWallet";
import { SolanaWallet } from "./SolanaWallet";

function App() {
  return (
    <div className="App">
      <h1>Solana</h1>
      <SolanaWallet>
        <SendLamportButton />
        <SendAllButton />
        <SendTokenButton />
        <SignMessageButton />
        <SignMessageButtonSolanaOffchain />
        <SignMessageButtonSolanaOffchainASCII />
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
