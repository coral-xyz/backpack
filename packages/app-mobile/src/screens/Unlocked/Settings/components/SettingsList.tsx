import { Margin } from "@components";
import {
  BACKPACK_FEATURE_XNFT,
  Blockchain,
  DISCORD_INVITE_LINK,
  UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
  UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { useTheme } from "@hooks";
import { useNavigation } from "@react-navigation/native";
import { Linking } from "expo-linking";

import {
  IconLaunchDetail,
  IconLeft,
  IconPushDetail,
  RoundedContainer,
  SettingsRow,
} from "./SettingsRow";

export function SettingsList() {
  const background = useBackgroundClient();
  const navigation = useNavigation();

  const lockWallet = () => {
    background
      .request({
        method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
        params: [],
      })
      .catch(console.error);
  };

  const settingsMenu = [
    {
      label: "Your Account",
      onPress: () => navigation.push("YourAccount"),
      icon: <IconLeft name="person" />,
      detailIcon: <IconPushDetail />,
    },
    {
      label: "Preferences",
      onPress: () => navigation.push("Preferences"),
      icon: <IconLeft name="settings" />,
      detailIcon: <IconPushDetail />,
    },
  ];

  if (BACKPACK_FEATURE_XNFT) {
    settingsMenu.push({
      label: "xNFTs",
      onPress: () => navigation.push("xNFTSettings"),
      icon: <IconLeft name="apps" />,
      detailIcon: <IconPushDetail />,
    });
  }

  settingsMenu.push({
    label: "Lock Wallet",
    onPress: () => lockWallet(),
    icon: <IconLeft name="lock" />,
    detailIcon: null,
  });

  const discordList = [
    {
      label: "Waiting Room",
      onPress: () => navigation.push("WaitingRoom"),
      icon: <IconLeft name="people" />,
      detailIcon: <IconPushDetail />,
    },
    {
      label: "Need help? Hop into Discord",
      onPress: () => Linking.openURL(DISCORD_INVITE_LINK),
      icon: <IconLeft name="people" />,
      detailIcon: <IconLaunchDetail />,
    },
  ];

  return (
    <>
      <Margin vertical={12}>
        <RoundedContainer>
          {settingsMenu.map((item) => {
            return (
              <SettingsRow
                key={item.label}
                label={item.label}
                onPress={item.onPress}
                icon={item.icon}
                detailIcon={item.detailIcon}
              />
            );
          })}
        </RoundedContainer>
      </Margin>
      <RoundedContainer>
        {discordList.map((item) => {
          return (
            <SettingsRow
              onPress={item.onPress}
              icon={item.icon}
              detailIcon={item.detailIcon}
              label={item.label}
            />
          );
        })}
      </RoundedContainer>
    </>
  );
}
