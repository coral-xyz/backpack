import type { ReactNode } from "react";
import type { ViewStyle } from "react-native";
import { ListItem, Separator, YGroup } from "tamagui";

import { StyledText } from "../StyledText";

export type TableCoreProps = {
  children: ReactNode;
  style?: ViewStyle;
};

export function TableCore({ children, style }: TableCoreProps) {
  return (
    <YGroup
      backgroundColor="$nav"
      borderWidth={2}
      borderColor="$borderFull"
      borderRadius="$container"
      separator={<Separator />}
      {...style}
    >
      {children}
    </YGroup>
  );
}

export type TableRowCoreProps = {
  label: ReactNode;
  onClick?: () => void;
  value: ReactNode;
};

export function TableRowCore({ label, onClick, value }: TableRowCoreProps) {
  const l =
    typeof label === "string" ? (
      <StyledText color="$secondary" fontSize="$sm">
        {label}
      </StyledText>
    ) : (
      label
    );

  const v =
    typeof value === "string" ? (
      <StyledText color="$fontColor" fontSize="$sm">
        {value}
      </StyledText>
    ) : (
      value
    );

  return (
    <YGroup.Item>
      <ListItem
        backgroundColor="$nav"
        cursor={onClick ? "pointer" : undefined}
        hoverTheme={onClick !== undefined}
        justifyContent="space-between"
        padding={12}
        pointerEvents="box-only"
        onPress={onClick}
      >
        {l}
        {v}
      </ListItem>
    </YGroup.Item>
  );
}
