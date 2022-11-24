import {
  jsx as _jsx,
  Fragment as _Fragment,
  jsxs as _jsxs,
} from "react/jsx-runtime";
import { useBackgroundClient } from "@coral-xyz/recoil";
import {
  BACKPACK_FEATURE_XNFT,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
  DISCORD_INVITE_LINK,
} from "@coral-xyz/common";
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
      icon: _jsx(IconLeft, { name: "person" }),
      detailIcon: _jsx(IconPushDetail, {}),
    },
    {
      label: "Preferences",
      onPress: () => navigation.push("preferences"),
      icon: _jsx(IconLeft, { name: "settings" }),
      detailIcon: _jsx(IconPushDetail, {}),
    },
  ];
  if (BACKPACK_FEATURE_XNFT) {
    settingsMenu.push({
      label: "xNFTs",
      onPress: () => navigation.push("xnfts"),
      icon: _jsx(IconLeft, { name: "apps" }),
      detailIcon: _jsx(IconPushDetail, {}),
    });
  }
  settingsMenu.push({
    label: "Lock Wallet",
    onPress: () => lockWallet(),
    icon: _jsx(IconLeft, { name: "lock" }),
    detailIcon: null,
  });
  const discordList = [
    {
      label: "Waiting Room",
      onPress: () => navigation.push("waiting-room"),
      icon: _jsx(IconLeft, { name: "people" }),
      detailIcon: _jsx(IconPushDetail, {}),
    },
    {
      label: "Need help? Hop into Discord",
      onPress: () => Linking.openURL(DISCORD_INVITE_LINK, "_blank"),
      icon: _jsx(IconLeft, { name: "people" }),
      detailIcon: _jsx(IconLaunchDetail, {}),
    },
  ];
  return _jsxs(_Fragment, {
    children: [
      _jsx(Margin, {
        vertical: 12,
        children: _jsx(RoundedContainer, {
          children: settingsMenu.map((item) => {
            return _jsx(SettingsRow, {
              onPress: item.onPress,
              icon: item.icon,
              detailIcon: item.detailIcon,
              label: item.label,
            });
          }),
        }),
      }),
      _jsx(RoundedContainer, {
        children: discordList.map((item) => {
          return _jsx(SettingsRow, {
            onPress: item.onPress,
            icon: item.icon,
            detailIcon: item.detailIcon,
            label: item.label,
          });
        }),
      }),
    ],
  });
}
//# sourceMappingURL=SettingsList.js.map
