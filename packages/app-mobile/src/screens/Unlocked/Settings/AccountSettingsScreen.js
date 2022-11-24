import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Text, View } from "react-native";
import {
  // useActiveWallets,
  // useBlockchainLogo,
  useUsername,
  // WalletPublicKeys,
} from "@coral-xyz/recoil";
import { useTheme } from "@hooks";
import { WalletLists } from "./components/WalletList";
import { SettingsList } from "./components/SettingsList";
import { Margin, Screen, Avatar } from "@components";
export default function AccountSettingsModal() {
  return _jsxs(Screen, {
    style: { padding: 12 },
    children: [
      _jsx(Margin, { bottom: 24, children: _jsx(AvatarHeader, {}) }),
      _jsx(WalletLists, {}),
      _jsx(Margin, { bottom: 24, children: _jsx(SettingsList, {}) }),
    ],
  });
}
function AvatarHeader() {
  const username = useUsername();
  const theme = useTheme();
  return _jsxs(View, {
    style: { alignItems: "center" },
    children: [
      _jsx(Avatar, {}),
      username &&
        _jsxs(Text, {
          style: {
            textAlign: "center",
            color: theme.custom.colors.fontColor,
            fontWeight: "500",
            fontSize: 18,
            lineHeight: 28,
            marginTop: 8,
            marginBottom: 12,
          },
          children: ["@", username],
        }),
    ],
  });
}
//# sourceMappingURL=AccountSettingsScreen.js.map
