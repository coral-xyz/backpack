import type { Blockchain } from "@coral-xyz/common";

import { useState } from "react";
import type { ImageStyle, StyleProp, TextStyle, ViewStyle } from "react-native";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";

import * as Clipboard from "expo-clipboard";
import Constants from "expo-constants";

import { proxyImageUrl, walletAddressDisplay } from "@coral-xyz/common";
import { useAvatarUrl } from "@coral-xyz/recoil";
import {
  Margin,
  BaseButton,
  LinkButton,
  PrimaryButton,
  SecondaryButton,
  NegativeButton,
  DangerButton,
} from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";

import { ContentCopyIcon, RedBackpack } from "~components/Icon";
import { useTheme } from "~hooks/useTheme";

import { ImageSvg } from "./ImageSvg";

export { ActionCard } from "./ActionCard";
export { MnemonicInputFields } from "./MnemonicInputFields";
export { NavHeader } from "./NavHeader";
export { NFTCard } from "./NFTCard";
export { PasswordInput } from "./PasswordInput";
export { StyledTextInput } from "./StyledTextInput";
export { TokenAmountHeader } from "./TokenAmountHeader";
export { StyledTokenTextInput } from "./TokenInputField";
export {
  Margin,
  BaseButton,
  LinkButton,
  PrimaryButton,
  SecondaryButton,
  NegativeButton,
  DangerButton,
};

export function CallToAction({
  icon,
  title,
  onPress,
}: {
  icon: JSX.Element;
  title: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      style={[
        ctaStyles.container,
        {
          borderColor: theme.custom.colors.borderFull,
          backgroundColor: theme.custom.colors.nav,
        },
      ]}
      onPress={onPress}
    >
      <View style={ctaStyles.iconContainer}>{icon}</View>
      <Text style={[ctaStyles.text, { color: theme.custom.colors.fontColor }]}>
        {title}
      </Text>
    </Pressable>
  );
}

