import React from "react";

import * as Linking from "expo-linking";

import {
  DISCORD_INVITE_LINK,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { useNavigation } from "@react-navigation/native";

import { DiscordIcon } from "~components/Icon";
import { Margin, RoundedContainerGroup } from "~components/index";
import { useTheme } from "~hooks/useTheme";

import {
  IconLaunchDetail,
  IconLeft,
  IconPushDetail,
  SettingsRow,
} from "./SettingsRow";

type SettingsMenuItem = {
  label: string;
  onPress: () => void;
  icon?: JSX.Element;
  disabled?: boolean;
  detailIcon?: JSX.Element | null;
};

export function SettingsList() {
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
      label: "Wallets",
      onPress: () => navigation.push("edit-wallets"),
      icon: <IconLeft name="account-balance-wallet" />,
      detailIcon: <IconPushDetail />,
    },
  ];

  const settingsMenu: SettingsMenuItem[] = [
    {
      label: "Your Account",
      onPress: () => navigation.push("YourAccount"),
      icon: <IconLeft name="person" />,
      detailIcon: <IconPushDetail />,
    },
    // {
    //   label: "Preferences",
    //   onPress: () => navigation.push("Preferences"),
    //   icon: <IconLeft name="settings" />,
    //   detailIcon: <IconPushDetail />,
    // },
  ];

  // settingsMenu.push({
  //   label: "Friends",
  //   disabled: true,
  //   onPress: () => navigation.push("contacts-list"),
  //   icon: <IconLeft name="people" />,
  //   detailIcon: <IconPushDetail />,
  // });

  // if (BACKPACK_FEATURE_XNFT) {
  //   settingsMenu.push({
  //     label: "xNFTs",
  //     disabled: true,
  //     onPress: () => navigation.push("xNFTSettings"),
  //     icon: <IconLeft name="apps" />,
  //     detailIcon: <IconPushDetail />,
  //   });
  // }

  settingsMenu.push({
    label: "Lock Wallet",
    onPress: () => lockWallet(),
    icon: <IconLeft name="lock" />,
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
          <>
            {walletsMenu.map((item: SettingsMenuItem) => {
              return (
                <SettingsRow
                  key={item.label}
                  label={item.label}
                  onPress={item.onPress}
                  icon={item.icon}
                  detailIcon={item.detailIcon}
                  disabled={item.disabled}
                />
              );
            })}
          </>
        </RoundedContainerGroup>
      </Margin>
      <Margin bottom={24}>
        <RoundedContainerGroup>
          <>
            {settingsMenu.map((item: SettingsMenuItem) => {
              return (
                <SettingsRow
                  key={item.label}
                  label={item.label}
                  onPress={item.onPress}
                  icon={item.icon}
                  detailIcon={item.detailIcon}
                  disabled={item.disabled}
                />
              );
            })}
          </>
        </RoundedContainerGroup>
      </Margin>
      <RoundedContainerGroup>
        <>
          {discordList.map((item: SettingsMenuItem) => {
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
        </>
      </RoundedContainerGroup>
    </>
  );
}
