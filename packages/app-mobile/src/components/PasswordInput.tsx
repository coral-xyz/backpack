import { forwardRef, Ref } from "react";
import { TextInput, TextInputProps } from "react-native";

import { Controller, UseControllerProps } from "react-hook-form";

import { StyledTextInput } from "./StyledTextInput";

type PasswordInputProps = TextInputProps & UseControllerProps;
export const PasswordInput = forwardRef(
  (
    {
      control,
      rules,
      name,
      placeholder,
      autoFocus,
      ...props
    }: PasswordInputProps,
    ref: Ref<TextInput>
  ) => (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, onBlur, value } }) => (
        <StyledTextInput
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
