import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";

import { useCustomTheme as useTheme } from "../hooks";

export function RoundedContainerGroup({
  children,
  style,
  borderRadius,
  disableTopRadius = false,
  disableBottomRadius = false,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
  disableTopRadius?: boolean;
  disableBottomRadius?: boolean;
}): JSX.Element {
  const theme = useTheme();
  const calculatedBorderRadius = borderRadius !== undefined ? borderRadius : 12;
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.custom.colors.nav,
          borderColor: theme.custom.colors.borderFull,
          borderRadius: calculatedBorderRadius,
        },
        disableTopRadius ? styles.disableTopRadius : undefined,
        disableBottomRadius ? styles.disableBottomRadius : undefined,
        style,
      ]}
    >
      <View style={{ overflow: "hidden" }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderBottomWidth: 2,
  },
  disableTopRadius: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopWidth: 0,
  },
  disableBottomRadius: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
});
