import type { ImageStyle, StyleProp, TextStyle, ViewStyle } from "react-native";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SvgUri } from "react-native-svg";
import type { Blockchain } from "@coral-xyz/common";
import { proxyImageUrl, walletAddressDisplay } from "@coral-xyz/common";
import { useAvatarUrl } from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@hooks";
import * as Clipboard from "expo-clipboard";

export { ActionCard } from "./ActionCard";
export { BaseCheckBoxLabel, CheckBox } from "./CheckBox";
export { MnemonicInputFields } from "./MnemonicInputFields";
export { NavHeader } from "./NavHeader";
export { NFTCard } from "./NFTCard";
export { PasswordInput } from "./PasswordInput";
export { default as ResetAppButton } from "./ResetAppButton";
export { StyledTextInput } from "./StyledTextInput";
export { TokenAmountHeader } from "./TokenAmountHeader";
export { StyledTokenTextInput } from "./TokenInputField";
import { ContentCopyIcon, RedBackpack } from "@components/Icon";
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
        {
          flex: 1,
          backgroundColor: theme.custom.colors.background,
          paddingHorizontal: 16,
          paddingVertical: 16,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

export function BaseButton({
  label,
  buttonStyle,
  labelStyle,
  onPress,
  disabled,
  loading,
  icon,
  ...props
}: {
  label: string;
  buttonStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: JSX.Element;
}) {
  const theme = useTheme();
  return (
    <Pressable
      style={[
        {
          backgroundColor: theme.custom.colors.primaryButton,
          height: 48,
          paddingHorizontal: 12,
          borderRadius: 12,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
          width: "100%",
          opacity: disabled ? 50 : 100, // TODO(peter)
        },
        buttonStyle,
      ]}
      disabled={disabled}
      onPress={onPress}
      {...props}>
      <Text
        style={[
          {
            fontWeight: "500",
            fontSize: 16,
            lineHeight: 24,
            color: theme.custom.colors.primaryButtonTextColor,
            opacity: disabled ? 50 : 100, // TODO(peter)
          },
          labelStyle,
        ]}>
        {loading ? "loading..." : label} {disabled ? "(disabled)" : ""}
      </Text>
      {icon}
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  ...props
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
  loading?: boolean;
}) {
  const theme = useTheme();
  return (
    <BaseButton
      label={label}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      buttonStyle={{ backgroundColor: theme.custom.colors.primaryButton }}
      labelStyle={{
        color: theme.custom.colors.primaryButtonTextColor,
      }}
      {...props}
    />
  );
}

export function SecondaryButton({
  label,
  onPress,
  disabled,
  loading,
  icon,
  ...props
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: JSX.Element;
}) {
  const theme = useTheme();
  return (
    <BaseButton
      label={label}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      buttonStyle={{ backgroundColor: theme.custom.colors.secondaryButton }}
      labelStyle={{
        color: theme.custom.colors.secondaryButtonTextColor,
      }}
      icon={icon}
      {...props}
    />
  );
}

export function NegativeButton({
  label,
  onPress,
  disabled,
  loading,
  ...props
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
  loading?: boolean;
}) {
  const theme = useTheme();
  return (
    <BaseButton
      label={label}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      buttonStyle={{ backgroundColor: theme.custom.colors.negative }}
      labelStyle={{
        color: theme.custom.colors.negativeButtonTextColor,
      }}
      {...props}
    />
  );
}

export function DangerButton({
  label,
  onPress,
  disabled,
  loading,
  ...props
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
  loading?: boolean;
}) {
  const theme = useTheme();
  return (
    <BaseButton
      label={label}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      buttonStyle={{ backgroundColor: theme.custom.colors.negative }}
      labelStyle={{
        color: theme.custom.colors.fontColor,
      }}
      {...props}
    />
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
      }}>
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
      ]}>
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
    <View style={{ alignItems: "center" }}>
      {icon({
        size: 56,
        style: {
          color: theme.custom.colors.secondary,
          marginBottom: 16,
        },
      })}
      <Typography
        style={{
          fontSize: 24,
          lineHeight: 32,
          textAlign: "center",
          fontWeight: "500",
          color: theme.custom.colors.fontColor,
        }}>
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
          }}>
          {subtitle}
        </Typography>
      )}
      {minimize !== true && buttonText && (
        <Margin top={12}>
          <PrimaryButton label={buttonText} onPress={() => onPress()} />
        </Margin>
      )}
    </View>
  );
}

