import { StyleSheet, Text, View } from "react-native";
import { Avatar, Margin, Screen } from "@components";
import { useUsername } from "@coral-xyz/recoil";
import { useTheme } from "@hooks";

import { SettingsList } from "./components/SettingsList";
import { WalletLists } from "./components/WalletList";

export default function AccountSettingsModal() {
  return (
    <Screen>
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
          style={[
            styles.usernameText,
            {
              color: theme.custom.colors.fontColor,
            },
          ]}
        >
          @{username}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  usernameText: {
    textAlign: "center",
    fontWeight: "500",
    fontSize: 18,
    lineHeight: 28,
    marginTop: 8,
    marginBottom: 12,
  },
});
