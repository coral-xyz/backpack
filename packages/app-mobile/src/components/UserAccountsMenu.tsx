import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";

import { useCallback, useMemo, useRef } from "react";
import { ScrollView, Pressable, Text, View } from "react-native";

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

// function AddMoreButton({ onPress }: { onPress: () => void }): JSX.Element {
//   const theme = useTheme();
//   return (
//     <PrimaryButton
//       label="Add another account"
//       onPress={onPress}
//       icon={
//         <MaterialIcons
//           color={theme.custom.colors.primaryButtonTextColor}
//           name="add"
//           size={24}
//         />
//       }
//     />
//   );
// }

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

  const handlePressItem = async (uuid: string) => {
    await background.request({
      method: UI_RPC_METHOD_ACTIVE_USER_UPDATE,
      params: [uuid],
    });

    onDismiss();
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
              onPress={handlePressItem}
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
                onPress={handlePressItem}
              />
            );
          })}
        </>
      </RoundedContainerGroup>
    </ScrollView>
  );
}

function UserAccountListItem({
  uuid,
  username,
  isActive,
  onPress,
}: {
  uuid: string;
  username: string;
  isActive: boolean;
  onPress: (uuid: string) => void;
}): JSX.Element {
  return (
    <SettingsRow
      icon={<Avatar size={24} />}
      label={`@${username}`}
      detailIcon={isActive ? <IconCheckmark size={24} /> : null}
      onPress={() => onPress(uuid)}
    />
  );
}
