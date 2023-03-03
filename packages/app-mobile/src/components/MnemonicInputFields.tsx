import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";

import { useTheme } from "~hooks/useTheme";

function ItemTextInput({
  word,
  index,
  onChangeText,
}: {
  word: string;
  index: number;
  onChangeText: (word: string) => void;
}) {
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
        onChangeText={onChangeText}
        value={word}
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
  const gap = 6;
  return (
    <FlatList
      data={mnemonicWords}
      numColumns={3}
      initialNumToRender={mnemonicWords.length}
      scrollEnabled={false}
      keyExtractor={(_, index) => index.toString()}
      contentContainerStyle={{ gap }}
      columnWrapperStyle={{ gap }}
      renderItem={({ item: word, index }) => {
        return (
          <ItemTextInput
            word={word}
            index={index}
            onChangeText={(word) => {
              if (onChange) {
                const newMnemonicWords = [...mnemonicWords];
                newMnemonicWords[index] = word;
                onChange(newMnemonicWords);
              }
            }}
          />
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 2,
    overflow: "hidden",
  },
  input: {
    paddingLeft: 4,
    fontWeight: "700",
    fontSize: 14,
    width: "100%",
    paddingVertical: 12,
  },
});
