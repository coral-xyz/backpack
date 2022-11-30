import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";

export function Screen({
  style,
  children,
}: {
  style?: StyleProp<ViewStyle>;
  children: JSX.Element | JSX.Element[];
}) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 12,
  },
});
