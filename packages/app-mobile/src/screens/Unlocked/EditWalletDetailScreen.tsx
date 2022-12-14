import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import { Margin, Screen } from "@components";
import { UI_RPC_METHOD_KEYNAME_READ } from "@coral-xyz/common";
import { useBackgroundClient, useWalletPublicKeys } from "@coral-xyz/recoil";
import { SettingsList } from "@screens/Unlocked/Settings/components/SettingsMenuList";
import { IconCopyContent } from "@screens/Unlocked/Settings/components/SettingsRow";
import * as Clipboard from "expo-clipboard";

export function EditWalletDetailScreen({ navigation, route }): JSX.Element {
  const { blockchain, name, publicKey, type } = route.params;
  const background = useBackgroundClient();
  const blockchainKeyrings = useWalletPublicKeys();
  const keyring = blockchainKeyrings[blockchain];

  const publicKeyCount = Object.values(keyring).flat().length;

  const [walletName, setWalletName] = useState(name);

  useEffect(() => {
    (async () => {
      const keyname = await background.request({
        method: UI_RPC_METHOD_KEYNAME_READ,
        params: [publicKey],
      });

      setWalletName(keyname);
    })();
  }, []);

  const menuItems = {
    "Rename Wallet": {
      onPress: () =>
        navigation.push("edit-wallets-rename", {
          publicKey,
          name: walletName,
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
      // style: {
      //   color: theme.custom.colors.negative,
      // },
    },
  };

  return (
    <Screen>
      <SettingsList menuItems={menuItems} />
      {type !== "ledger" && (
        <Margin top={24}>
          <SettingsList menuItems={secrets} />
        </Margin>
      )}
      {publicKeyCount > 1 && (
        <Margin top={24}>
          <SettingsList menuItems={removeWallet} />
        </Margin>
      )}
    </Screen>
  );
}
