import type { StyleProp, ViewStyle } from "react-native";

import { View } from "..";

export function RoundedContainerGroup({
  children,
  style,
  borderRadius = 12,
  disableTopRadius = false,
  disableBottomRadius = false,
  ...props
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
  disableTopRadius?: boolean;
  disableBottomRadius?: boolean;
} & React.ComponentProps<typeof View>): JSX.Element {
  const topRadius = disableTopRadius ? 0 : borderRadius;
  const bottomRadius = disableBottomRadius ? 0 : borderRadius;

  const topBorderWidth = disableTopRadius ? 0 : 2;
  const bottomBorderWidth = disableBottomRadius ? 0 : 2;

  return (
    <View
      overflow="hidden"
      borderLeftWidth={2}
      borderRightWidth={2}
      borderTopWidth={topBorderWidth}
      borderBottomWidth={bottomBorderWidth}
      borderTopLeftRadius={topRadius}
      borderTopRightRadius={topRadius}
      borderBottomLeftRadius={bottomRadius}
      borderBottomRightRadius={bottomRadius}
      bc="$baseBackgroundL1"
      borderColor="$baseBorderLight"
      style={style}
      width="100%"
      {...props}
    >
      <View overflow="hidden" width="100%">
        {children}
      </View>
    </View>
  );
}
