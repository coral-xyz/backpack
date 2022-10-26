import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";

// probably should put all the components in here as an index

import useTheme from "../hooks/useTheme";
//
// function getRandomColor() {
//   var letters = "0123456789ABCDEF";
//   var color = "#";
//   for (var i = 0; i < 6; i++) {
//     color += letters[Math.floor(Math.random() * 16)];
//   }
//   return color;
// }

export default function Screen({
  children,
  style,
}: {
  children: JSX.Element | JSX.Element[];
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  return (
    <View
      style={[{ flex: 1, backgroundColor: theme.colors.background }, style]}
    >
      {children}
    </View>
  );
}
