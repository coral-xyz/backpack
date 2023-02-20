import { Alert, View } from "react-native";

import {
  Header,
  Margin,
  PrimaryButton,
  Screen,
  StyledTextInput,
  SubtextParagraph,
} from "~components/index";
import { UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY } from "@coral-xyz/common";
import { useBackgroundClient, useWalletPublicKeys } from "@coral-xyz/recoil";
import { Controller, useForm } from "react-hook-form";

import { InputField } from "~components/Form";
import { validateSecretKey } from "~lib/validateSecretKey";

type PrivateKeyInput = {
  name: string;
  privateKey: string;
};

export function ImportPrivateKeyScreen({ route }) {
  const { blockchain } = route.params;
  const background = useBackgroundClient();
  const existingPublicKeys = useWalletPublicKeys();

  const { control, handleSubmit, formState } = useForm({
    defaultValues: {
      name: "",
      privateKey: "",
    },
  });

  const hasError = (name: string) => !!formState.errors[name];
  const isValid = Object.keys(formState.errors).length === 0;

  const onSubmit = async ({ name, privateKey }: PrivateKeyInput) => {
    let secretKeyHex;
    try {
      secretKeyHex = validateSecretKey(
        blockchain,
        privateKey,
        existingPublicKeys
      );
    } catch (e: any) {
      Alert.alert("Error Validating", e.toString());
      return;
    }

    try {
      await background.request({
        method: UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
        params: [blockchain, secretKeyHex, name],
      });
      Alert.alert("Added public key");
    } catch (e: any) {
      Alert.alert("Error saving key", e.toString());
    }
  };

  return (
    <Screen style={{ justifyContent: "space-between" }}>
      <View>
        <Header text="Import private key" />
        <Margin bottom={32}>
          <SubtextParagraph>
            Enter your private key. It will be encrypted and stored on your
            device.
          </SubtextParagraph>
        </Margin>
        <InputField label="Wallet Name" hasError={hasError("name")}>
          <Controller
            name="name"
            control={control}
            rules={{
              required: true,
              minLength: 2,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <StyledTextInput
                autoFocus
                placeholder="Enter wallet name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
        </InputField>
        <InputField label="Private Key" hasError={hasError("privateKey")}>
          <Controller
            name="privateKey"
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <StyledTextInput
                multiline
                numberOfLines={6}
                placeholder="Enter private key"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
        </InputField>
      </View>
      <PrimaryButton
        onPress={handleSubmit(onSubmit)}
        label="Import"
        disabled={!isValid}
      />
    </Screen>
  );
}
