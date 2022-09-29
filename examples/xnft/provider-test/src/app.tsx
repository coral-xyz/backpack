import { useEffect } from "react";
import ReactXnft, { Button, View } from "react-xnft";
import { BigNumber } from "ethers";
import { UnsignedTransaction } from "@ethersproject/transactions";
import { SystemProgram, Transaction, PublicKey } from "@solana/web3.js";

//
// On connection to the host environment, warm the cache.
//
ReactXnft.events.on("connect", () => {
  // no-op
});

export function App() {
  useEffect(() => {
    (async () => {
      console.log(
        "Solana balance",
        await window.xnft.solana.connection.getBalance(
          window.xnft.solana.publicKey
        )
      );
      console.log(
        "Ethereum balance",
        (
          await window.xnft.ethereum.provider.getBalance(
            window.xnft.ethereum.publicKey
          )
        ).toString()
      );
    })();
  }, []);

  const ethereumSignMessage = async () => {
    const result = await window.xnft.ethereum.signMessage("Hello, world!");
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
    console.log("solana sign transaction", result);
  };

  const solanaSignAllTransactions = async () => {
    const transactions = [
      new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: window.xnft.solana.publicKey,
          toPubkey: new PublicKey(
            "H4YJ7ESVkiiP9tGeQJy9jKVSHk98tSAUD3LqTowH9tEY"
          ),
          lamports: 1,
        })
      ),
      new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: window.xnft.solana.publicKey,
          toPubkey: new PublicKey(
            "H4YJ7ESVkiiP9tGeQJy9jKVSHk98tSAUD3LqTowH9tEY"
          ),
          lamports: 1,
        })
      ),
    ];

    const result = await window.xnft.solana.signAllTransactions(transactions);
    console.log("solana sign all transactions", result);
  };

  return (
    <View style={{ marginTop: "64px" }}>
      <View style={{ margin: "24px" }}>
        <Button style={{ width: "100%" }} onClick={ethereumSignMessage}>
          Sign Ethereum Message
        </Button>
      </View>
      <View style={{ margin: "24px" }}>
        <Button style={{ width: "100%" }} onClick={ethereumSendTransaction}>
          Send Ethereum Transaction
        </Button>
      </View>
      <View style={{ margin: "24px" }}>
        <Button style={{ width: "100%" }} onClick={solanaSignMessage}>
          Sign Solana Message
        </Button>
      </View>
      <View style={{ margin: "24px" }}>
        <Button style={{ width: "100%" }} onClick={solanaSignAllTransactions}>
          Sign Multiple Solana Transactions
        </Button>
      </View>
      <View style={{ margin: "24px" }}>
        <Button style={{ width: "100%" }} onClick={solanaSendTransaction}>
          Send Solana Transaction
        </Button>
      </View>
    </View>
  );
}
