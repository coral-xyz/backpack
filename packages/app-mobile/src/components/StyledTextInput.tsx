import { forwardRef, Ref, useState } from "react";
import type { TextInputProps } from "react-native";
import {
  View,
  StyleSheet,
  TextInput as RNTextInput,
  ViewStyle,
  StyleProp,
} from "react-native";

import { XStack, StyledText } from "@coral-xyz/tamagui";
import { StyledTextProps } from "@coral-xyz/tamagui/types/components/StyledText";
import { MaterialIcons } from "@expo/vector-icons";
import { Controller, UseControllerProps } from "react-hook-form";

import { useTheme } from "~hooks/useTheme";

function Container({
  children,
  hasError,
  style,
}: {
  children: React.ReactNode;
  hasError?: boolean;
  style?: StyleProp<ViewStyle>;
}): JSX.Element {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.custom.colors.textBackground,
          borderColor: hasError
            ? theme.custom.colors.negative
            : theme.custom.colors.textInputBorderFull,
          borderWidth: theme.custom.size.borderWidth,
          borderRadius: theme.custom.borderRadius.container,
          height: theme.custom.size.container,
          paddingHorizontal: 16,
          justifyContent: "center",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

type UsernameInputProps = TextInputProps &
  UseControllerProps & {
    username: string;
    onChange: (username: string) => void;
    onComplete: () => void;
    showError?: boolean;
    disabled?: boolean;
  };

export function UsernameInput({
  onSubmitEditing,
  autoFocus,
  control,
  showError,
}: UsernameInputProps): JSX.Element {
  return (
    <Controller
      name="username"
      control={control}
      rules={{
        required: true,
        minLength: {
          value: 3,
          message: "Username must be at least 3 characters",
        },
        maxLength: {
          value: 15,
          message: "Username must be less than 15 characters",
        },
      }}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { invalid },
      }) => (
        <Container hasError={invalid || showError}>
          <XStack ai="center" h={48}>
            <StyledText color="$fontColor">@</StyledText>
            <RNTextInput
              style={{
                height: 48,
                flex: 1,
                paddingLeft: 4,
              }}
              autoFocus={autoFocus}
              autoCorrect={false}
              placeholder="Username"
              autoCapitalize="none"
              returnKeyType="done"
              maxLength={15}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              onSubmitEditing={onSubmitEditing}
            />
          </XStack>
        </Container>
      )}
    />
  );
}

type StyledTextInputProps = TextInputProps & { hasError?: boolean };
export const StyledTextInput = forwardRef(function StyledTextInput(
  {
    style,
    value,
    placeholder,
    onChangeText,
    onBlur,
    multiline,
    numberOfLines,
    hasError,
    ...props
  }: StyledTextInputProps,
  ref: Ref<RNTextInput>
): JSX.Element {
  const theme = useTheme();

  return (
    <Container hasError={hasError} style={style}>
      <RNTextInput
        ref={ref}
        style={[
          {
            // backgroundColor: theme.custom.colors.textBackground,
            // borderColor: theme.custom.colors.textInputBorderFull,
            color: theme.custom.colors.secondary,
            minHeight:
              multiline && numberOfLines
                ? numberOfLines * 24
                : theme.custom.size.container,
            // borderWidth: theme.custom.size.borderWidth,
            // borderRadius: theme.custom.borderRadius.medium,
          },
          // styles.container,
          styles.textInput,
          // style,
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
    </Container>
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

type PasswordInputProps = TextInputProps &
  UseControllerProps & { hasError?: boolean };
export const PasswordInput = forwardRef(
  (
    {
      control,
      rules,
      name,
      placeholder,
      autoFocus,
      hasError,
      ...props
    }: PasswordInputProps,
    ref: Ref<RNTextInput>
  ) => (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { invalid },
      }) => (
        <StyledTextInput
          hasError={hasError || invalid}
          ref={ref}
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
          secureTextEntry
          onBlur={onBlur}
          onChangeText={onChange}
          value={value}
          placeholder={placeholder}
          {...props}
        />
      )}
    />
  )
);

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
