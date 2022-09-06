import ReactXnft, { Text, Button, View } from "react-xnft";
import { ethers, BigNumber } from "ethers";
import { UnsignedTransaction } from "@ethersproject/transactions";
import { SystemProgram, Transaction, PublicKey } from "@solana/web3.js";

const { base58: bs58 } = ethers.utils;

//
// On connection to the host environment, warm the cache.
//
ReactXnft.events.on("connect", () => {
  // no-op
});

export function App() {
  const ethereumSignMessage = async () => {
    const result = await window.xnft.ethereum.signMessage("Hello, world!");
    console.log(result);
    console.log("ethereum sign message", result);
  };

  const ethereumSendTransaction = async () => {
    const tx = {
      to: "0x4dE6879c7881A6737740b87237cc925f56b58a3D",
      value: BigNumber.from(10000000000000),
    } as UnsignedTransaction;
    const result = await window.xnft.ethereum.sendTransaction(tx);
    console.log("ethereum send transaction", result);
  };

  const solanaSignMessage = async () => {
    const result = await window.xnft.solana.signMessage(
      Buffer.from("Hello, world!")
    );
    console.log("solana sign message", result);
  };

  const solanaSendTransaction = async () => {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: window.xnft.solana.publicKey,
        toPubkey: new PublicKey("H4YJ7ESVkiiP9tGeQJy9jKVSHk98tSAUD3LqTowH9tEY"),
        lamports: 1,
      })
    );
    const result = await window.xnft.solana.send(transaction);
    console.log("solana sign message", result);
  };

  return (
    <View style={{ padding: "20px" }}>
      <Text>Ethereum</Text>
      <Button onClick={ethereumSignMessage}>Sign Message</Button>
      <Button onClick={ethereumSendTransaction}>Send 0.00001 ETH</Button>
      <Text>Solana</Text>
      <Button onClick={solanaSignMessage}>Sign Message</Button>
      <Button onClick={solanaSendTransaction}>Send 1 Lamport</Button>
    </View>
  );
}
