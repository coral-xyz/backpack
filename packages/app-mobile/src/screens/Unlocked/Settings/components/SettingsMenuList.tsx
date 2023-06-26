import { forwardRef } from "react";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";

import {
  styled,
  themeable,
  TamaguiElement,
  ListItemFrame,
  ListItemText,
  useListItem,
  ListItemProps,
  YGroup,
  Separator,
  _ListItemOneLine,
} from "@coral-xyz/tamagui";

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
      marginBottom={16}
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

const CustomListItemFrame = styled(ListItemFrame, {
  paddingHorizontal: 12,
  height: "$container",
});

const CustomListItemText = styled(ListItemText, {
  fontFamily: "InterMedium",
  fontSize: 16,
  lineHeight: 24,
});

export const ListItem = themeable(
  forwardRef<TamaguiElement, ListItemProps>((propsIn, ref) => {
    const { props } = useListItem(propsIn);

    return <CustomListItemFrame {...props} ref={ref} />;
  })
);
