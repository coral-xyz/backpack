import React, { useCallback } from "react";
import { Alert } from "react-native";

import * as Clipboard from "expo-clipboard";

import {
  formatWalletAddress,
  UI_RPC_METHOD_KEYNAME_READ,
} from "@coral-xyz/common";
import { useBackgroundClient, useWalletPublicKeys } from "@coral-xyz/recoil";
import { useFocusEffect } from "@react-navigation/native";

import { Screen } from "~components/index";
import { SettingsList } from "~screens/Unlocked/Settings/components/SettingsMenuList";
import { IconCopyContent } from "~screens/Unlocked/Settings/components/SettingsRow";

export function EditWalletDetailScreen({ navigation, route }): JSX.Element {
  const { blockchain, name, publicKey, type } = route.params;
  const background = useBackgroundClient();
  const publicKeyData = useWalletPublicKeys();

  const readNewName = useCallback(() => {
    (async () => {
      const name = await background.request({
        method: UI_RPC_METHOD_KEYNAME_READ,
        params: [publicKey],
      });

      navigation.setOptions({
        title: `${name} (${formatWalletAddress(publicKey)})`,
      });
    })();
  }, [background, publicKey, navigation]);

  useFocusEffect(readNewName);

  // Account recovery is not possible for private key imports, so prevent
  // removal of wallets if they are the last one in the wallet that can be used
  // for recovery
  const isLastRecoverable =
    Object.values(publicKeyData)
      .map((keyring) => [...keyring.hdPublicKeys, ...keyring.ledgerPublicKeys])
      .flat()
      .filter((n) => n.publicKey !== publicKey).length === 0;

  const menuItems = {
    "Rename Wallet": {
      onPress: () =>
        navigation.push("edit-wallets-rename", {
          publicKey,
          name: route.params.name,
        }),
    },
    "Copy Address": {
      onPress: async () => {
        await Clipboard.setStringAsync(publicKey);
        Alert.alert("Copied to clipboard");
      },
      detail: <IconCopyContent />,
    },
  };

  const secrets = {
    "Show private key": {
      onPress: () => navigation.push("show-private-key-warning", { publicKey }),
    },
  };

  const removeWallet = {
    "Remove Wallet": {
      onPress: () =>
        navigation.push("edit-wallets-remove", {
          blockchain,
          publicKey,
          name,
          type,
        }),
    },
  };

  return (
    <Screen>
      <SettingsList menuItems={menuItems} />
      {type !== "ledger" ? <SettingsList menuItems={secrets} /> : null}
      {!isLastRecoverable ? <SettingsList menuItems={removeWallet} /> : null}
    </Screen>
  );
}
