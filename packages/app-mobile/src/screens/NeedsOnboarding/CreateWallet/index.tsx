import {
  DerivationPath,
  UI_RPC_METHOD_KEYRING_STORE_CREATE,
  UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE,
  UI_RPC_METHOD_KEYRING_VALIDATE_MNEMONIC,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Text } from "react-native";
import { useNavigate } from "react-router-native";
import tw from "twrnc";

import { CheckBox } from "../../../components/CheckBox";
import { CustomButton } from "../../../components/CustomButton";
import { ErrorMessage } from "../../../components/ErrorMessage";
import { PasswordInput } from "../../../components/PasswordInput";
import { ButtonFooter, MainContent } from "../../../components/Templates";
import { TextInput } from "../../../components/TextInput";
import { useRequest } from "../../../lib/useRequest";

export default function CreateWallet({ importExisting = false }) {
  return importExisting ? <ExistingWallet /> : <NewWallet />;
}

const ExistingWallet = () => {
  const [recoveryPhrase, setRecoveryPhrase] = useState("");

  return recoveryPhrase ? (
    <NewWallet recoveryPhrase={recoveryPhrase} />
  ) : (
    <ImportRecoveryPhrase setRecoveryPhrase={setRecoveryPhrase} />
  );
};

const NewWallet = ({ recoveryPhrase }: { recoveryPhrase?: string }) => {
  const [password, setPassword] = useState("");
  const _recoveryPhrase =
    recoveryPhrase ||
    useRequest(UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE, 128);

  return password ? (
    <ShowSecretRecoveryPhrase
      password={password}
      recoveryPhrase={_recoveryPhrase!}
    />
  ) : (
    <CreatePassword setPassword={setPassword} />
  );
};

interface ImportRecoveryPhraseFormData {
  recoveryPhrase: string;
}
const ImportRecoveryPhrase = ({ setRecoveryPhrase }: any) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ImportRecoveryPhraseFormData>();
  const background = useBackgroundClient();

  const onSubmit = async ({ recoveryPhrase }: ImportRecoveryPhraseFormData) => {
    background
      .request({
        method: UI_RPC_METHOD_KEYRING_VALIDATE_MNEMONIC,
        params: [recoveryPhrase],
      })
      .then((isValid: boolean) => {
        return isValid
          ? setRecoveryPhrase(recoveryPhrase)
          : setError("recoveryPhrase", { message: "Invalid recovery phrase" });
      });
  };

  return (
    <>
      <MainContent>
        <Text style={tw`text-white`}>Secret recovery phrase</Text>
        <TextInput
          placeholder="Recovery phrase"
          name="recoveryPhrase"
          control={control}
          rules={{
            required: "You must enter a valid 12 word recovery phrase",
          }}
        />
        <ErrorMessage for={errors.recoveryPhrase} />
      </MainContent>
      <ButtonFooter>
        <CustomButton text="Import" onPress={handleSubmit(onSubmit)} />
      </ButtonFooter>
    </>
  );
};

interface CreatePasswordFormData {
  password: string;
  passwordConfirmation: string;
  agreedToTerms: boolean;
}
const CreatePassword: React.FC<{
  setPassword: React.Dispatch<React.SetStateAction<string>>;
}> = ({ setPassword }) => {
  const onSubmit = ({ password }: CreatePasswordFormData) =>
    setPassword(password);
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreatePasswordFormData>();
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
        <CustomButton text="Next" onPress={handleSubmit(onSubmit)} />
      </ButtonFooter>
    </>
  );
};

const ShowSecretRecoveryPhrase: React.FC<{
  password: string;
  recoveryPhrase: string;
}> = ({ password, recoveryPhrase }) => {
  const background = useBackgroundClient();
  const navigate = useNavigate();

  const onSubmit = async () => {
    await background.request({
      method: UI_RPC_METHOD_KEYRING_STORE_CREATE,
      params: [recoveryPhrase, DerivationPath.Bip44, password, [0]],
    });
    navigate("/");
  };

  return (
    <>
      <MainContent>
        <Text style={tw`text-white text-2xl font-bold`}>
          Secret recovery phrase
        </Text>
        <Text style={tw`text-gray-400`}>
          This is the only way to recover your account if you lose your device.
          Write it down and store it in a safe place.
        </Text>
        <Text style={tw`text-white p-10`}>{recoveryPhrase}</Text>
      </MainContent>
      <ButtonFooter>
        <CustomButton text="Continue" onPress={onSubmit} />
      </ButtonFooter>
    </>
  );
};
