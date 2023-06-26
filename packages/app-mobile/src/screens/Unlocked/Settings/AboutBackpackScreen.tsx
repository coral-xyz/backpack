import { Linking, View } from "react-native";

import {
  BACKPACK_CONFIG_VERSION,
  BACKPACK_GITHUB_LINK,
  BACKPACK_LINK,
  BACKPACK_TERMS_OF_SERVICE,
  DISCORD_INVITE_LINK,
  TWITTER_LINK,
} from "@coral-xyz/common";
import {
  Separator,
  XStack,
  YGroup,
  YStack,
  _ListItemOneLine,
} from "@coral-xyz/tamagui";

import { Screen, WelcomeLogoHeader } from "~components/index";

import { IconLaunchDetail } from "./components/SettingsRow";

import {
  DiscordIcon,
  GitHubIcon,
  OpenInBrowserIcon,
  TwitterIcon,
} from "~src/components/Icon";
import { useTheme } from "~src/hooks";

const groupedMenuItems = [
  [
    {
      label: "Discord",
      url: DISCORD_INVITE_LINK,
      icon: DiscordIcon,
    },
    {
      label: "Twitter",
      url: TWITTER_LINK,
      icon: TwitterIcon,
    },
    {
      label: "GitHub",
      url: BACKPACK_GITHUB_LINK,
      icon: GitHubIcon,
    },
    {
      label: "Website",
      url: BACKPACK_LINK,
      icon: OpenInBrowserIcon,
    },
  ],
  [
    {
      label: "Terms of Service",
      url: BACKPACK_TERMS_OF_SERVICE,
      icon: null,
    },
  ],
];

export function AboutBackpackScreen(): JSX.Element {
  const theme = useTheme();
  return (
    <Screen>
      <View style={{ marginBottom: 32 }}>
        <WelcomeLogoHeader subtitle={BACKPACK_CONFIG_VERSION} />
      </View>

      <YStack space="$settingsList">
        {groupedMenuItems.map((group, index) => (
          <YGroup
            overflow="hidden"
            borderWidth={2}
            borderColor="$borderFull"
            borderRadius="$container"
            separator={<Separator />}
            key={JSON.stringify(index)}
          >
            {group.map((item) => (
              <YGroup.Item key={item.label}>
                <_ListItemOneLine
                  title={item.label}
                  icon={
                    item.icon ? (
                      <YStack mt={4} ai="center">
                        <item.icon color={theme.custom.colors.secondary} />
                      </YStack>
                    ) : null
                  }
                  iconAfter={<IconLaunchDetail size={18} />}
                  onPress={() => {
                    Linking.openURL(item.url);
                  }}
                />
              </YGroup.Item>
            ))}
          </YGroup>
        ))}
      </YStack>
    </Screen>
  );
}
