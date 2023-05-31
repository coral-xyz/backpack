import { Alert, Button } from "react-native";

import {
  UI_RPC_METHOD_ACTIVE_USER_UPDATE,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
} from "@coral-xyz/common";
import { useAllUsers, useBackgroundClient, useUser } from "@coral-xyz/recoil";
import {
  ListItem,
  StyledText,
  Stack,
  YStack,
  XStack,
} from "@coral-xyz/tamagui";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";

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
    <XStack ai="center" jc="space-between" px={16}>
      <XStack ai="center">
        <CurrentUserAvatar size={32} />
        <StyledText ml={8}>@{user.username}</StyledText>
      </XStack>
      <IconButton
        size={24}
        color="$fontColor"
        name="settings"
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
      <StyledText>Accounts ({users.length})</StyledText>
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
  return (
    <DrawerContentScrollView {...props}>
      <Header />
      <DrawerItemList {...props} />
      <UserList />
    </DrawerContentScrollView>
  );
}
