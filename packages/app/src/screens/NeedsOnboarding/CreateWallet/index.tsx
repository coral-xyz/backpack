import {
  DerivationPath,
  UI_RPC_METHOD_KEYRING_STORE_CREATE,
  UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import React from "react";
import { Text } from "react-native";
import { useNavigate } from "react-router-native";
import tw from "twrnc";
import { CustomButton } from "../../../components/CustomButton";
import { PasswordInput } from "../../../components/PasswordInput";
import { __TEMPORARY_FIXED_PASSWORD_TO_UNLOCK_BACKPACK__ } from "../../../lib/toRemove";
import { useRequest } from "../../../lib/useRequest";

export default function CreateWallet() {
  return <CreatePassword />;
}

const CreatePassword = () => {
  const mnemonic = useRequest(UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE, 128);
  const background = useBackgroundClient();
  const navigate = useNavigate();

  return (
    <>
      <Text style={tw`text-white text-2xl`}>Create a password</Text>
      <Text style={tw`text-[#71717A] text-lg`}>
        You'll need this to unlock Backpack.
      </Text>
      <PasswordInput
        placeholder="Password"
        value={__TEMPORARY_FIXED_PASSWORD_TO_UNLOCK_BACKPACK__}
      />
      <PasswordInput
        placeholder="Confirm Password"
        value={__TEMPORARY_FIXED_PASSWORD_TO_UNLOCK_BACKPACK__}
      />
      <Text style={tw`text-gray-400`}>I agree to the Terms of Service</Text>
      {mnemonic && (
        <>
          <Text style={tw`text-white`}>{mnemonic}</Text>
          <CustomButton
            text="Create wallet"
            onPress={async () => {
              await background.request({
                method: UI_RPC_METHOD_KEYRING_STORE_CREATE,
                params: [
                  mnemonic,
                  DerivationPath.Bip44Change,
                  __TEMPORARY_FIXED_PASSWORD_TO_UNLOCK_BACKPACK__,
                  [0],
                ],
              });
              navigate("/");
            }}
          />
        </>
      )}
    </>
  );
};
