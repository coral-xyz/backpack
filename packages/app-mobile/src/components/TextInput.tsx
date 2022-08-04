import React from "react";
import type { Control } from "react-hook-form";
import { useController } from "react-hook-form";
import { TextInput as RNTextInput } from "react-native";
import tw from "twrnc";

import { addTestIdentifier } from "../lib/addTestIdentifier";

export const TextInput: React.FC<
  { name: string; control: Control; rules?: any } & React.ComponentProps<
    typeof RNTextInput
  >
> = ({ name, control, rules, ...props }) => {
  const { field } = useController({
    control,
    defaultValue: "",
    name,
    rules,
  });

  return (
    <RNTextInput
      autoCapitalize="none"
      autoComplete="off"
      autoCorrect={false}
      placeholderTextColor={"#ccc"}
      style={tw`rounded-xl bg-transparent p-5 my-2 text-white text-lg border-gray-700 border-2 border-solid`}
      onBlur={field.onBlur}
      onChangeText={field.onChange}
      ref={field.ref}
      value={field.value}
      {...addTestIdentifier(props.placeholder!)}
      {...props}
    />
  );
};
