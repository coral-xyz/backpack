import { PublicKey, Transaction } from "@solana/web3.js";
import { Connection } from "@solana/web3.js";
import { useRecoilValue } from "recoil";
import { walletPublicKeys } from "../recoil/atoms";

export function useLoadWallet() {
  // todo
}

export function useWallet() {
  // todo
}

export function useWalletPublicKeys(): Array<PublicKey> {
  const keys = useRecoilValue(walletPublicKeys);
  return keys.map((k) => new PublicKey(k));
}

export type ConnectionContext = {
  connection: Connection;
  connectionUrl: string;
  setConnectionUrl: (url: string) => void;
};

export class Wallet {
  constructor(readonly publicKey: PublicKey) {}

  signTransaction(tx: Transaction): Transaction {
    // todo
    return tx;
  }
}
