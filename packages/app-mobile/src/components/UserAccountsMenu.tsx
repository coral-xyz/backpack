import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  Pressable,
  Text,
  View,
  ActivityIndicator,
} from "react-native";

import { UI_RPC_METHOD_ACTIVE_USER_UPDATE } from "@coral-xyz/common";
import { useAllUsers, useBackgroundClient, useUser } from "@coral-xyz/recoil";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ExpandCollapseIcon, IconCheckmark } from "~components/Icon";
import { Screen, Avatar, RoundedContainerGroup } from "~components/index";
import { useTheme } from "~hooks/useTheme";
import { SettingsRow } from "~screens/Unlocked/Settings/components/SettingsRow";

// NOTE(peter) not used anymore in lieu of using react navigation modal
export function AccountDropdownHeader(): JSX.Element {
  const navigation = useNavigation();
  const theme = useTheme();
  const user = useUser();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => [440], []);

  const handleShowModal = useCallback(() => {
    navigation.navigate("UserAccountMenu");
    // bottomSheetModalRef.current?.present();
  }, [navigation]);

  const handleDismissModal = useCallback(() => {
    navigation.goBack();
    // bottomSheetModalRef.current?.dismiss();
  }, [navigation]);

  const modalHeight = 440;

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior="close"
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  );

  return (
    <>
      <Pressable
        onPress={() => handleShowModal()}
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 17,
            fontWeight: "600",
            color: theme.custom.colors.fontColor,
          }}
        >
          @{user.username}
        </Text>
        <ExpandCollapseIcon
          isExpanded={false}
          color={theme.custom.colors.icon}
        />
      </Pressable>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        contentHeight={modalHeight}
        handleStyle={{
          marginBottom: 12,
        }}
        backgroundStyle={{
          backgroundColor: theme.custom.colors.backgroundBackdrop,
        }}
      >
        <View />
      </BottomSheetModal>
    </>
  );
}

export function UserAccountMenu({ navigation }): JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <Screen
      style={{ justifyContent: "space-between", marginBottom: insets.bottom }}
    >
      <UsersList
        onDismiss={() => {
          navigation.goBack();
        }}
      />
    </Screen>
  );
}

function UsersList({ onDismiss }: { onDismiss: () => void }): JSX.Element {
  const background = useBackgroundClient();
  const users = useAllUsers();
  const _user = useUser();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleUpdateActiveUser = async (uuid: string) => {
    try {
      setLoadingId(uuid);
      await background.request({
        method: UI_RPC_METHOD_ACTIVE_USER_UPDATE,
        params: [uuid],
      });
      onDismiss();
    } catch (error) {
      console.error("Error updating active user", error);
    } finally {
      setLoadingId(null);
    }
  };

  const s = users.find((u) => u.uuid === _user.uuid);

  // NOTE: Do not do this! Wrapping ScrollView in a map is bad for performance.
  // Look for FlatList example until Peter fixes this
  return (
    <ScrollView>
      <RoundedContainerGroup>
        <>
          {s ? (
            <UserAccountListItem
              key={s.username}
              uuid={s.uuid}
              username={s.username}
              isActive={_user.username === s.username}
              isLoading={loadingId === s.uuid}
              onPress={handleUpdateActiveUser}
            />
          ) : null}
          {users.map(({ username, uuid }: any) => {
            if (username === s.username) {
              return null;
            }
            return (
              <UserAccountListItem
                key={username}
                uuid={uuid}
                username={username}
                isActive={_user.username === username}
                isLoading={loadingId === s.uuid}
                onPress={handleUpdateActiveUser}
              />
            );
          })}
        </>
      </RoundedContainerGroup>
    </ScrollView>
  );
}

const getDetailIcon = (isLoading: boolean, isActive: boolean) => {
  if (isLoading) {
    return <ActivityIndicator size="small" />;
  }

  if (isActive) {
    return <IconCheckmark size={24} />;
  }

  return null;
};

export function UserAccountListItem({
  uuid,
  username,
  isActive,
  isLoading,
  onPress,
}: {
  uuid: string;
  username: string;
  isActive: boolean;
  isLoading: boolean;
  onPress: (uuid: string) => void;
}): JSX.Element {
  const detailIcon = getDetailIcon(isLoading, isActive);
  return (
    <SettingsRow
      icon={<Avatar size={24} />}
      label={`@${username}`}
      detailIcon={detailIcon}
      onPress={() => onPress(uuid)}
    />
  );
}
