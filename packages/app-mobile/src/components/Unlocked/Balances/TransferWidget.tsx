import { Pressable, StyleSheet, Text, View } from "react-native";
import { Margin } from "@components";
import {
  Blockchain,
  ETH_NATIVE_MINT,
  SOL_NATIVE_MINT,
  STRIPE_ENABLED,
} from "@coral-xyz/common";
import {
  SwapProvider,
  useEnabledBlockchains,
  useFeatureGates,
} from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@hooks";
import { useNavigation } from "@react-navigation/native";

// import { WithHeaderButton } from "./TokensWidget/Token";
// import { Deposit } from "./TokensWidget/Deposit";
// import { SendLoader, Send } from "./TokensWidget/Send";
import type { Token } from "../../common/TokenTable";
// import { SearchableTokenTables } from "../../common/TokenTable";
// import { Swap, SelectToken } from "../../Unlocked/Swap";
// import { Ramp } from "./TokensWidget/Ramp";
// import { StripeRamp } from "./StripeRamp";

type ModalRoutes = "Send" | "Receive" | "Swap";

export function TransferWidget({
  blockchain,
  address,
  rampEnabled,
  onNavigate,
}: {
  blockchain?: Blockchain;
  address?: string;
  rampEnabled: boolean;
  onNavigate: (route: string) => void;
}) {
  const enabledBlockchains = useEnabledBlockchains();
  const featureGates = useFeatureGates();
  const enableOnramp =
    featureGates && featureGates[STRIPE_ENABLED] && rampEnabled;
  const renderSwap =
    blockchain !== Blockchain.ETHEREUM &&
    enabledBlockchains.includes(Blockchain.SOLANA);

  const Spacer = () => <View style={{ width: 16 }} />;

  const onPress = (route: string) => onNavigate(route);

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {enableOnramp && (
        <>
          <RampButton
            onPress={onPress}
            blockchain={blockchain}
            address={address}
          />
          <Spacer />
        </>
      )}
      <ReceiveButton onPress={onPress} blockchain={blockchain} />
      <Spacer />
      <SendButton onPress={onPress} blockchain={blockchain} address={address} />
      {renderSwap && (
        <>
          <Spacer />
          <SwapButton
            onPress={onPress}
            blockchain={blockchain}
            address={address}
          />
        </>
      )}
    </View>
  );
}

function TransferButton({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={{ alignItems: "center" }}>
      <Margin bottom={8}>
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 100,
            backgroundColor: theme.custom.colors.backgroundColor,
            borderColor: theme.custom.colors.borderColor,
            borderWidth: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialIcons
            name={icon}
            size={24}
            color={theme.custom.colors.fontColor}
          />
        </View>
      </Margin>
      <Text
        style={{
          color: theme.custom.colors.secondary,
          fontSize: 14,
          fontWeight: "500",
          lineHeight: 20,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SwapButton({
  blockchain,
  address,
  onPress,
}: {
  blockchain?: Blockchain;
  address?: string;
  onPress: (route: string) => void;
}) {
  return (
    <SwapProvider blockchain={Blockchain.SOLANA} tokenAddress={address}>
      <TransferButton
        label="Swap"
        icon="compare-arrows"
        onPress={() => onPress("SwapModal")}
      />
    </SwapProvider>
  );
}

function SendButton({
  blockchain,
  onPress,
}: {
  blockchain?: Blockchain;
  onPress: (route: string) => void;
}) {
  return (
    <TransferButton
      label="Send"
      icon="arrow-upward"
      onPress={() => onPress("SendSelectTokenModal")}
    />
  );
}

function ReceiveButton({
  blockchain,
  onPress,
}: {
  blockchain?: Blockchain;
  onPress: (route: string) => void;
}) {
  return (
    <TransferButton
      label="Receive"
      icon="arrow-downward"
      onPress={() => onPress("ReceiveModal")}
    />
  );
}

function RampButton({
  blockchain,
  address,
}: {
  blockchain?: Blockchain;
  address?: string;
}) {
  return null;
}
