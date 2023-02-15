import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { FlatList, Pressable, StyleSheet } from "react-native";

import * as Linking from "expo-linking";

import { Margin, RoundedContainerGroup } from "~components/index";
import {
  BACKPACK_LINK,
  DISCORD_INVITE_LINK,
  TWITTER_LINK,
} from "@coral-xyz/common";
import { MaterialIcons } from "@expo/vector-icons";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import {
  IconLaunchDetail,
  SettingsRow,
} from "~screens/Unlocked/Settings/components/SettingsRow";

import { DiscordIcon, TwitterIcon } from "~components/Icon";
import { useTheme } from "~hooks/useTheme";

export function HelpModalMenuButton({
  onPress,
}: {
  onPress: () => void;
}): JSX.Element {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <MaterialIcons
        name="menu"
        size={32}
        color={theme.custom.colors.fontColor}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 16,
    right: 32,
    zIndex: 999,
  },
});

export function BottomSheetHelpModal({
  isVisible,
  resetVisibility,
  extraOptions = [],
}: {
  isVisible: boolean;
  resetVisibility: () => void;
  extraOptions?: any[];
}): JSX.Element {
  const theme = useTheme();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    function handle() {
      if (isVisible) {
        bottomSheetModalRef.current?.present();
        // Resets visibility since dismissing it is built-in
        resetVisibility();
      }
    }

    handle();
  }, [isVisible, resetVisibility]);

  const modalHeight = extraOptions.length
    ? 240 + extraOptions.length * 48
    : 240;
  const snapPoints = useMemo(() => [modalHeight], [modalHeight]);
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

  const menuOptions = [
    ...extraOptions,
    {
      icon: (
        <MaterialIcons
          color={theme.custom.colors.secondary}
          size={24}
          name="lock"
        />
      ),
      label: "Backpack.app",
      onPress: () => Linking.openURL(BACKPACK_LINK),
      detailIcon: <IconLaunchDetail />,
    },
    {
      icon: <TwitterIcon color={theme.custom.colors.secondary} />,
      label: "Twitter",
      onPress: () => Linking.openURL(TWITTER_LINK),
      detailIcon: <IconLaunchDetail />,
    },
    {
      icon: <DiscordIcon color={theme.custom.colors.secondary} />,
      label: "Need help? Hop into Discord",
      onPress: () => Linking.openURL(DISCORD_INVITE_LINK),
      detailIcon: <IconLaunchDetail />,
    },
  ];

  return (
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
        backgroundColor: theme.custom.colors.background,
      }}
    >
      <Margin horizontal={16}>
        <RoundedContainerGroup>
          <FlatList
            data={menuOptions}
            scrollEnabled={false}
            renderItem={({ item }) => {
              return (
                <SettingsRow
                  onPress={item.onPress}
                  icon={item.icon}
                  detailIcon={item.detailIcon}
                  label={item.label}
                />
              );
            }}
          />
        </RoundedContainerGroup>
      </Margin>
    </BottomSheetModal>
  );
}
