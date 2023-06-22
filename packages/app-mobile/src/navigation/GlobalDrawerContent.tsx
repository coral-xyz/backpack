import { useState } from "react";
import { Alert, Pressable } from "react-native";

import Constants from "expo-constants";

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
  YStack,
} from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import { DrawerItemList } from "@react-navigation/drawer";
import { FlatList } from "react-native-gesture-handler";

import { UserAccountListItem } from "~components/ListItem";
import { CurrentUserAvatar } from "~components/UserAvatar";

import RNDrawerContentView from "./RNDrawerContentView";

import { useSession } from "~src/lib/SessionProvider";

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
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { setAppState } = useSession();

  const handleUpdateActiveUser = async (uuid: string) => {
    if (uuid === user.uuid) {
      return;
    }

    try {
      setLoadingId(uuid);
      await background.request({
        method: UI_RPC_METHOD_ACTIVE_USER_UPDATE,
        params: [uuid],
      });
    } catch (error) {
      console.error("Error updating active user", error);
    } finally {
      setLoadingId(null);
    }
  };

  const handlePressAddAccount = () => {
    setAppState("isAddingAccount");
  };

  const theme = useTamaguiTheme();
  const activeUser = users.find((u) => u.uuid === user.uuid);

  return (
    <Stack jc="flex-start">
      <StyledText ml={12} mb={8} size="$xs" color="$baseTextMedEmphasis">
        ACCOUNTS ({users.length})
      </StyledText>
      <FlatList
        data={[activeUser, ...users.filter((u) => u.uuid !== user.uuid)]}
        style={{ marginBottom: 8, maxHeight: 260 }}
        keyExtractor={(item) => item.uuid}
        showsVerticalScrollIndicator={false}
        scrollEnabled={users.length >= 4}
        renderItem={({ item: { username, uuid } }) => {
          return (
            <UserAccountListItem
              key={uuid}
              uuid={uuid}
              username={username}
              isActive={user.username === username}
              isLoading={loadingId === uuid}
              onPress={handleUpdateActiveUser}
            />
          );
        }}
      />
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
  // SafeAreaView doesn't load immediately which causes screen thrashing
  // it will go from 0 to 34 on an iphone x, but only in this global drawer context -_-
  const marginBottom = Constants.statusBarHeight >= 53 ? 50 : 16;
  return (
    <RNDrawerContentView
      {...props}
      style={{
        flexGrow: 1,
        justifyContent: "space-between",
        marginBottom,
      }}
    >
      <YStack>
        <Header />
        <DrawerItemList {...props} />
      </YStack>
      <UserList />
    </RNDrawerContentView>
  );
}
