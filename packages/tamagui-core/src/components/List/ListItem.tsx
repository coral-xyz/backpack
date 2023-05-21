import type { ViewStyleWithPseudos } from "@tamagui/core";
import { ListItem, type ListItemProps,YGroup } from "tamagui";

import { useCustomTheme } from "../../hooks";

export type ListItemCoreProps = {
  first?: boolean;
  icon?: ListItemProps["icon"];
  last?: boolean;
  title: ListItemProps["title"];
  style?: ViewStyleWithPseudos;
  subtitle?: ListItemProps["subTitle"];
};

export function ListItemCore({
  first,
  icon,
  last,
  title,
  subtitle,
  style,
}: ListItemCoreProps) {
  return (
    <YGroup.Item>
      <ListItem
        display="flex"
        icon={icon}
        paddingHorizontal={12}
        paddingVertical={10}
        subTitle={subtitle}
        title={title}
        {...style}
        {...isFirstLastListItemStyle(10, first, last)}
      />
    </YGroup.Item>
  );
}

function isFirstLastListItemStyle(
  borderRadius: ViewStyleWithPseudos["borderRadius"],
  first?: boolean,
  last?: boolean
) {
  return {
    borderRadius: 0,
    borderTopLeftRadius: first ? borderRadius : undefined,
    borderTopRightRadius: first ? borderRadius : undefined,
    borderBottomLeftRadius: last ? borderRadius : undefined,
    borderBottomRightRadius: last ? borderRadius : undefined,
  };
}
