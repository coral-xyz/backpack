import { Alert, FlatList, Pressable, StyleSheet } from "react-native";

import * as Linking from "expo-linking";

import {
  BACKPACK_LINK,
  DISCORD_INVITE_LINK,
  TWITTER_LINK,
} from "@coral-xyz/common";
import { MaterialIcons } from "@expo/vector-icons";

import { BetterBottomSheet } from "~components/BottomSheetModal";
import { DiscordIcon, TwitterIcon } from "~components/Icon";
import { RoundedContainerGroup } from "~components/index";
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
  showResetButton,
}: {
  isVisible: boolean;
  resetVisibility: () => void;
  showResetButton?: boolean;
}): JSX.Element {
  const theme = useTheme();
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
    menuOptions.push({
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
              onPress: () => reset(),
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

  return (
    <BetterBottomSheet isVisible={isVisible} resetVisibility={resetVisibility}>
      <Content menuOptions={menuOptions} />
    </BetterBottomSheet>
  );
}

function Content({ menuOptions }: { menuOptions: any[] }): JSX.Element {
  return (
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
  );
}
