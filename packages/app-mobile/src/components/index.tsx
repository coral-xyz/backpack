import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import { Pressable, Text, View } from "react-native";

// probably should put all the components in here as an index
import { useTheme } from "../hooks/useTheme";
//
// function getRandomColor() {
//   var letters = "0123456789ABCDEF";
//   var color = "#";
//   for (var i = 0; i < 6; i++) {
//     color += letters[Math.floor(Math.random() * 16)];
//   }
//   return color;
// }

export function StyledText({
  children,
  style,
  ...props
}: {
  children: string;
  style?: StyleProp<TextStyle>;
}) {
  const theme = useTheme();
  const color = theme.colors.fontColor;
  return (
    <Text style={[{ color }, style]} {...props}>
      {children}
    </Text>
  );
}

export function Screen({
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

export function PrimaryButton({
  buttonLabelStyle,
  label,
  style,
  onPress,
  ...props
}: any) {
  // TODO any
  const theme = useTheme();
  return (
    <Pressable
      style={{
        backgroundColor: theme.colors.primaryButton,
      }}
      onPress={onPress}
      {...props}
    >
      <Text
        style={{
          fontWeight: "500",
          fontSize: 16,
          lineHeight: 24,
          color: theme.colors.primaryButtonTextColor,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Header({ text }: { text: string }) {
  const theme = useTheme();
  return (
    <Text
      style={{
        color: theme.colors.fontColor,
        fontSize: 24,
        fontWeight: "500",
        lineHeight: 32,
      }}
    >
      {text}
    </Text>
  );
}

export function SubtextParagraph({
  children,
  style,
}: {
  children: JSX.Element;
  style?: StyleProp<TextStyle>;
}) {
  const theme = useTheme();
  return (
    <Text
      style={[
        {
          fontWeight: "500",
          marginTop: 8,
          color: theme.colors.subtext,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
