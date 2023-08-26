import type { FC } from "react";
import React, { useCallback } from "react";
import * as anchor from "@project-serum/anchor";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

export const SignMessageButtonSolanaOffchain: FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const onClick = useCallback(async () => {
    if (!wallet.publicKey) throw new WalletNotConnectedError();

    const msg = anchor.utils.bytes.utf8.encode("hello world ñ");
    console.log("requesting sig over", msg);

    const preparedMessage = await window.backpack?.prepareSolanaOffchainMessage(
      msg
    );
    const signature = await wallet.signMessage!(preparedMessage);
    console.log("signature", signature);
  }, [wallet.publicKey, wallet.sendTransaction, connection]);

  return (
    <button onClick={onClick} disabled={!wallet.publicKey}>
      Sign Solana offchain message UTF-8: "hello World ñ"
    </button>
  );
};
