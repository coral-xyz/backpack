import type { FC } from "react";
import React, { useCallback } from "react";
import {
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

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

    const toAccount = "AqP1ABfSsRUBcgY3bwiDRB4kiBxgESUqCdcdDLMVSrWS";
    const fromTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      new PublicKey(wallet.publicKey)
    );
    const toTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      new PublicKey(toAccount)
    );

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
        lamports: 2000000,
      })
    );
    const transaction3 = new Transaction().add(
      createTransferCheckedInstruction(
        fromTokenAccount,
        USDC_MINT,
        toTokenAccount,
        wallet.publicKey,
        1,
        6
      )
    );

    console.log("sending transactions", transaction1, transaction2);

    // @ts-ignore
    const { blockhash } = await window.backpack.connection.getLatestBlockhash();
    transaction1.recentBlockhash = blockhash;
    transaction2.recentBlockhash = blockhash;
    transaction3.recentBlockhash = blockhash;
    transaction1.feePayer = wallet.publicKey;
    transaction2.feePayer = wallet.publicKey;
    transaction3.feePayer = wallet.publicKey;

    const signedTxs = await wallet.signAllTransactions!([
      transaction1,
      transaction2,
      transaction3,
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
      Send multiple transactions
    </button>
  );
};
