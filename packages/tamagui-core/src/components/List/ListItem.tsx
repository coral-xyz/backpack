import type { ReactNode } from "react";
import type { ViewStyleWithPseudos } from "@tamagui/core";
import { ListItem, type ListItemProps } from "tamagui";

export type ListItemCoreProps = {
  children: ReactNode;
  icon?: ListItemProps["icon"];
  onClick?: () => void;
  style?: ViewStyleWithPseudos;
};

export function ListItemCore({
  children,
  icon,
  onClick,
  style,
}: ListItemCoreProps) {
  return (
    <ListItem
      display="flex"
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
