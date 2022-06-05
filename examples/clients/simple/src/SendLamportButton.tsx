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
    const bh = await window.anchor.connection.getLatestBlockhash();
    console.log("got latest blockhash", bh);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: Keypair.generate().publicKey,
        lamports: 1,
      })
    );

    console.log("sending transaction", transaction);
    const signature = await wallet.sendTransaction(transaction, connection);
    console.log("signature", signature);
    await connection.confirmTransaction(signature, "processed");
  }, [wallet.publicKey, wallet.sendTransaction, connection]);

  return (
    <button onClick={onClick} disabled={!wallet.publicKey}>
      Send 1 lamport to a random address!
    </button>
  );
};
