import { ethers } from "ethers";

import type { MnemonicResponse } from "../_types/types";

self.onmessage = (e: MessageEvent<string>) => {
  let res = getEthereumPublicKeys(e.data);
  self.postMessage(res);
};

const getEthereumPublicKeys = (mnemonic: string): MnemonicResponse[] => {
  let res: MnemonicResponse[] = [];
  for (let i = 0; i < 10; i++) {
    const path = `m/44'/60'`;
    const wallet = ethers.Wallet.fromMnemonic(mnemonic, path);
    res.push({ derivationPath: path, publicKey: wallet.address });
  }
  for (let i = 0; i < 10; i++) {
    const path = `m/44'/60'/${i}'`;
    const wallet = ethers.Wallet.fromMnemonic(mnemonic, path);
    res.push({ derivationPath: path, publicKey: wallet.address });
  }
  for (let i = 0; i < 10; i++) {
    const path = `m/44'/60'/0'/${i}`;
    const wallet = ethers.Wallet.fromMnemonic(mnemonic, path);
    res.push({ derivationPath: path, publicKey: wallet.address });
  }
  for (let i = 0; i < 10; i++) {
    const path = `m/44'/60'/0'/${i}'`;
    const wallet = ethers.Wallet.fromMnemonic(mnemonic, path);
    res.push({ derivationPath: path, publicKey: wallet.address });
  }
  for (let i = 0; i < 10; i++) {
    const path = `m/44'/60'/${i}'/0`;
    const wallet = ethers.Wallet.fromMnemonic(mnemonic, path);
    res.push({ derivationPath: path, publicKey: wallet.address });
    for (let j = 0; j < 10; j++) {
      const path = `m/44'/60'/${i}'/0'/${j}`;
      const wallet = ethers.Wallet.fromMnemonic(mnemonic, path);
      res.push({ derivationPath: path, publicKey: wallet.address });
    }
  }
  for (let i = 0; i < 10; i++) {
    const path = `m/44'/60'/${i}'/0`;
    const wallet = ethers.Wallet.fromMnemonic(mnemonic, path);
    res.push({ derivationPath: path, publicKey: wallet.address });
    for (let j = 0; j < 10; j++) {
      const path = `m/44'/60'/${i}'/0/${j}`;
      const wallet = ethers.Wallet.fromMnemonic(mnemonic, path);
      res.push({ derivationPath: path, publicKey: wallet.address });
    }
    for (let j = 0; j < 10; j++) {
      const path = `m/44'/60'/${i}'/0'/${j}`;
      const wallet = ethers.Wallet.fromMnemonic(mnemonic, path);
      res.push({ derivationPath: path, publicKey: wallet.address });
    }
  }
  return res;
};

export default getEthereumPublicKeys;
