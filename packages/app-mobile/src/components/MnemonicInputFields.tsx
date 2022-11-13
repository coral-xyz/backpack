// function MnemonicInputFields from app-extension/.../common/Account/MnemonicInput.tsx
import { FlatList, Text, TextInput, View } from "react-native";

function Item({ item, index }) {
  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 4,
        paddingVertical: 8,
        margin: 4,
        flexDirection: "row",
        backgroundColor: "white",
        borderRadius: 4,
      }}
    >
      <Text>{index + 1}</Text>
      <TextInput value={item} style={{ marginLeft: 4 }} />
    </View>
  );
}

export function MnemonicInputFields({
  mnemonicWords,
  onChange,
}: {
  mnemonicWords: Array<string>;
  onChange?: (mnemonicWords: Array<string>) => void;
}) {
  return (
    <FlatList
      data={mnemonicWords}
      numColumns={3}
      renderItem={Item}
      keyExtractor={(item, index) => {
        return `${item}.${index}`.toString();
      }}
      initialNumToRender={mnemonicWords.length}
      scrollEnabled={false}
    />
  );
}
