import type { StyleProp, TextStyle } from "react-native";
import { Text, useColorScheme } from "react-native";

type Props = {
  style?: StyleProp<TextStyle>;
  children: string;
};

export default function StyledText({ style, children, ...props }: Props) {
  // TODO any
  const colorScheme = useColorScheme();
  const color = colorScheme === "dark" ? "#FFF" : "#000";
  return (
    <Text style={[{ color }, style]} {...props}>
      {children}
    </Text>
  );
}
