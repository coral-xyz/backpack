import {
  DerivationPath,
  UI_RPC_METHOD_KEYRING_STORE_CREATE,
  UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE,
} from "@coral-xyz/common";
import { Pressable, Text, TextInput } from "react-native";
import { Link } from "react-router-native";
import tw from "twrnc";
import { useRequest } from "../../../lib/useRequest";

export default function CreateWallet() {
  return <CreatePassword />;
}

const CreatePassword = () => {
  const mnemonic = useRequest(UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE, 128);
  const store = useRequest(
    UI_RPC_METHOD_KEYRING_STORE_CREATE,
    DerivationPath.Bip44Change,
    "testtest",
    [0]
  );

  return (
    <>
      <Text style={tw`text-white text-2xl`}>Create a pasword</Text>
      <Text style={tw`text-[#71717A] text-lg`}>
        You'll need this to unlock Backpack.
      </Text>
      <PasswordInput placeholder="Password" />
      <PasswordInput placeholder="Confirm Password" />
      <Text style={tw`text-gray-400`}>I agree to the Terms of Service</Text>
      {mnemonic && <Text style={tw`text-white`}>{mnemonic}</Text>}
      <Link to="/final" style={tw`bg-[#3F3F46] p-8 rounded-lg m-4`}>
        <Text style={tw`text-white`}>Final</Text>
      </Link>
    </>
  );
};

const CustomButton: React.FC<{
  text: string;
  primary?: boolean;
  onPress?: (event: Event) => void;
}> = ({ text, primary, onPress = console.log }) => (
  <Pressable
    style={tw`${
      primary ? "bg-teal-500" : "bg-gray-800"
    } p-4 rounded-xl mt-2 mb-2`}
    onPress={onPress}
  >
    <Text style={tw`text-white text-center font-medium ios:text-xl`}>
      {text}
    </Text>
  </Pressable>
);

const PasswordInput: React.FC<any> = ({ placeholder }) => (
  <TextInput
    style={tw`rounded-xl bg-transparent p-5 my-2 text-white text-lg border-gray-700 border-2 border-solid`}
    autoCapitalize="none"
    autoComplete="off"
    autoCorrect={false}
    keyboardType="ascii-capable"
    placeholder={placeholder}
    textContentType="password"
    placeholderTextColor={"#ccc"}
    secureTextEntry
    // onChangeText={setPubkey}
    // onSubmitEditing={_handleSubmit}
    // value={pubkey}
  />
);
