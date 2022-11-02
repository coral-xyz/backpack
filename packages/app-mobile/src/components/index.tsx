import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import { Pressable, Text, View } from "react-native";

// probably should put all the components in here as an index
import { useTheme } from "../hooks/useTheme";

export { MnemonicInputFields } from "./MnemonicInputFields";
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
  const color = theme.custom.colors.fontColor;
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
      style={[
        { flex: 1, backgroundColor: theme.custom.colors.background },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function PrimaryButton({
  label,
  style,
  onPress,
  disabled,
  loading,
  ...props
}: {
  label: string;
  style?: StyleProp<ViewStyle>;
  onPress: () => void;
  disabled: boolean;
  loading?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      style={{
        backgroundColor: theme.custom.colors.primaryButton,
        height: 48,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        opacity: disabled ? 80 : 100, // TODO(peter)
      }}
      disabled={disabled}
      onPress={onPress}
      {...props}
    >
      <Text
        style={{
          fontWeight: "500",
          fontSize: 16,
          lineHeight: 24,
          color: theme.custom.colors.primaryButtonTextColor,
        }}
      >
        {loading ? "loading.." : label} {disabled ? "(disabled)" : ""}
      </Text>
    </Pressable>
  );
}

export function Header({ text }: { text: string }) {
  const theme = useTheme();
  return (
    <Text
      style={{
        color: theme.custom.colors.fontColor,
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
  onPress,
}: {
  children: JSX.Element;
  style?: StyleProp<TextStyle>;
  onPress?: () => void;
}) {
  const theme = useTheme();
  return (
    <Text
      onPress={onPress}
      style={[
        {
          fontWeight: "500",
          marginTop: 8,
          color: theme.custom.colors.subtext,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Box({
  children,
  style,
}: {
  children?: JSX.Element[] | JSX.Element;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[{ backgroundColor: "#eee" }, style]}>{children}</View>;
}

export function Typography({
  children,
  style,
  ...props
}: {
  children: string;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text style={style} {...props}>
      {children}
    </Text>
  );
}

export function EmptyState({
  icon,
  title,
  subtitle,
  buttonText,
  onPress,
  minimize,
  verticallyCentered,
}: {
  icon: (props: any) => React.ReactNode;
  title: string;
  subtitle: string;
  buttonText?: string;
  onPress?: () => void | undefined;
  // style?: React.CSSProperties;
  minimize?: boolean;
  verticallyCentered?: boolean;
}) {
  const theme = useTheme();
  return (
    <View>
      <Typography
        style={{
          fontSize: 24,
          lineHeight: 32,
          textAlign: "center",
          fontWeight: "500",
          color: theme.custom.colors.fontColor,
        }}
      >
        {title}
      </Typography>
      {minimize !== true && (
        <Typography
          style={{
            marginTop: 8,
            color: theme.custom.colors.secondary,
            textAlign: "center",
            fontSize: 16,
            lineHeight: 24,
            fontWeight: "500",
          }}
        >
          {subtitle}
        </Typography>
      )}
      <PrimaryButton label={buttonText} onPress={onPress} />
    </View>
  );
}
