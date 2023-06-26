import type { StyleProp, TextStyle, ViewStyle } from "react-native";

import { YGroup, Separator, _ListItemOneLine } from "@coral-xyz/tamagui";

import { IconPushDetail } from "./SettingsRow";

export function SettingsList({
  menuItems,
}: {
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  borderColor?: string;
  menuItems: {
    [key: string]: {
      onPress: () => void;
      detail?: React.ReactNode;
      style?: StyleProp<ViewStyle>;
      button?: boolean;
      icon?: React.ReactNode;
      label?: string;
    };
  };
}) {
  return (
    <YGroup
      overflow="hidden"
      borderWidth={2}
      borderColor="$borderFull"
      borderRadius="$container"
      separator={<Separator />}
    >
      {Object.entries(menuItems).map(
        ([key, { onPress, detail, icon, label }]) => (
          <YGroup.Item key={key}>
            <_ListItemOneLine
              title={label ?? key}
              icon={icon}
              iconAfter={detail ?? <IconPushDetail />}
              onPress={onPress}
            />
          </YGroup.Item>
        )
      )}
    </YGroup>
  );
}
