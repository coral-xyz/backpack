import React from "react";
import { TextInput } from "./TextInput";

export const PasswordInput = (
  props: React.ComponentProps<typeof TextInput>
) => (
  <TextInput
    secureTextEntry
    textContentType="password"
    keyboardType="ascii-capable"
    {...props}
  />
);
