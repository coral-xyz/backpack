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
} from "@coral-xyz/tamagui";

import { IconPushDetail } from "./SettingsRow";

export function SettingsList({
  style,
  menuItems,
  textStyle,
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
    <YGroup als="center" bordered backgroundColor="$nav">
      {Object.entries(menuItems).map(
        ([key, { onPress, detail, icon, label }]) => (
          <YGroup.Item key={key}>
            <ListItem
              hoverTheme
              pressTheme
              backgroundColor="$nav"
              icon={icon}
              iconAfter={detail ?? IconPushDetail}
              onPress={() => onPress && onPress()}
              style={style}
            >
              <CustomListItemText style={textStyle}>
                {label ?? key}
              </CustomListItemText>
            </ListItem>
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
