import type { TextInputProps } from "react-native";
import { View, StyleSheet, TextInput as RNTextInput } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";

import { useTheme } from "~hooks/useTheme";

export function StyledTextInput({
  style,
  value,
  placeholder,
  onChangeText,
  onBlur,
  multiline,
  numberOfLines,
  ...props
}: TextInputProps): JSX.Element {
  const theme = useTheme();

  return (
    <RNTextInput
      style={[
        {
          backgroundColor: theme.custom.colors.textBackground,
          borderColor: theme.custom.colors.textInputBorderFull,
          color: theme.custom.colors.secondary,
          minHeight: multiline && numberOfLines ? numberOfLines * 24 : 48,
          borderWidth: 2,
        },
        styles.container,
        styles.textInput,
        style,
      ]}
      autoCapitalize="none"
      autoComplete="off"
      autoCorrect={false}
      placeholder={placeholder}
      placeholderTextColor={theme.custom.colors.textPlaceholder}
      onChangeText={onChangeText}
      onBlur={onBlur}
      value={value}
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical="top"
      {...props}
    />
  );
}

export function SearchInput({ style, ...props }: TextInputProps): JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.custom.colors.textBackground,
          borderColor: theme.custom.colors.textInputBorderFull,
          color: theme.custom.colors.secondary,
          borderWidth: 2,
          height: 48,
        },
        styles.container,
        styles.inputContainer,
        style,
      ]}
    >
      <MaterialIcons
        size={22}
        color={theme.custom.colors.icon}
        name="search"
        style={{ marginRight: 8 }}
      />
      <RNTextInput {...props} style={styles.textInput} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    fontWeight: "500",
    width: "100%",
  },
});
