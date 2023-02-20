import { Controller } from "react-hook-form";

import { StyledTextInput } from "./StyledTextInput";

export const PasswordInput = ({
  control,
  rules,
  name,
  placeholder,
  ...props
}: any) => (
  <Controller
    name={name}
    control={control}
    rules={rules}
    render={({ field: { onChange, onBlur, value } }) => (
      <StyledTextInput
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
);
