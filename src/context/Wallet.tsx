import { PublicKey, Transaction } from "@solana/web3.js";

export function useLoadWallet() {
  // todo
}

export function useWallet() {
  // todo
}

export class Wallet {
  constructor(readonly publicKey: PublicKey) {}

  signTransaction(tx: Transaction): Transaction {
    // todo
    return tx;
  }
}
