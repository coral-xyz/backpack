import type { ReactNode } from "react";
import { Platform, ViewStyle } from "react-native";

import { ListItem, Separator, YGroup } from "tamagui";

import { StyledText } from "../StyledText";

export type TableCoreProps = {
  children: ReactNode;
  style?: ViewStyle;
};

export function TableCore({ children, style }: TableCoreProps) {
  return (
    <YGroup
      backgroundColor="$baseBackgroundL1"
      borderWidth={2}
      borderColor="$baseBorderLight"
      borderRadius="$container"
      separator={<Separator borderColor="$baseDivider" />}
      {...style}
    >
      {children}
    </YGroup>
  );
}

export type TableRowCoreProps = {
  label: ReactNode;
  onPress?: () => void;
  value: ReactNode;
};

export function TableRowCore({ label, onPress, value }: TableRowCoreProps) {
  const l =
    typeof label === "string" ? (
      <StyledText color="$baseTextMedEmphasis" fontSize="$sm">
        {label}
      </StyledText>
    ) : (
      label
    );

  const v =
    typeof value === "string" ? (
      <StyledText fontSize="$sm">{value}</StyledText>
    ) : (
      value
    );

  return (
    <YGroup.Item>
      <ListItem
        backgroundColor="$baseBackgroundL1"
        cursor={onPress ? "pointer" : undefined}
        hoverTheme={onPress !== undefined}
        pressTheme={onPress !== undefined}
        justifyContent="space-between"
        padding={Platform.select({ web: 12, native: 16 })}
        pointerEvents="box-only"
        onPress={onPress}
      >
        {l}
        {v}
      </ListItem>
    </YGroup.Item>
  );
}
