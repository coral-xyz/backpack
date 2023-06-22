import { memo, useState } from "react";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import {
  ActivityIndicator,
  Alert,
  Button,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import * as Clipboard from "expo-clipboard";
import Constants from "expo-constants";
import { Image } from "expo-image";
import * as Updates from "expo-updates";

import { Blockchain, formatWalletAddress } from "@coral-xyz/common";
import { useActiveWallet } from "@coral-xyz/recoil";
import {
  BaseButton,
  DangerButton,
  LinkButton,
  Margin,
  NegativeButton,
  PrimaryButton,
  ProxyImage,
  RoundedContainerGroup,
  SecondaryButton,
  StyledText,
  TwoButtonFooter,
  XStack,
  Stack,
} from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ContentCopyIcon, RedBackpack } from "~components/Icon";
import { UserAvatar, CurrentUserAvatar } from "~components/UserAvatar";
import { getBlockchainLogo } from "~hooks/index";
import { useTheme } from "~hooks/useTheme";

export { ActionCard } from "./ActionCard";
export { MnemonicInputFields } from "./MnemonicInputFields";
export { NFTCard } from "./NFTCard";
export { NavHeader } from "./NavHeader";
export { PasswordInput } from "./PasswordInput";
export { StyledTextInput } from "./StyledTextInput";
export { TokenAmountHeader } from "./TokenAmountHeader";
export { StyledTokenTextInput } from "./TokenInputField";
export { Avatar, CurrentUserAvatar } from "./UserAvatar";
export {
  BaseButton,
  DangerButton,
  LinkButton,
  Margin,
  NegativeButton,
  PrimaryButton,
  ProxyImage,
  RoundedContainerGroup,
  SecondaryButton,
  StyledText,
  TwoButtonFooter,
  UserAvatar,
};

// TODO(fix LinkButton inside tamagui)
export const LinkButton__ = ({
  onPress,
  label,
  color,
}: {
  onPress: () => void;
  label: string;
  color: string; // TODO tamagui color props
}): JSX.Element => (
  <Pressable style={{ padding: 12 }} onPress={onPress}>
    <StyledText alignSelf="center" fontSize="$lg" color={color}>
      {label}
    </StyledText>
  </Pressable>
);

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

export function Screen({
  scrollable,
  children,
  style,
  headerPadding,
  jc,
}: {
  scrollable?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  headerPadding?: boolean;
  jc?: "space-between" | "center";
}) {
  const [show, setShow] = useState(true);
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  // added for perf/dev reasons
  if (!show) {
    return (
      <View
        style={[
          screenStyles.container,
          {
            flex: 1,
            backgroundColor: "white",
            alignItems: "center",
            justifyContent: "center",
          },
          style,
        ]}
      >
        <Button title="Load Screen" onPress={() => setShow(true)} />
      </View>
    );
  }

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
          marginTop: headerPadding ? insets.top : undefined,
          justifyContent: jc,
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
  children: React.ReactNode;
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

export function FullScreenLoading({
  label,
  children,
}: {
  label?: string;
  children?: React.ReactNode;
}): JSX.Element {
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
        <Text
          style={{
            textAlign: "center",
            fontSize: 18,
            marginTop: 16,
            color: theme.custom.colors.fontColor,
          }}
        >
          {label}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

export const ScreenLoading = FullScreenLoading;
export function ScreenError({
  error,
  extra,
}: {
  error: any;
  extra?: string;
}): JSX.Element {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <StyledText fontSize="$lg" color="$negative">
        Something went wrong:
      </StyledText>
      <Text>{error.message}</Text>
      <Text>{extra}</Text>
    </View>
  );
}

export function ScreenErrorFallback({ error, resetErrorBoundary }) {
  return (
    <>
      <ScreenError error={error} />
      <PrimaryButton label="Reset" onPress={resetErrorBoundary} />
    </>
  );
}

export const ScreenEmptyList = ({
  iconName,
  title,
  subtitle,
  buttonText,
  onPress,
}: {
  iconName: string;
  title: string;
  subtitle: string;
  buttonText?: string;
  onPress?: () => void;
}) => {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <EmptyState
        icon={(props: any) => <MaterialIcons name={iconName} {...props} />}
        title={title}
        subtitle={subtitle}
        buttonText={buttonText}
        onPress={onPress}
      />
    </View>
  );
};

export function WelcomeLogoHeader({ subtitle }: { subtitle?: string }) {
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
        {subtitle ? (
          <Margin top={8}>
            <Text
              style={{
                lineHeight: 24,
                fontSize: 16,
                fontWeight: "500",
                color: theme.custom.colors.secondary,
              }}
            >
              {subtitle}
            </Text>
          </Margin>
        ) : null}
      </View>
      {showDebug ? (
        <Text
          style={{
            marginTop: 16,
            marginHorizontal: 16,
            backgroundColor: "white",
          }}
        >
          {JSON.stringify(
            {
              graphqlApiUrl: Constants.expoConfig?.extra?.graphqlApiUrl,
              serviceWorkerUrl: Constants.expoConfig?.extra?.serviceWorkerUrl,
              channel: Updates.channel === "" ? "none" : Updates.channel,
              env: process.env.APP_ENV ?? "none",
            },
            null,
            2
          )}
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
  const walletDisplay = formatWalletAddress(publicKey, 12);

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
        {formatWalletAddress(publicKey)}
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

// original component we use in a bunch of places, wrapped
export const WalletAddressLabel = memo(function WalletAddressLabel({
  publicKey,
}: {
  publicKey: string;
}): JSX.Element {
  return (
    <Stack px={6} py={4} bg="$background" br="$small">
      <StyledText fontSize="$sm" color="$secondary">
        ({formatWalletAddress(publicKey)})
      </StyledText>
    </Stack>
  );
});

// returns a name (username or wallet name) next to an address (public key)
export function NameAddressLabel({
  publicKey,
  name,
}: {
  publicKey: string;
  name: string;
}): JSX.Element {
  return (
    <XStack space={8} ai="center">
      <StyledText fontSize="$sm" color="$fontColor">
        {name}
      </StyledText>
      <WalletAddressLabel publicKey={publicKey} />
    </XStack>
  );
}

// Used for the "from" functionality in sending
export function CurrentUserAvatarWalletNameAddress() {
  const w = useActiveWallet();
  return (
    <XStack space={6} ai="center">
      <CurrentUserAvatar size={24} />
      <NameAddressLabel publicKey={w.publicKey} name={w.name} />
    </XStack>
  );
}

// used for the "to" functionality in sending
// can also be used for the current user "to" when sending to another wallet, just pass in that info
export function AvatarUserNameAddress({
  username,
  avatarUrl,
  publicKey,
}: {
  username: string;
  avatarUrl: string;
  publicKey: string;
}): JSX.Element {
  return (
    <XStack space={6} ai="center">
      <UserAvatar uri={avatarUrl} size={28} />
      <NameAddressLabel publicKey={publicKey} name={username} />
    </XStack>
  );
}

export function BlockchainLogo({
  size,
  blockchain,
  style,
}: {
  size?: number;
  blockchain: Blockchain;
  style?: StyleProp<any>;
}) {
  const logo = getBlockchainLogo(blockchain);
  return (
    <Image
      style={[{ width: size, height: size, aspectRatio: 1 }, style]}
      source={logo}
    />
  );
}
