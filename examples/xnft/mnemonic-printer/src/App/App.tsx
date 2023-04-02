import React, { useEffect, useState } from "react";
import { Button, ScrollBar, Text, TextField, View } from "react-xnft";
import { Keypair } from "@solana/web3.js";
import * as bip39 from "bip39";
import { ethers } from "ethers";
import { HDKey } from "micro-ed25519-hdkey";

export enum Blockchain {
  SOLANA = "solana",
  ETHEREUM = "ethereum",
}

export type MnemonicResponse = {
  /** Derivation path of the public key */
  derivationPath: string;
  /** Public key */
  publicKey: string;
};

export function MnemonicPrinter() {
  const [mnemonic, setMnemonic] = useState<string>("");
  const [mnemonicResponse, setMnemonicResponse] = useState<MnemonicResponse[]>(
    []
  );
  const [blockChain, setBlockChain] = useState<Blockchain>(Blockchain.SOLANA);

  const handleSubmit = () => {
    setMnemonicResponse([]);
    if (blockChain === Blockchain.SOLANA) {
      let res = getSolanaPublicKeys(mnemonic);
      setMnemonicResponse(res);
    } else if (blockChain === Blockchain.ETHEREUM) {
      let res = getEthereumPublicKeys(mnemonic);
      setMnemonicResponse(res);
    }
  };

  useEffect(() => {
    console.log(mnemonicResponse);
  }, [mnemonicResponse]);

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

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "10px 0px",
        cursor: "pointer",
        paddingTop: "50px",
      }}
    >
      <View
        style={{
          display: "flex",
          padding: "0px 16px",
          paddingBottom: "10px",
          flexDirection: "column",
          gap: 5,
        }}
      >
        <TextField
          placeholder="Enter secret recovery phrase"
          onChange={(e) => {
            setMnemonic(e.target.value);
          }}
          value={mnemonic}
        />
        <View
          style={{
            display: "flex",
            gap: 5,
          }}
        >
          <Button
            style={{
              border:
                blockChain === Blockchain.SOLANA ? "3px solid" : "3px hidden",
              flexGrow: 1,
            }}
            onClick={() => {
              setBlockChain(Blockchain.SOLANA);
            }}
          >
            Solana
          </Button>
          <Button
            style={{
              border:
                blockChain === Blockchain.ETHEREUM ? "3px solid" : "3px hidden",
              flexGrow: 1,
            }}
            onClick={() => {
              setBlockChain(Blockchain.ETHEREUM);
            }}
          >
            Ethereum
          </Button>
        </View>
        <Button onClick={handleSubmit}> Search </Button>
      </View>
      <View
        style={{
          display: "flex",
          flexGrow: 1,
          position: "relative",
        }}
      >
        <ScrollBar>
          {mnemonicResponse.length
            ? mnemonicResponse.map((res) =>
                renderPublicKeys(res.derivationPath, res.publicKey)
              )
            : null}
        </ScrollBar>
      </View>
    </View>
  );
}

function renderPublicKeys(derivationPath: string, publicKey: string) {
  return (
    <View
      style={{
        padding: "8px 16px",
        display: "flex",
        position: "relative",
      }}
    >
      <View
        style={{
          display: "flex",
          flexGrow: 1,
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Text
          style={{
            font: "Inter",
            lineHeight: "24px",
            fontSize: "18px",
            whiteSpace: "nowrap",
            fontWeight: "bold",
          }}
        >{`${derivationPath}`}</Text>
        <Text
          style={{
            font: "Inter",
            lineHeight: "24px",
            fontSize: "16px",
            wordWrap: "break-word",
            whiteSpace: "initial",
          }}
        >{`${publicKey}`}</Text>
      </View>
    </View>
  );
}
