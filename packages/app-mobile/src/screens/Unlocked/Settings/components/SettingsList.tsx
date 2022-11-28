import { useBackgroundClient } from "@coral-xyz/recoil";
import {
  Blockchain,
  BACKPACK_FEATURE_XNFT,
  UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
  UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
  DISCORD_INVITE_LINK,
} from "@coral-xyz/common";
import { useTheme } from "@hooks";
import { Linking } from "expo-linking";
import { useNavigation } from "@react-navigation/native";
import {
  RoundedContainer,
  SettingsRow,
  IconPushDetail,
  IconLaunchDetail,
  IconLeft,
} from "./SettingsRow";
import { Margin } from "@components";

export function SettingsList({}) {
  const background = useBackgroundClient();
  const navigation = useNavigation();
  // const theme = useTheme();

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
      onPress: () => navigation.push("your-account"),
      icon: <IconLeft name="person" />,
      detailIcon: <IconPushDetail />,
    },
    {
      label: "Preferences",
      onPress: () => navigation.push("preferences"),
      icon: <IconLeft name="settings" />,
      detailIcon: <IconPushDetail />,
    },
  ];

  if (BACKPACK_FEATURE_XNFT) {
    settingsMenu.push({
      label: "xNFTs",
      onPress: () => navigation.push("xnfts"),
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
      onPress: () => navigation.push("waiting-room"),
      icon: <IconLeft name="people" />,
      detailIcon: <IconPushDetail />,
    },
    {
      label: "Need help? Hop into Discord",
      onPress: () => Linking.openURL(DISCORD_INVITE_LINK, "_blank"),
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
                onPress={item.onPress}
                icon={item.icon}
                detailIcon={item.detailIcon}
                label={item.label}
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
