import type { TextInputProps } from "react-native";
import { View, StyleSheet, TextInput as RNTextInput } from "react-native";

import { Input } from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";

import { useTheme } from "~hooks/useTheme";

type SearchInputProps = TextInputProps & {
  iconBefore?: JSX.Element;
};

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
          minHeight: multiline && numberOfLines ? numberOfLines * 24 : 44,
          borderWidth: 2,
        },
        styles.container,
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

export function SearchInput({
  iconBefore,
  style,
  ...props
}: SearchInputProps): JSX.Element {
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
      <RNTextInput {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: "500",
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