const ctaStyles = StyleSheet.create({
  container: {
    padding: 12,
    borderWidth: 2,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
  },
});

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
  scrollable,
  children,
  style,
}: {
  scrollable?: boolean;
  children: JSX.Element | JSX.Element[];
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  if (scrollable) {
    return (
      <ScrollView
        contentContainerStyle={[screenStyles.scrollContainer, style]}
        style={[
          screenStyles.container,
          {
            backgroundColor: theme.custom.colors.background,
          },
        ]}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View
      style={[
        screenStyles.container,
        {
          backgroundColor: theme.custom.colors.background,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const screenStyles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
});

export function Header({
  text,
  style,
}: {
  text: string;
  style?: StyleProp<TextStyle>;
}): JSX.Element {
  const theme = useTheme();
  return (
    <Text
      style={[
        {
          color: theme.custom.colors.fontColor,
          fontSize: 24,
          fontWeight: "500",
          lineHeight: 32,
        },
        style,
      ]}
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
  children: string;
  style?: StyleProp<TextStyle>;
  onPress?: () => void;
}) {
  const theme = useTheme();
  return (
    <Text
      onPress={onPress}
      style={[
        {
          fontSize: 18,
          lineHeight: 24,
          fontWeight: "500",
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
}: // verticallyCentered,
{
  icon: (props: any) => React.ReactNode;
  title: string;
  subtitle: string;
  buttonText?: string;
  onPress?: () => void | undefined;
  minimize?: boolean;
  // verticallyCentered?: boolean;
}) {
  const theme = useTheme();
  return (
    <View>
      {icon({
        size: 56,
        style: {
          color: theme.custom.colors.secondary,
          marginBottom: 16,
          alignSelf: "center",
        },
      })}
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
      {minimize !== true ? (
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
      ) : null}
      {minimize !== true && onPress && buttonText ? (
        <Margin top={12}>
          <PrimaryButton
            disabled={false}
            label={buttonText}
            onPress={() => onPress()}
          />
        </Margin>
      ) : null}
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
      }}
    >
      <ImageSvg width={size} height={size} uri={avatarUrl} />
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
        }}
      >
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
      }}
    >
      <Text>Dummy Screen</Text>
      <Debug data={{ route: route.params }} />
    </View>
  );
}

export function FullScreenLoading({ label }: { label?: string }): JSX.Element {
  const theme = useTheme();
  return (
    <View
      style={{
        backgroundColor: theme.custom.colors.background,
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ActivityIndicator size="large" color={theme.custom.colors.fontColor} />
      {label ? (
        <Text style={{ textAlign: "center", fontSize: 16, marginTop: 16 }}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

export function WelcomeLogoHeader() {
  const theme = useTheme();
  const [showDebug, setShowDebug] = useState(false);
  return (
    <>
      <View style={{ alignItems: "center" }}>
        <Margin top={48} bottom={24}>
          <Pressable onPress={() => setShowDebug((last) => !last)}>
            <RedBackpack />
          </Pressable>
        </Margin>
        <Text
          style={{
            fontWeight: "600",
            fontSize: 42,
            textAlign: "center",
            color: theme.custom.colors.fontColor,
          }}
        >
          Backpack
        </Text>
        <Margin top={8}>
          <Text
            style={{
              lineHeight: 24,
              fontSize: 16,
              fontWeight: "500",
              color: theme.custom.colors.secondary,
            }}
          >
            gm
          </Text>
        </Margin>
      </View>
      {showDebug ? (
        <Text
          style={{
            marginTop: 16,
            marginHorizontal: 16,
            backgroundColor: "white",
          }}
        >
          {JSON.stringify(Constants?.expoConfig?.extra, null, 2)}
        </Text>
      ) : null}
    </>
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

export function Loading(props: any): JSX.Element {
  return <ActivityIndicator {...props} />;
}

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
      ]}
    >
      <Margin right={12}>
        <Text
          style={{ fontWeight: "500", color: theme.custom.colors.fontColor }}
        >
          {walletDisplay}
        </Text>
      </Margin>
      <Pressable
        onPress={async () => {
          await Clipboard.setStringAsync(publicKey);
          Alert.alert("Copied to clipboard", walletDisplay);
        }}
      >
        <ContentCopyIcon />
      </Pressable>
    </View>
  );
}

export function CopyWalletAddressSubtitle({
  publicKey,
}: {
  publicKey: string;
}): JSX.Element {
  const theme = useTheme();
  return (
    <Pressable
      onPress={async () => {
        await Clipboard.setStringAsync(publicKey);
      }}
    >
      <Text style={{ color: theme.custom.colors.secondary }}>
        {walletAddressDisplay(publicKey)}
      </Text>
    </Pressable>
  );
}

export function CopyButton({ text }: { text: string }): JSX.Element {
  return (
    <SecondaryButton
      label="Copy"
      icon={<ContentCopyIcon size={18} />}
      onPress={async () => {
        await Clipboard.setStringAsync(text);
        Alert.alert("Copied to clipboard", text);
      }}
    />
  );
}

export function PasteButton({
  onPaste,
}: {
  onPaste: (text: string) => void;
}): JSX.Element {
  return (
    <SecondaryButton
      label="Paste from clipboard"
      icon={<ContentCopyIcon size={18} />}
      onPress={async () => {
        const string = await Clipboard.getStringAsync();
        onPaste(string);
      }}
    />
  );
}

export function CopyButtonIcon({ text }: { text: string }): JSX.Element {
  return (
    <Pressable
      onPress={async () => {
        await Clipboard.setStringAsync(text);
        Alert.alert("Copied to clipboard", text);
      }}
    >
      <ContentCopyIcon size={18} />
    </Pressable>
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
      ]}
    >
      <Text
        style={{
          color: theme.custom.colors.fontColor,
          fontSize: 12,
          fontWeight: "600",
        }}
      >
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
      }}
    >
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
        }}
      >
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
  style?: StyleProp<ViewStyle>;
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
      ]}
    >
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
