import { Alert, View } from "react-native";

import { UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY } from "@coral-xyz/common";
import { useBackgroundClient, useWalletPublicKeys } from "@coral-xyz/recoil";
import { Controller, useForm } from "react-hook-form";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { InputField } from "~components/Form";
import {
  Header,
  Margin,
  PrimaryButton,
  Screen,
  StyledTextInput,
  SubtextParagraph,
} from "~components/index";
import { validateSecretKey } from "~lib/validateSecretKey";

type PrivateKeyInput = {
  name: string;
  privateKey: string;
};

export function ImportPrivateKeyScreen({ route }) {
  const { blockchain } = route.params;
  const insets = useSafeAreaInsets();
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
    <Screen jc="space-between" style={{ marginBottom: insets.bottom }}>
      <View>
        <Header text="Import private key" />
        <Margin bottom={32}>
          <SubtextParagraph>
            Enter your private key. It will be encrypted and stored on your
            device.
          </SubtextParagraph>
        </Margin>
        <Controller
          name="privateKey"
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <StyledTextInput
              multiline
              numberOfLines={1}
              placeholder="Enter private key"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
      </View>
      <PrimaryButton
        onPress={handleSubmit(onSubmit)}
        label="Import"
        disabled={!isValid}
      />
    </Screen>
  );
}
