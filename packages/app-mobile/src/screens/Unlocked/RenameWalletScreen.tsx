import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  UI_RPC_METHOD_KEYNAME_UPDATE,
  formatWalletAddress,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";

import {
  PrimaryButton,
  Screen,
  SecondaryButton,
  StyledTextInput,
  TwoButtonFooter,
} from "~components/index";
import { useTheme } from "~hooks/useTheme";

export function RenameWalletScreen({ navigation, route }): JSX.Element {
  const background = useBackgroundClient();
  const theme = useTheme();

  const { name, publicKey } = route.params;
  const [walletName, setWalletName] = useState(name);

  const isPrimaryDisabled = walletName.trim() === "";

  return (
    <Screen style={{ justifyContent: "space-between" }}>
      <View>
        <StyledTextInput
          autoFocus
          value={walletName}
          onChangeText={setWalletName}
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
            onPress={async () => {
              await background.request({
                method: UI_RPC_METHOD_KEYNAME_UPDATE,
                params: [publicKey, walletName],
              });
            }}
          />
        }
      />
    </Screen>
  );
}