// React Native apps need to specifcy a width and height for remote images
export function ProxyImage({
  src,
  style,
  ...props
}: {
  src: string;
  style: StyleProp<ImageStyle>;
}): JSX.Element {
  const uri = proxyImageUrl(src);
  return (
    <Image
      style={style}
      source={{ uri }}
      // onError={({ currentTarget }) => {
      //   currentTarget.onerror = props.onError || null;
      //   currentTarget.src = props.src;
      // }}
      {...props}
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
}): JSX.Element {
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

export function WalletAddressLabel({
  publicKey,
  name,
  style,
  nameStyle,
}: {
  publicKey: string;
  name: string;
  style: StyleProp<ViewStyle>;
  nameStyle: StyleProp<TextStyle>;
}): JSX.Element {
  const theme = useTheme();
  return (
    <View style={[{ flexDirection: "row", alignItems: "center" }, style]}>
      <Margin right={8}>
        <Text style={[{ color: theme.custom.colors.fontColor }, nameStyle]}>
          {name}
        </Text>
      </Margin>
      <Text style={{ color: theme.custom.colors.secondary }}>
        ({walletAddressDisplay(publicKey)})
      </Text>
    </View>
  );
}

export function Avatar({ size = 64 }: { size?: number }): JSX.Element {
  const avatarUrl = useAvatarUrl(size);
  const theme = useTheme();

  const outerSize = size + 6;

  return (
    <View
      style={{
        backgroundColor: theme.custom.colors.avatarIconBackground,
        borderRadius: outerSize / 2,
        padding: 3,
        width: outerSize,
        height: outerSize,
      }}>
      <SvgUri width={size} height={size} uri={avatarUrl} />
    </View>
  );
}

export function Debug({ data }: any): JSX.Element {
  const theme = useTheme();
  return (
    <View>
      <Text
        style={{
          color: theme.custom.colors.fontColor,
          fontFamily: "monospace",
        }}>
        {JSON.stringify(data, null, 2)}
      </Text>
    </View>
  );
}

function generateRandomHexColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

export function DummyScreen({ route }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: generateRandomHexColor(),
        alignItems: "center",
        justifyContent: "center",
      }}>
      <Text>Dummy Screen</Text>
      <Debug data={{ route: route.params }} />
    </View>
  );
}

