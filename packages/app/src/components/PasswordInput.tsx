import { TextInput } from "react-native";
import tw from "twrnc";

export const PasswordInput: React.FC<React.ComponentProps<typeof TextInput>> = (
  props
) => (
  <TextInput
    autoCapitalize="none"
    autoComplete="off"
    autoCorrect={false}
    keyboardType="ascii-capable"
    placeholderTextColor={"#ccc"}
    secureTextEntry
    style={tw`rounded-xl bg-transparent p-5 my-2 text-white text-lg border-gray-700 border-2 border-solid`}
    textContentType="password"
    {...props}
    // onChangeText={setPubkey}
    // onSubmitEditing={_handleSubmit}
    // value={pubkey}
  />
);
