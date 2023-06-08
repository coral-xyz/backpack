import { memo, useCallback, useRef, forwardRef } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";

import { useTheme } from "~hooks/useTheme";

const ITEM_HEIGHT = 40;
const ITEM_GAP = 6;

type MnemonicWordInputProps = {
  word: string;
  index: number;
  onChangeText: (word: string) => void;
  onSubmitEditing: () => void;
};

const _MnemonicWordInput = forwardRef<TextInput, MnemonicWordInputProps>(
  (props, ref) => {
    const { word, index, onChangeText, onSubmitEditing } = props;
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
          ref={ref}
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
          onSubmitEditing={onSubmitEditing}
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
);

const MnemonicWordInput = memo(_MnemonicWordInput);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 6,
    paddingRight: 12,
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

export function MnemonicInputFields({
  mnemonicWords,
  onChange,
}: {
  mnemonicWords: string[];
  onChange?: (mnemonicWords: string[]) => void;
}) {
  const inputRef = useRef<TextInput[]>([]);

  const selectNextInput = (index: number) => {
    const next = inputRef.current[index + 1];
    if (next) {
      next.focus();
    }
  };

  const keyExtractor = (_: any, index: number) => index.toString();
  const renderItem = useCallback(
    ({ item, index }: { item: string; index: number }) => {
      return (
        <MnemonicWordInput
          ref={(node) => {
            if (node) {
              inputRef.current[index] = node;
            }
          }}
          word={item}
          index={index}
          onSubmitEditing={() => selectNextInput(index)}
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
