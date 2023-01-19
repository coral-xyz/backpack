import * as Linking from "expo-linking";

import { Margin, RoundedContainerGroup } from "@components";
import {
  BACKPACK_FEATURE_XNFT,
  DISCORD_INVITE_LINK,
  MESSAGES_ENABLED,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
} from "@coral-xyz/common";
import { useBackgroundClient, useFeatureGates } from "@coral-xyz/recoil";
import { useTheme } from "@hooks";
import { useNavigation } from "@react-navigation/native";

import { DiscordIcon } from "@components/Icon";

import {
  IconLaunchDetail,
  IconLeft,
  IconPushDetail,
  SettingsRow,
} from "./SettingsRow";

export function SettingsList() {
  const featureGates = useFeatureGates();
  const background = useBackgroundClient();
  const navigation = useNavigation();
  const theme = useTheme();

  const lockWallet = () => {
    background
      .request({
        method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
        params: [],
      })
      .catch(console.error);
  };

  const walletsMenu = [
    {
      label: "Manage Wallets",
      onPress: () => navigation.push("edit-wallets"),
      icon: <IconLeft name="account-balance-wallet" />,
      detailIcon: <IconPushDetail />,
    },
  ];

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

  if (featureGates[MESSAGES_ENABLED]) {
    settingsMenu.push({
      label: "Contacts",
      onPress: () => navigation.push("contacts-list"),
      icon: <IconLeft name="people" />,
      detailIcon: <IconPushDetail />,
    });
  }

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
      label: "Need help? Hop into Discord",
      onPress: () => Linking.openURL(DISCORD_INVITE_LINK),
      icon: <DiscordIcon color={theme.custom.colors.icon} />,
      detailIcon: <IconLaunchDetail />,
    },
  ];

  return (
    <>
      <Margin bottom={24}>
        <RoundedContainerGroup>
          {walletsMenu.map((item) => {
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
        </RoundedContainerGroup>
      </Margin>
      <Margin bottom={24}>
        <RoundedContainerGroup>
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
        </RoundedContainerGroup>
      </Margin>
      <RoundedContainerGroup>
        {discordList.map((item) => {
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
      </RoundedContainerGroup>
    </>
  );
}
