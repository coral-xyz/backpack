import type { StyleProp, TextStyle, ViewStyle } from "react-native";

import { YGroup, Separator, _ListItemOneLine } from "@coral-xyz/tamagui";

import { IconPushDetail } from "./SettingsRow";

type SettingsListProps = {
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  borderColor?: string;
  children?: React.ReactNode;
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
};

export function SettingsList({ menuItems, children }: SettingsListProps) {
  return (
    <YGroup
      overflow="hidden"
      borderWidth={2}
      borderColor="$borderFull"
      borderRadius="$container"
      separator={<Separator />}
    >
      <YGroup.Item>{children}</YGroup.Item>
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
