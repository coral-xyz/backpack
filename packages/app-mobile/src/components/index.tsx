import { proxyImageUrl } from "@coral-xyz/common";
// probably should put all the components in here as an index
import { useTheme } from "@hooks";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import { Image, Pressable, Text, View } from "react-native";

export { MnemonicInputFields } from "./MnemonicInputFields";
//
// function getRandomColor() { var letters = "0123456789ABCDEF";
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

// React Native apps need to specifcy a width and height for remote images
export function ProxyImage({ src, ...props }: any) {
  const url = proxyImageUrl(props.src);
  return (
    <Image
      {...props}
      // onError={({ currentTarget }) => {
      //   currentTarget.onerror = props.onError || null;
      //   currentTarget.src = props.src;
      // }}
      source={url}
    />
  );
}

export function Margin({
  bottom,
  top,
  left,
  right,
  horizontal,
  vertical,
  children,
}: {
  bottom?: number | string;
  top?: number | string;
  left?: number | string;
  right?: number | string;
  horizontal?: number | string;
  vertical?: number | string;
  children: JSX.Element[] | JSX.Element;
}) {
  const style = {};
  if (bottom) {
    // @ts-ignore
    style.marginBottom = bottom;
  }

  if (top) {
    // @ts-ignore
    style.marginTop = top;
  }

  if (left) {
    // @ts-ignore
    style.marginLeft = left;
  }

  if (right) {
    // @ts-ignore
    style.marginRight = right;
  }

  if (horizontal) {
    // @ts-ignore
    style.marginHorizontal = horizontal;
  }

  if (vertical) {
    // @ts-ignore
    style.marginVertical = vertical;
  }

  return <View style={style}>{children}</View>;
}
