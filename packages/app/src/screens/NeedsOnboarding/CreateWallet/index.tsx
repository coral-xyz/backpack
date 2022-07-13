import {
  DerivationPath,
  UI_RPC_METHOD_KEYRING_STORE_CREATE,
  UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import React from "react";
import { useForm } from "react-hook-form";
import { Text } from "react-native";
import { useNavigate } from "react-router-native";
import tw from "twrnc";
import { CheckBox } from "../../../components/CheckBox";
import { CustomButton } from "../../../components/CustomButton";
import { ErrorMessage } from "../../../components/ErrorMessage";
import { PasswordInput } from "../../../components/PasswordInput";
import { ButtonFooter, MainContent } from "../../../components/Templates";
import { useRequest } from "../../../lib/useRequest";

export default function CreateWallet() {
  return <CreatePassword />;
}

interface FormData {
  password: string;
  passwordConfirmation: string;
  agreedToTerms: boolean;
}

const CreatePassword = () => {
  const mnemonic = useRequest(UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE, 128);
  const background = useBackgroundClient();

  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>();

  const onSubmit = async ({ password }: FormData) => {
    await background.request({
      method: UI_RPC_METHOD_KEYRING_STORE_CREATE,
      params: [mnemonic, DerivationPath.Bip44Change, password, [0]],
    });
    navigate("/");
  };

  return (
    <>
      <MainContent>
        <Text style={tw`text-white text-2xl font-bold`}>Create a password</Text>
        <Text style={tw`text-[#71717A] text-lg mb-5`}>
          You'll need this to unlock Backpack.
        </Text>
        <PasswordInput
          placeholder="Password"
          name="password"
          control={control}
          rules={{
            required: "You must specify a password",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
          }}
        />
        <ErrorMessage for={errors.password} />

        <PasswordInput
          placeholder="Confirm Password"
          name="passwordConfirmation"
          control={control}
          rules={{
            validate: (val: string) => {
              if (val !== watch("password")) {
                return "Passwords do not match";
              }
            },
          }}
        />
        <ErrorMessage for={errors.passwordConfirmation} />

        <CheckBox
          name="agreedToTerms"
          control={control}
          label="I agree to the terms"
        />
        <ErrorMessage for={errors.agreedToTerms} />
      </MainContent>
      <ButtonFooter>
        {mnemonic && (
          <>
            <Text style={tw`text-white`}>{mnemonic}</Text>
            <CustomButton text="Next" onPress={handleSubmit(onSubmit)} />
          </>
        )}
      </ButtonFooter>
    </>
  );
};
