import { memo, useCallback } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";

import { useTheme } from "~hooks/useTheme";

const ITEM_HEIGHT = 40;
const ITEM_GAP = 6;

const MnemonicWordInput = memo(function MnemonicWordInput({
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
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect={false}
        autoFocus={index === 0}
        onChangeText={onChangeText}
        clearButtonMode="while-editing"
        numberOfLines={1}
        inputMode="text"
        returnKeyType="next"
        spellCheck={false}
        scrollEnabled={false}
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
});

export function MnemonicInputFields({
  mnemonicWords,
  onChange,
}: {
  mnemonicWords: string[];
  onChange?: (mnemonicWords: string[]) => void;
}) {
  const keyExtractor = (_, index) => index.toString();
  const renderItem = useCallback(
    ({ item, index }: { item: string; index: number }) => {
      return (
        <MnemonicWordInput
          word={item}
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
    },
    [mnemonicWords, onChange]
  );

  return (
    <FlatList
      data={mnemonicWords}
      numColumns={3}
      initialNumToRender={12}
      scrollEnabled={false}
      keyExtractor={keyExtractor}
      contentContainerStyle={{ gap: ITEM_GAP }}
      columnWrapperStyle={{ gap: ITEM_GAP }}
      renderItem={renderItem}
      maxToRenderPerBatch={12}
      getItemLayout={(_data, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      })}
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
    alignItems: "center",
    height: ITEM_HEIGHT,
  },
});
