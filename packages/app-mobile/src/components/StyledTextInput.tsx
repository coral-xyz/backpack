import { StyleSheet, TextInput as RNTextInput } from "react-native";
import { useTheme } from "@hooks";

export function StyledTextInput({
  style,
  value,
  placeholder,
  onChangeText,
  onBlur,
  ...props
}: any) {
  const theme = useTheme();

  return (
    <RNTextInput
      style={[
        {
          backgroundColor: theme.custom.colors.textBackground,
          borderColor: theme.custom.colors.textInputBorderFull,
          color: theme.custom.colors.secondary,
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
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2.5,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    // lineHeight: 20,
    fontWeight: "500",
  },
});
