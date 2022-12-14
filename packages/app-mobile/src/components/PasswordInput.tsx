import { Controller } from "react-hook-form";

import { StyledTextInput } from "./StyledTextInput";

export const PasswordInput = ({ control, rules, name, placeholder }: any) => (
  <Controller
    name={name}
    control={control}
    rules={rules}
    render={({ field: { onChange, onBlur, value } }) => (
      <StyledTextInput
        secureTextEntry={true}
        onBlur={onBlur}
        onChangeText={onChange}
        value={value}
        placeholder={placeholder}
      />
    )}
  />
);
