import { Keypair } from "@solana/web3.js";
import * as bip39 from "bip39";
import { HDKey } from "micro-ed25519-hdkey";

import type { MnemonicResponse } from "../_types/types";

const getSolanaPublicKeys = (mnemonic: string): MnemonicResponse[] => {
  let res: MnemonicResponse[] = [];
  const seed = bip39.mnemonicToSeedSync(mnemonic, "");
  const hd = HDKey.fromMasterSeed(seed.toString("hex"));
  for (let i = 0; i < 10; i++) {
    const path = `m/44'/501'`;
    const keypair = Keypair.fromSeed(hd.derive(path).privateKey);
    res.push({
      derivationPath: path,
      publicKey: keypair.publicKey.toBase58(),
    });
  }
  for (let i = 0; i < 10; i++) {
    const path = `m/44'/501'/${i}'`;
    const keypair = Keypair.fromSeed(hd.derive(path).privateKey);
    res.push({
      derivationPath: path,
      publicKey: keypair.publicKey.toBase58(),
    });
  }
  for (let i = 0; i < 10; i++) {
    const path = `m/44'/501'/${i}'/0'`;
    const keypair = Keypair.fromSeed(hd.derive(path).privateKey);
    res.push({
      derivationPath: path,
      publicKey: keypair.publicKey.toBase58(),
    });
    for (let j = 0; j < 10; j++) {
      const path = `m/44'/501'/${i}'/0'/${j}'`;
      const keypair = Keypair.fromSeed(hd.derive(path).privateKey);
      res.push({
        derivationPath: path,
        publicKey: keypair.publicKey.toBase58(),
      });
    }
  }
  return res;
};

export default getSolanaPublicKeys;
