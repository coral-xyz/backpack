import { Buffer } from "buffer";
if (!global.Buffer) {
  global.Buffer = Buffer;
}

import { useCallback, useState } from "react";
import {
  Button,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Keypair } from "@solana/web3.js";
import { mnemonicToSeedSync } from "bip39";
import { ethers } from "ethers";
import { registerRootComponent } from "expo";
import { HDKey } from "micro-ed25519-hdkey";

type BlockchainSelectProps = {
  onChange: (value: string) => void;
  value: string;
};

function BlockchainSelect({ onChange, value }: BlockchainSelectProps) {
  return (
    <Picker
      style={{
        padding: 8,
        borderRadius: 10,
        borderColor: "#B6B6B6",
      }}
      selectedValue={value}
      onValueChange={onChange}
    >
      <Picker.Item label="Solana" value="solana" />
      <Picker.Item label="Ethereum" value="ethereum" />
    </Picker>
  );
}

export default function App() {
  const [blockchain, setBlockchain] = useState("solana");
  const [phrase, setPhrase] = useState("");
  const [results, setResults] = useState<string[]>([]);

  const handleSearchMnemonic = useCallback(() => {
    const paths = getPaths(blockchain, phrase);
    setResults(paths);
  }, [blockchain, phrase]);

  return (
    <View
      style={{
        height: "100vh",
        width: "100vw",
        backgroundColor: "white",
        paddingTop: 12,
        paddingBottom: 20,
        paddingLeft: 12,
        paddingRight: 12,
      }}
    >
      <View
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <Text style={{ fontSize: 26, marginBottom: 24 }}>
          Mnemonic Inspector
        </Text>
        <BlockchainSelect value={blockchain} onChange={setBlockchain} />
        <TextInput
          secureTextEntry
          style={{
            paddingTop: 8,
            paddingBottom: 8,
            paddingLeft: 12,
            paddingRight: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#B6B6B6",
          }}
          placeholder="Enter recovery phrase"
          textContentType="password"
          value={phrase}
          onChangeText={setPhrase}
        />
        <Button
          disabled={phrase.length === 0}
          color="#C6D0D3"
          title="Search"
          onPress={handleSearchMnemonic}
        />
      </View>

      {results.length > 0 ? (
        <ScrollView>
          <FlatList
            data={results}
            renderItem={({ item }) => (
              <Text style={{ fontSize: 14, marginBottom: 8 }}>{item}</Text>
            )}
          />
        </ScrollView>
      ) : null}
    </View>
  );
}

function getPaths(blockchain: string, phrase: string): string[] {
  const paths: string[] = [];

  if (blockchain === "solana") {
    const seed = mnemonicToSeedSync(phrase, "");
    const hd = HDKey.fromMasterSeed(seed.toString("hex"));

    const root = `m/44'/501'`;
    const kp = Keypair.fromSeed(hd.derive(root).privateKey);
    paths.push(`${root} => ${kp.publicKey.toBase58()}`);

    for (let i = 0; i < 10; i++) {
      const p = `m/44'/501'/${i}'`;
      const kp = Keypair.fromSeed(hd.derive(p).privateKey);
      paths.push(`${p} => ${kp.publicKey.toBase58()}`);

      for (let j = 0; j < 10; j++) {
        const p = `m/44'/501'/${i}'/${j}'`;
        const kp = Keypair.fromSeed(hd.derive(p).privateKey);
        paths.push(`${p} => ${kp.publicKey.toBase58()}`);
      }
    }
  } else {
    for (let i = 0; i < 10; i++) {
      const p = `m/44'/60'/${i}'`;
      const wallet = ethers.Wallet.fromMnemonic(phrase, p);
      paths.push(`${p} => ${wallet.address}`);

      for (let j = 0; j < 10; j++) {
        const p = `m/44'/60'/${i}'/${j}'`;
        const wallet = ethers.Wallet.fromMnemonic(phrase, p);
        paths.push(`${p} => ${wallet.address}`);
      }
    }
  }

  return paths;
}

registerRootComponent(App);
