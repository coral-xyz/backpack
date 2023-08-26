import { useState } from "react";
import { View, Alert, FlatList, Pressable, StyleSheet } from "react-native";

import * as Linking from "expo-linking";

import {
  BACKPACK_LINK,
  DISCORD_INVITE_LINK,
  TWITTER_LINK,
} from "@coral-xyz/common";
import { MaterialIcons } from "@expo/vector-icons";

import { BetterBottomSheet } from "~components/BottomSheetModal";
import { DiscordIcon, TwitterIcon, IconMenu } from "~components/Icon";
import { FullScreenLoading } from "~components/index";
import { useTheme } from "~hooks/useTheme";
import { useSession } from "~lib/SessionProvider";
import {
  IconPushDetail,
  IconLaunchDetail,
  SettingsRow,
} from "~screens/Unlocked/Settings/components/SettingsRow";

export function HelpModalMenuButton({
  onPress,
}: {
  onPress: () => void;
}): JSX.Element {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <IconMenu size={32} />
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
  showResetButton,
}: {
  isVisible: boolean;
  resetVisibility: () => void;
  showResetButton?: boolean;
}): JSX.Element {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const { reset } = useSession();

  const menuOptions = [
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

  if (showResetButton) {
    menuOptions.unshift({
      icon: (
        <MaterialIcons
          name="people"
          size={24}
          color={theme.custom.colors.secondary}
        />
      ),
      label: "Reset Backpack",
      detailIcon: <IconPushDetail />,
      onPress: async () => {
        Alert.alert(
          "Are your sure?",
          "This will wipe all data that's been stored in the app",
          [
            {
              text: "Yes",
              onPress: () => {
                setLoading(true);
                reset();
              },
            },
            {
              text: "No",
              onPress: () => {},
            },
          ]
        );
      },
    });
  }

  if (loading) {
    return (
      <View
        style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
      >
        <FullScreenLoading label="Resetting Backpack..." />
      </View>
    );
  }

  return (
    <BetterBottomSheet isVisible={isVisible} resetVisibility={resetVisibility}>
      <Content menuOptions={menuOptions} />
    </BetterBottomSheet>
  );
}

type ListItem = any;
function Content({ menuOptions }: { menuOptions: any[] }): JSX.Element {
  const keyExtractor = (item: ListItem) => item.label;
  const renderItem = ({ item }: { item: ListItem }) => {
    return (
      <SettingsRow
        onPress={item.onPress}
        icon={item.icon}
        detailIcon={item.detailIcon}
        label={item.label}
      />
    );
  };

  return (
    <FlatList
      data={menuOptions}
      scrollEnabled={false}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
    />
  );
}
