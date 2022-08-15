import React, { FC, useCallback } from "react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";

export const SendAllButton: FC = () => {
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

    const transaction1 = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: Keypair.generate().publicKey,
        lamports: 1000000,
      })
    );
    const transaction2 = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: Keypair.generate().publicKey,
        lamports: 1000000,
      })
    );

    console.log("sending transactions", transaction1, transaction2);

    // @ts-ignore
    const { blockhash, lastValidBlockHeight } =
      await window.backpack.connection.getLatestBlockhash();
    transaction1.recentBlockhash = blockhash;
    transaction2.recentBlockhash = blockhash;
    transaction1.feePayer = wallet.publicKey;
    transaction2.feePayer = wallet.publicKey;

    const signedTxs = await wallet.signAllTransactions([
      transaction1,
      transaction2,
    ]);

    console.log("signed", signedTxs);
    /*
    await connection.confirmTransaction(
      {
        signature,
        blockhash,
        lastValidBlockHeight,
      },
      "processed"
    );
    */
  }, [wallet.publicKey, wallet.sendTransaction, connection]);

  return (
    <button onClick={onClick} disabled={!wallet.publicKey}>
      Send 1 lamport to a random address, twice!
    </button>
  );
};
