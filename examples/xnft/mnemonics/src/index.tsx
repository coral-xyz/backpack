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
import { registerRootComponent } from "expo";

import type { KeypairPath } from "./util";
import { getBackgroundColor, getMnemonicPaths } from "./util";

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
  const [blockchain, setBlockchain] = useState<"solana" | "ethereum">("solana");
  const [phrase, setPhrase] = useState("");
  const [results, setResults] = useState<KeypairPath[]>([]);

  const handleSearchMnemonic = useCallback(() => {
    const paths = getMnemonicPaths(blockchain, phrase);
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
        <BlockchainSelect
          value={blockchain}
          onChange={(val) => setBlockchain(val as "solana" | "ethereum")}
        />
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
              <View style={{ marginBottom: 12 }}>
                <Text
                  style={{
                    color: "white",
                    fontSize: 10,
                    marginBottom: 4,
                    paddingTop: 2,
                    paddingBottom: 2,
                    paddingLeft: 6,
                    paddingRight: 6,
                    backgroundColor: getBackgroundColor(item.path),
                    borderRadius: 12,
                    width: "fit-content",
                  }}
                >
                  {item.path}
                </Text>
                <Text style={{ fontSize: 12 }}>{item.publicKey}</Text>
              </View>
            )}
          />
        </ScrollView>
      ) : null}
    </View>
  );
}

registerRootComponent(App);
