import { forwardRef, Ref } from "react";
import type { TextInputProps } from "react-native";
import { View, StyleSheet, TextInput as RNTextInput } from "react-native";

import { XStack, StyledText } from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";

import { useTheme } from "~hooks/useTheme";

function Container({ children }: { children: JSX.Element }): JSX.Element {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.custom.colors.textBackground,
          borderColor: theme.custom.colors.textInputBorderFull,
          borderWidth: theme.custom.size.borderWidth,
          borderRadius: theme.custom.borderRadius.container,
          height: theme.custom.size.container,
          paddingHorizontal: 16,
          justifyContent: "center",
        },
      ]}
    >
      {children}
    </View>
  );
}

type UsernameInputProps = {
  username: string;
  onChange: (username: string) => void;
  onComplete: () => void;
};
export function UsernameInput({
  username,
  onChange,
  onComplete,
}: UsernameInputProps): JSX.Element {
  return (
    <Container>
      <XStack>
        <StyledText color="$fontColor">@</StyledText>
        <RNTextInput
          style={{ paddingLeft: 4 }}
          autoFocus
          placeholder="Username"
          autoCapitalize="none"
          returnKeyType="done"
          maxLength={15}
          value={username}
          onSubmitEditing={onComplete}
          onChangeText={(text) => {
            const username = text.toLowerCase().replace(/[^a-z0-9_]/g, "");
            onChange(username);
          }}
        />
      </XStack>
    </Container>
  );
}

export const StyledTextInput = forwardRef(function StyledTextInput(
  {
    style,
    value,
    placeholder,
    onChangeText,
    onBlur,
    multiline,
    numberOfLines,
    ...props
  }: TextInputProps,
  ref: Ref<RNTextInput>
): JSX.Element {
  const theme = useTheme();

  return (
    <RNTextInput
      ref={ref}
      style={[
        {
          backgroundColor: theme.custom.colors.textBackground,
          borderColor: theme.custom.colors.textInputBorderFull,
          color: theme.custom.colors.secondary,
          minHeight:
            multiline && numberOfLines
              ? numberOfLines * 24
              : theme.custom.size.container,
          borderWidth: theme.custom.size.borderWidth,
          borderRadius: theme.custom.borderRadius.medium,
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
});

export function SearchInput({ style, ...props }: TextInputProps): JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.custom.colors.textBackground,
          borderColor: theme.custom.colors.textInputBorderFull,
          color: theme.custom.colors.secondary,
          borderWidth: theme.custom.size.borderWidth,
          height: theme.custom.size.container,
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
    fontFamily: "InterMedium",
    fontWeight: "500",
    width: "100%",
  },
});
