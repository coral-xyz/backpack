import type { FC } from "react";
import React, { useCallback } from "react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";

export const SendLamportSignMessageButton: FC = () => {
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

    const transaction = new Transaction({
      recentBlockhash: bh,
      feePayer: wallet.publicKey,
    }).add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: Keypair.generate().publicKey,
        // Note you can't send below minimum required for rent exemption to a random
        // account so use something above that value
        lamports: 10000000,
      })
    );

    const serializedTransactoin = transaction.serializeMessage();
    // const [signature, { blockhash, lastValidBlockHeight }] = await Promise.all([
    //   wallet.signMessage!(new Uint8Array(serializedTransactoin)),
    //   connection.getLatestBlockhash(),
    // ]);

    console.log("signature", serializedTransactoin);

    // await connection.confirmTransaction(
    //   {
    //     signature,
    //     blockhash,
    //     lastValidBlockHeight,
    //   },
    //   "processed"
    // );
  }, [wallet.publicKey, wallet.sendTransaction, connection]);

  return (
    <button onClick={onClick} disabled={!wallet.publicKey}>
      Send 10000000 lamports to a random address TX sent to signMessage!
    </button>
  );
};
