import type { SizableTextProps, TextProps } from "tamagui";

import React from "react";
import type { StyleProp, TextStyle } from "react-native";

import { Text } from "tamagui";

export type StyledTextProps = TextProps & {
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
}: TextProps) {
  return (
    <Text
      color={color ?? "$baseTextHighEmphasis"}
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
