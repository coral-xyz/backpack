import React, { FC, useCallback } from "react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

export const SignMessageButton: FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const onClick = useCallback(async () => {
    if (!wallet.publicKey) throw new WalletNotConnectedError();

    const msg = new Uint8Array([1, 2, 3, 4, 5]);
    console.log("requesting sig over", msg);
    const signature = await wallet.signMessage!(msg);
    console.log("signature", signature);
  }, [wallet.publicKey, wallet.sendTransaction, connection]);

  return (
    <button onClick={onClick} disabled={!wallet.publicKey}>
      Send the message: [1,2,3,4,5]
    </button>
  );
};
