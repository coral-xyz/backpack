import React from "react";
import { Control, useController } from "react-hook-form";
import { TextInput } from "react-native";
import tw from "twrnc";

export const PasswordInput: React.FC<
  { name: string; control: Control; rules?: any } & React.ComponentProps<
    typeof TextInput
  >
> = ({ name, control, rules, ...props }) => {
  const { field } = useController({
    control,
    defaultValue: "",
    name,
    rules,
  });

  return (
    <TextInput
      autoCapitalize="none"
      autoComplete="off"
      autoCorrect={false}
      keyboardType="ascii-capable"
      placeholderTextColor={"#ccc"}
      secureTextEntry
      style={tw`rounded-xl bg-transparent p-5 my-2 text-white text-lg border-gray-700 border-2 border-solid`}
      textContentType="password"
      onBlur={field.onBlur}
      onChangeText={field.onChange}
      ref={field.ref}
      value={field.value}
      {...props}
    />
  );
};
