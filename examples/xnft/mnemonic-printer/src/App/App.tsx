import React, { useCallback, useState } from "react";
import { Button, ScrollBar, Text, TextField, View } from "react-xnft";

import type { MnemonicResponse } from "./_types/types";
import { Blockchain } from "./_types/types";
import getEthereumPublicKeys from "./_utils/getEthereumPublicKeys";
import getSolanaPublicKeys from "./_utils/getSolanaPublicKeys";

export function MnemonicPrinter() {
  const [phrase, setPhrase] = useState("");
  const [mnemonicResponse, setMnemonicResponse] = useState<MnemonicResponse[]>(
    []
  );
  const [blockChain, setBlockChain] = useState<Blockchain>(Blockchain.SOLANA);
  const [message, setMessage] = useState<string>("");

  const handleSubmit = useCallback(() => {
    setMnemonicResponse([]);
    setMessage("Loading please wait ...");
    let res = getPaths(blockChain, phrase);
    setMnemonicResponse(res);
    setMessage("");
  }, [phrase, blockChain]);

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
            setPhrase(e.target.value);
          }}
          value={phrase}
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
        <Button onClick={() => handleSubmit()}> Search </Button>
      </View>
      <View
        style={{
          display: "flex",
          flexGrow: 1,
          position: "relative",
        }}
      >
        <ScrollBar>
          {mnemonicResponse.length > 0 ? (
            mnemonicResponse.map((res) =>
              renderPublicKeys(res.derivationPath, res.publicKey)
            )
          ) : (
            <Text style={{ padding: "8px" }}>{`${message}`}</Text>
          )}
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

function getPaths(blockChain: string, phrase: string): MnemonicResponse[] {
  let res: MnemonicResponse[] = [];
  if (blockChain === Blockchain.SOLANA) {
    setTimeout(() => {
      res = getSolanaPublicKeys(phrase);
    }, 25);
  } else if (blockChain === Blockchain.ETHEREUM) {
    setTimeout(() => {
      res = getEthereumPublicKeys(phrase);
    }, 25);
  }
  return res;
}
