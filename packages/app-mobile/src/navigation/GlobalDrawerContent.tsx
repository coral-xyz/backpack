import { Alert, Button } from "react-native";

import {
  UI_RPC_METHOD_ACTIVE_USER_UPDATE,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
} from "@coral-xyz/common";
import { useAllUsers, useBackgroundClient, useUser } from "@coral-xyz/recoil";
import { StyledText, Stack, XStack } from "@coral-xyz/tamagui";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconButton } from "~components/Icon";
import { ListItemSettings } from "~components/ListItem";
import { UserAccountListItem } from "~components/UserAccountsMenu";
import { CurrentUserAvatar } from "~components/UserAvatar";

function ListItemSettingsLockWallet(): JSX.Element {
  const background = useBackgroundClient();
  return (
    <ListItemSettings
      title="Lock Backpack"
      iconName="lock"
      onPress={async () => {
        try {
          await background.request({
            method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
            params: [],
          });
        } catch (error: any) {
          Alert.alert("Error locking wallet", error.message);
        }
      }}
    />
  );
}

function Header() {
  const user = useUser();
  const navigation = useNavigation();

  return (
    <XStack ai="center" jc="space-between" px={16} mb={8}>
      <XStack ai="center">
        <CurrentUserAvatar size={32} />
        <StyledText ml={8}>@{user.username}</StyledText>
      </XStack>
      <IconButton
        name="settings"
        size="$headerIcon"
        color="$baseIcon"
        onPress={() => {
          navigation.navigate("AccountSettings");
        }}
      />
    </XStack>
  );
}

function UserList() {
  const background = useBackgroundClient();
  const users = useAllUsers();
  const user = useUser();

  const handlePressItem = async (uuid: string) => {
    await background.request({
      method: UI_RPC_METHOD_ACTIVE_USER_UPDATE,
      params: [uuid],
    });

    // onDismiss();
  };

  const handlePressAddAccount = () => {
    console.log("adding");
  };

  return (
    <Stack>
      <StyledText ml={12} mb={8} size="$xs" color="$baseTextMedEmphasis">
        ACCOUNTS ({users.length})
      </StyledText>
      {users.map(({ username, uuid }: any) => {
        return (
          <UserAccountListItem
            key={username}
            uuid={uuid}
            username={username}
            isActive={user.username === username}
            onPress={handlePressItem}
          />
        );
      })}
      <Button title="+ Add Account" onPress={handlePressAddAccount} />
      <ListItemSettingsLockWallet />
    </Stack>
  );
}

export function GlobalDrawerContent(props) {
  const insets = useSafeAreaInsets();
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "space-between",
        marginBottom: insets.bottom,
      }}
    >
      <Stack>
        <Header />
        <DrawerItemList {...props} />
      </Stack>
      <UserList />
    </DrawerContentScrollView>
  );
}
