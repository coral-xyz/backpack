import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { ethers } from "ethers";
import { SignaturePubkeyPairV2 } from "@coral-xyz/common-public";
const { base58: bs58 } = ethers.utils;

export const deserializeTransaction = (
  serializedTx: string,
  signatures?: SignaturePubkeyPairV2[]
) => {
  const tx = VersionedTransaction.deserialize(bs58.decode(serializedTx));
  signatures?.forEach(({ signature, publicKey }) => {
    tx.addSignature(new PublicKey(publicKey), signature);
  });
  return tx;
};

export const isVersionedTransaction = (
  tx: Transaction | VersionedTransaction
): tx is VersionedTransaction => {
  return "version" in tx;
};
