import type { ReactNode } from "react";
import type { GestureResponderEvent } from "react-native";

import { ListItem, type ListItemProps } from "tamagui";

export type ListItemCoreProps = {
  children: ReactNode;
  icon?: ListItemProps["icon"];
  onClick?: (event: GestureResponderEvent) => void;
  style?: Omit<ListItemProps, "children">;
};

export function ListItemCore({
  children,
  icon,
  onClick,
  style,
}: ListItemCoreProps) {
  return (
    <ListItem
      backgroundColor="$baseBackgroundL1"
      icon={icon}
      onPress={onClick}
      paddingHorizontal={12}
      paddingVertical={10}
      pointerEvents="box-only"
      {...style}
    >
      {children}
    </ListItem>
  );
}
