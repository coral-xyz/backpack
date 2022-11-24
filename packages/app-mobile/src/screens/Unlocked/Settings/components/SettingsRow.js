import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@hooks";
import { Margin, WalletAddressLabel } from "@components";
import { MaterialIcons } from "@expo/vector-icons";
export function RoundedContainer({ children }) {
  const theme = useTheme();
  return _jsx(View, {
    style: [
      styles.roundedContainer,
      {
        borderColor: theme.custom.colors.borderFull,
      },
    ],
    children: children,
  });
}
export function IconPushDetail() {
  const theme = useTheme();
  return _jsx(MaterialIcons, {
    name: "keyboard-arrow-right",
    size: 24,
    color: theme.custom.colors.icon,
  });
}
export function IconExpand({ collapsed = true }) {
  const theme = useTheme();
  const name = collapsed ? `keyboard-arrow-down` : `keyboard-arrow-up`;
  return _jsx(MaterialIcons, {
    name: name,
    size: 24,
    color: theme.custom.colors.icon,
  });
}
export function IconLaunchDetail() {
  const theme = useTheme();
  return _jsx(MaterialIcons, {
    name: "launch",
    size: 24,
    color: theme.custom.colors.icon,
  });
}
export function IconLeft({ name }) {
  const theme = useTheme();
  return _jsx(MaterialIcons, {
    name: name,
    color: theme.custom.colors.icon,
    size: 24,
  });
}
function RowContainer({ children }) {
  const theme = useTheme();
  return _jsx(View, {
    style: [
      styles.container,
      {
        backgroundColor: theme.custom.colors.nav,
      },
    ],
    children: children,
  });
}
export function SettingsRow({ label, onPress, icon, detailIcon }) {
  const theme = useTheme();
  return _jsx(Pressable, {
    onPress: () => onPress(),
    children: _jsxs(RowContainer, {
      children: [
        _jsxs(View, {
          style: styles.leftSide,
          children: [
            _jsx(Margin, { right: 12, children: icon }),
            _jsx(Text, {
              style: [styles.label, { color: theme.custom.colors.fontColor }],
              children: label,
            }),
          ],
        }),
        detailIcon ? detailIcon : null,
      ],
    }),
  });
}
export function SettingsWalletRow({ icon, name, publicKey, onPress }) {
  return _jsx(Pressable, {
    onPress: () => onPress(),
    children: _jsxs(RowContainer, {
      children: [
        _jsxs(View, {
          style: styles.leftSide,
          children: [
            _jsx(Margin, {
              right: 12,
              children: _jsx(Image, {
                source: icon,
                style: { width: 24, height: 24, borderRadius: 48 },
              }),
            }),
            _jsx(WalletAddressLabel, { name: name, publicKey: publicKey }),
          ],
        }),
        _jsx(IconExpand, { collapsed: true }),
      ],
    }),
  });
}
const styles = StyleSheet.create({
  roundedContainer: {
    overflow: "hidden",
    borderRadius: 12,
  },
  container: {
    paddingHorizontal: 12,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSide: {
    flexDirection: "row",
  },
  label: {
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 24,
  },
});
//# sourceMappingURL=SettingsRow.js.map
