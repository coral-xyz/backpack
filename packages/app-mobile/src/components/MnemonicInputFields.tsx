// function MnemonicInputFields from app-extension/.../common/Account/MnemonicInput.tsx
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";

import { useTheme } from "~hooks/useTheme";

function Item({ item, index }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.custom.colors.textBackground,
          borderColor: theme.custom.colors.textInputBorderFull,
        },
      ]}
    >
      <Text
        style={{
          color: theme.custom.colors.secondary,
        }}
      >
        {index + 1}
      </Text>
      <TextInput
        value={item}
        style={[
          styles.input,
          {
            color: theme.custom.colors.fontColor,
          },
        ]}
      />
    </View>
  );
}

export function MnemonicInputFields({
  mnemonicWords,
  onChange,
}: {
  mnemonicWords: string[];
  onChange?: (mnemonicWords: string[]) => void;
}) {
  return (
    <FlatList
      data={mnemonicWords}
      numColumns={3}
      renderItem={({ item, index }) => <Item item={item} index={index} />}
      keyExtractor={(item, index) => {
        return `${item}.${index}`.toString();
      }}
      initialNumToRender={mnemonicWords.length}
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 12,
    margin: 4,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 2,
    overflow: "hidden",
  },
  input: {
    marginLeft: 4,
    fontWeight: "700",
    fontSize: 14,
    paddingBottom: 2,
  },
});
