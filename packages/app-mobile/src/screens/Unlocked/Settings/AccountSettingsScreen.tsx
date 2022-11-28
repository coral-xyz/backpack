import { Image, Text, View } from "react-native";
import {
  useAvatarUrl,
  // useBackgroundClient,
  useWalletPublicKeys,
  // useActiveWallets,
  // useBlockchainLogo,
  useUsername,
  // WalletPublicKeys,
} from "@coral-xyz/recoil";
import {
  // openPopupWindow,
  Blockchain,
  // BACKPACK_FEATURE_POP_MODE,
  // BACKPACK_FEATURE_XNFT,
  // UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
  // UI_RPC_METHOD_KEYRING_STORE_LOCK,
  // UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
  // DISCORD_INVITE_LINK,
} from "@coral-xyz/common";
import { useTheme } from "@hooks";
import { WalletLists } from "./components/WalletList";
import { SettingsList } from "./components/SettingsList";
import { Margin, Screen, Avatar } from "@components";

export default function AccountSettingsModal() {
  return (
    <Screen style={{ padding: 12 }}>
      <Margin bottom={24}>
        <AvatarHeader />
      </Margin>
      <WalletLists />
      <Margin bottom={24}>
        <SettingsList />
      </Margin>
    </Screen>
  );
}

function AvatarHeader() {
  const username = useUsername();
  const theme = useTheme();
  return (
    <View style={{ alignItems: "center" }}>
      <Avatar />
      {username && (
        <Text
          style={{
            textAlign: "center",
            color: theme.custom.colors.fontColor,
            fontWeight: "500",
            fontSize: 18,
            lineHeight: 28,
            marginTop: 8,
            marginBottom: 12,
          }}
        >
          @{username}
        </Text>
      )}
    </View>
  );
}
