import React from "react";
import type { StyleProp, TextProps, TextStyle } from "react-native";
import type { SizableTextProps } from "tamagui";
import { Text } from "tamagui";

import { useCustomTheme } from "../hooks/index";

export type StyledTextProps = TextProps &
  SizableTextProps & {
    fontSize?: number | string;
    fontWeight?: string;
    children: React.ReactNode;
    textAlign?: SizableTextProps["textAlign"];
    color?: string;
    style?: StyleProp<TextStyle>;
  };

export function StyledText({
  fontWeight = "500",
  fontSize = "$base",
  textAlign,
  children,
  color,
  style,
  ...props
}: StyledTextProps) {
  const theme = useCustomTheme();
  const _color = color || theme.custom.colors.fontColor;
  return (
    <Text
      color={_color}
      fontSize={fontSize}
      fontFamily="$body"
      fontWeight={fontWeight}
      textAlign={textAlign}
      style={style}
      {...props}
    >
      {children}
    </Text>
  );
}
