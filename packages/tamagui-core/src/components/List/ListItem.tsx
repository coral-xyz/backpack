import type { ViewStyleWithPseudos } from "@tamagui/core";
import { ListItem, type ListItemProps } from "tamagui";

export type ListItemCoreProps = {
  icon?: ListItemProps["icon"];
  onClick?: () => void;
  title: ListItemProps["title"];
  style?: ViewStyleWithPseudos;
  subtitle?: ListItemProps["subTitle"];
};

export function ListItemCore({
  icon,
  onClick,
  title,
  subtitle,
  style,
}: ListItemCoreProps) {
  return (
    <ListItem
      borderColor="$borderFull"
      borderRadius="$container"
      borderWidth={2}
      display="flex"
      icon={icon}
      onPress={onClick}
      paddingHorizontal={12}
      paddingVertical={10}
      pointerEvents="box-only"
      subTitle={subtitle}
      title={title}
      {...style}
    />
  );
}
