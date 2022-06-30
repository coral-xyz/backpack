import React, { FC, useCallback } from "react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";

export const SendLamportButton: FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const onClick = useCallback(async () => {
    if (!wallet.publicKey) throw new WalletNotConnectedError();
    //
    // Test the pass through connection works.
    //
    // @ts-ignore
    const bh = await window.backpack.connection.getLatestBlockhash();
    console.log("got latest blockhash", bh);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: Keypair.generate().publicKey,
        lamports: 1000000,
      })
    );

    console.log("sending transaction", transaction);

    const [signature, { blockhash, lastValidBlockHeight }] = await Promise.all([
      wallet.sendTransaction(transaction, connection),
      connection.getLatestBlockhash(),
    ]);

    console.log("signature", signature);

    await connection.confirmTransaction(
      {
        signature,
        blockhash,
        lastValidBlockHeight,
      },
      "processed"
    );
  }, [wallet.publicKey, wallet.sendTransaction, connection]);

  return (
    <button onClick={onClick} disabled={!wallet.publicKey}>
      Send 1 lamport to a random address!
    </button>
  );
};
