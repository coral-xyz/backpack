import type { FC } from "react";
import React, { useCallback } from "react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

export const SendLamportWritableButton: FC = () => {
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
        // Note you can't send below minimum required for rent exemption to a random
        // account so use something above that value
        lamports: 10000000,
      })
    );

    console.log("sending transaction", transaction);

    // add extra writable account to tx
    transaction.instructions[0].keys.push({
      pubkey: new PublicKey("4m39tDyZcK9dgqYaBaX7PiTp1kjAKrMhNYmxDcVu3hNp"),
      isSigner: false,
      isWritable: true,
    });

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
      Send lamports to a random address with extra writable accounts
    </button>
  );
};
