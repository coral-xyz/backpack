import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";

import {
  UI_RPC_METHOD_KEYNAME_UPDATE,
  formatWalletAddress,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  PrimaryButton,
  Screen,
  SecondaryButton,
  StyledTextInput,
  TwoButtonFooter,
} from "~components/index";
import { useTheme } from "~hooks/useTheme";

export function RenameWalletScreen({ navigation, route }): JSX.Element {
  const insets = useSafeAreaInsets();
  const background = useBackgroundClient();
  const theme = useTheme();

  const { name, publicKey, blockchain } = route.params;
  const [walletName, setWalletName] = useState(name);

  const isPrimaryDisabled = walletName.trim() === "";

  const handleSaveName = async () => {
    await background.request({
      method: UI_RPC_METHOD_KEYNAME_UPDATE,
      params: [publicKey, walletName, blockchain],
    });

    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={72}
    >
      <Screen jc="space-between" style={{ marginBottom: insets.bottom }}>
        <View>
          <StyledTextInput
            autoFocus
            value={walletName}
            onChangeText={setWalletName}
            onSubmitEditing={handleSaveName}
            returnKeyType="done"
          />
          <Text
            style={{
              marginTop: 12,
              textAlign: "center",
              color: theme.custom.colors.secondary,
            }}
          >
            ({formatWalletAddress(publicKey)})
          </Text>
        </View>
        <TwoButtonFooter
          leftButton={
            <SecondaryButton
              label="Cancel"
              onPress={() => {
                navigation.goBack();
              }}
            />
          }
          rightButton={
            <PrimaryButton
              label="Update"
              disabled={isPrimaryDisabled}
              onPress={handleSaveName}
            />
          }
        />
      </Screen>
    </KeyboardAvoidingView>
  );
}
