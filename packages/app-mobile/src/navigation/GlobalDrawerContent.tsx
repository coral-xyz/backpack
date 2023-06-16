import { Alert, Pressable } from "react-native";

import {
  UI_RPC_METHOD_ACTIVE_USER_UPDATE,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
} from "@coral-xyz/common";
import { useAllUsers, useBackgroundClient, useUser } from "@coral-xyz/recoil";
import {
  Separator,
  Stack,
  StyledText,
  XStack,
  useTheme as useTamaguiTheme,
} from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { UserAccountListItem } from "~components/UserAccountsMenu";
import { CurrentUserAvatar } from "~components/UserAvatar";

function Header() {
  const user = useUser();

  return (
    <XStack ai="center" jc="space-between" px={16} mb={8}>
      <XStack ai="center">
        <CurrentUserAvatar size={36} />
        <StyledText ml={8}>@{user.username}</StyledText>
      </XStack>
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
    Alert.alert("TODO");
  };

  const theme = useTamaguiTheme();

  return (
    <Stack jc="flex-start">
      <StyledText ml={12} mb={8} size="$xs" color="$baseTextMedEmphasis">
        ACCOUNTS ({users.length})
      </StyledText>
      {users.map(({ username, uuid }: any) => {
        return (
          <UserAccountListItem
            key={uuid}
            uuid={uuid}
            username={username}
            isActive={user.username === username}
            onPress={handlePressItem}
          />
        );
      })}
      <Pressable onPress={handlePressAddAccount}>
        <XStack ai="center" ml={16}>
          <MaterialIcons
            name="add"
            size={24}
            color={theme.baseTextMedEmphasis.val}
          />
          <StyledText ml={16} color="$baseTextMedEmphasis">
            Add Account
          </StyledText>
        </XStack>
      </Pressable>
      <Separator my={16} />
      <Pressable
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
      >
        <XStack ai="center" ml={16}>
          <MaterialIcons
            name="lock"
            size={24}
            color={theme.baseTextMedEmphasis.val}
          />
          <StyledText ml={16} color="$baseTextMedEmphasis">
            Lock Wallet
          </StyledText>
        </XStack>
      </Pressable>
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