export function FullScreenLoading() {
  const theme = useTheme();
  return (
    <View
      style={{
        backgroundColor: theme.custom.colors.background,
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}>
      <ActivityIndicator size="large" color={theme.custom.colors.fontColor} />
    </View>
  );
}

export function WelcomeLogoHeader() {
  const theme = useTheme();
  return (
    <View style={{ alignItems: "center" }}>
      <Margin top={48} bottom={24}>
        <RedBackpack />
      </Margin>
      <Text
        style={{
          fontWeight: "600",
          fontSize: 42,
          textAlign: "center",
          color: theme.custom.colors.fontColor,
        }}>
        Backpack
      </Text>
      <Margin top={8}>
        <Text
          style={{
            lineHeight: 24,
            fontSize: 16,
            fontWeight: "500",
            color: theme.custom.colors.secondary,
          }}>
          A home for your xNFTs
        </Text>
      </Margin>
    </View>
  );
}

export function ListRowSeparator() {
  return <View style={listRowStyles.container} />;
}

const listRowStyles = StyleSheet.create({
  container: {
    height: 12,
  },
});

export function CopyWalletFieldInput({
  publicKey,
}: {
  publicKey: string;
}): JSX.Element {
  const theme = useTheme();
  const walletDisplay = walletAddressDisplay(publicKey, 12);

  return (
    <View
      style={[
        { flexDirection: "row", alignItems: "center" },
        {
          width: "100%",
          borderColor: theme.custom.colors.textBackground,
          backgroundColor: theme.custom.colors.textBackground,
          borderRadius: 12,
          padding: 8,
          borderWidth: 2,
        },
      ]}>
      <Margin right={12}>
        <Text
          style={{ fontWeight: "500", color: theme.custom.colors.fontColor }}>
          {walletDisplay}
        </Text>
      </Margin>
      <Pressable
        onPress={async () => {
          await Clipboard.setStringAsync(publicKey);
          Alert.alert("Copied to clipboard", publicKey);
        }}>
        <ContentCopyIcon />
      </Pressable>
    </View>
  );
}

export function Loading(props: any): JSX.Element {
  return <ActivityIndicator {...props} />;
}

export function CopyButton({ text }: { text: string }): JSX.Element {
  return (
    <SecondaryButton
      label="Copy"
      onPress={async () => {
        await Clipboard.setStringAsync(text);
        Alert.alert("Copied to clipboard");
      }}
      icon={<ContentCopyIcon size={18} />}
    />
  );
}

export function ImportTypeBadge({
  type,
}: {
  type: string;
}): JSX.Element | null {
  const theme = useTheme();
  if (type === "derived") {
    return null;
  }

  return (
    <View
      style={[
        {
          backgroundColor: theme.custom.colors.bg2,
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 2,
        },
      ]}>
      <Text
        style={{
          color: theme.custom.colors.fontColor,
          fontSize: 12,
          fontWeight: "600",
        }}>
        {type === "imported" ? "IMPORTED" : "HARDWARE"}
      </Text>
    </View>
  );
}

export function AddConnectWalletButton({
  blockchain,
  onPress,
}: {
  blockchain: Blockchain;
  onPress: (blockchain: Blockchain) => void;
}): JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      onPress={() => {
        onPress(blockchain);
      }}
      style={{
        flexDirection: "row",
        alignItems: "center",
      }}>
      <Margin right={8}>
        <MaterialIcons
          name="add-circle"
          size={24}
          color={theme.custom.colors.secondary}
        />
      </Margin>
      <Text
        style={{
          color: theme.custom.colors.secondary,
        }}>
        Add / Connect Wallet
      </Text>
    </Pressable>
  );
}

export function TwoButtonFooter({
  leftButton,
  rightButton,
}: {
  leftButton: JSX.Element;
  rightButton: JSX.Element;
}): JSX.Element {
  return (
    <View style={twoButtonFooterStyles.container}>
      <View style={{ flex: 1, marginRight: 8 }}>{leftButton}</View>
      <View style={{ flex: 1, marginLeft: 8 }}>{rightButton}</View>
    </View>
  );
}

const twoButtonFooterStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export function HeaderIconSubtitle({
  icon,
  title,
  subtitle,
}: {
  icon: JSX.Element;
  title: string;
  subtitle?: string;
}): JSX.Element {
  return (
    <View style={headerIconSubtitleStyles.container}>
      <Margin bottom={16}>{icon}</Margin>
      <Header text={title} />
      {subtitle ? <SubtextParagraph>{subtitle}</SubtextParagraph> : null}
    </View>
  );
}

const headerIconSubtitleStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 24,
  },
});

export function RoundedContainerGroup({
  children,
  style,
  disableTopRadius = false,
  disableBottomRadius = false,
}: {
  children: JSX.Element;
  style: StyleProp<ViewStyle>;
  disableTopRadius?: boolean;
  disableBottomRadius?: boolean;
}): JSX.Element {
  const theme = useTheme();
  return (
    <View
      style={[
        roundedContainerStyles.container,
        {
          borderColor: theme.custom.colors.borderFull,
        },
        disableTopRadius ? roundedContainerStyles.disableTopRadius : null,
        disableBottomRadius ? roundedContainerStyles.disableBottomRadius : null,
        style,
      ]}>
      {children}
    </View>
  );
}

const roundedContainerStyles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderRadius: 12,
  },
  disableTopRadius: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  disableBottomRadius: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
});

export function Row({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}): JSX.Element {
  return <View style={rowStyles.container}>{children}</View>;
}

const rowStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
});
