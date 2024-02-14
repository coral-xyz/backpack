import { ViewStyleWithPseudos } from "@tamagui/core";
import { ArrowUpRight } from "@tamagui/lucide-icons";
import type { ReactNode } from "react";
import React from "react";
import { Platform } from "react-native";
import { ListItem, Separator, XStack, YGroup } from "tamagui";

import { StyledText } from "../StyledText";

export type TableCoreProps = {
  children: ReactNode;
  style?: ViewStyleWithPseudos;
};

export function TableCore({ children, style }: TableCoreProps) {
  return (
    // @ts-expect-error
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
  valueColor?: React.ComponentProps<typeof StyledText>["color"];
  labelProps?: React.ComponentProps<typeof StyledText>;
};

const isStringOrNumber = (input: any) =>
  ["string", "number"].includes(typeof input);

export function TableRowCore({
  label,
  onPress,
  value,
  valueColor,
  labelProps = {
    color: "$baseTextMedEmphasis",
    fontSize: "$sm",
  },
}: TableRowCoreProps) {
  const l = isStringOrNumber(label) ? (
    <StyledText {...labelProps}>{label}</StyledText>
  ) : (
    label
  );

  const v = isStringOrNumber(value) ? (
    <StyledText
      color={
        valueColor
          ? valueColor
          : onPress
            ? "$accentBlue"
            : "$baseTextHighEmphasis"
      }
      fontSize="$sm"
    >
      {value}
    </StyledText>
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

export const TableRowCoreLinkValue = ({ content }: { content: string }) => (
  <XStack ai="center" gap={4}>
    <StyledText color="$accentBlue" fontSize="$sm">
      {content}
    </StyledText>
    <ArrowUpRight color="$accentBlue" size="$sm" />
  </XStack>
);
