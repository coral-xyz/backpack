import type { TextInputProps } from "react-native";
import { StyleSheet, TextInput as RNTextInput } from "react-native";

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
          minHeight: multiline && numberOfLines ? numberOfLines * 24 : 44,
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

const styles = StyleSheet.create({
  container: {
    borderWidth: 2.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 16,
    fontWeight: "500",
    alignItems: "center",
  },
});
