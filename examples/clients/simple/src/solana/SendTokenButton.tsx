import React, { FC, useCallback } from "react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferCheckedInstruction,
} from "@solana/spl-token";

export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

const SRM_MINT = new PublicKey("SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt");

export const SendTokenButton: FC = () => {
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
      SRM_MINT,
      new PublicKey(wallet.publicKey)
    );
    const toTokenAccount = await getAssociatedTokenAddress(
      SRM_MINT,
      new PublicKey(toAccount)
    );

    const transaction = new Transaction().add(
      createTransferCheckedInstruction(
        fromTokenAccount,
        SRM_MINT,
        toTokenAccount,
        wallet.publicKey,
        1,
        6
      )
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
      Send 0.000001 SRM to AqP1...VSrWS
    </button>
  );
};
