import { Controller } from "react-hook-form";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "@hooks";

// Wraps multiple components in one singular input group with a shared border
export function InputGroup({
  hasError,
  children,
}: {
  hasError?: boolean;
  children: JSX.Element | JSX.Element[];
}): JSX.Element {
  const theme = useTheme();
  const borderColor = hasError
    ? theme.custom.colors.negative
    : theme.custom.colors.textInputBorderFull;
  return (
    <View
      style={[
        styles.inputWrapper,
        {
          borderColor,
          backgroundColor: theme.custom.colors.textBackground,
        },
      ]}
    >
      {children}
    </View>
  );
}

// Wraps a single input component with a label and error message
export function InputListItem({
  autoFocus,
  title,
  placeholder,
  control,
  rules,
  secureTextEntry,
  name,
}: {
  autoFocus?: boolean;
  title: string;
  placeholder?: string;
  control: any;
  rules: any;
  secureTextEntry?: boolean;
  name: string;
}): JSX.Element {
  const theme = useTheme();
  return (
    <View style={[styles.inputListItem]}>
      <Text style={[styles.label, { color: theme.custom.colors.fontColor }]}>
        {title}
      </Text>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            autoFocus={autoFocus}
            style={[
              styles.input,
              {
                color: theme.custom.colors.fontColor2,
              },
            ]}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            placeholderTextColor={theme.custom.colors.textPlaceholder}
            secureTextEntry={secureTextEntry}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    overflow: "hidden",
    borderRadius: 12,
    borderWidth: 2,
  },
  inputListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    paddingLeft: 12,
    width: 80,
    overflow: "hidden",
    ellipsizeMode: "tail",
    fontWeight: "500",
    fontSize: 16,
  },
  input: {
    flex: 1,
    padding: 12,
    fontWeight: "500",
    fontSize: 16,
  },
});

// Simple label with a text input
export function Field({
  label,
  children,
  hasError,
}: {
  label: string;
  children: JSX.Element;
  hasError?: boolean;
}): JSX.Element {
  const theme = useTheme();
  return (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={[
          { fontSize: 16, fontWeight: "500", marginBottom: 8 },
          { color: theme.custom.colors.fontColor },
        ]}
      >
        {label}
      </Text>
      <View>{children}</View>
    </View>
  );
}
