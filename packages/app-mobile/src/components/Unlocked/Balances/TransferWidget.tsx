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

const HorizontalSpacer = () => <View style={{ width: 16 }} />;

export function TransferWidget({
  blockchain,
  address,
  rampEnabled,
  onPressOption,
}: {
  blockchain?: Blockchain;
  address?: string;
  rampEnabled: boolean;
  onPressOption: (option: string, options: any) => void;
}) {
  const enabledBlockchains = useEnabledBlockchains();
  const featureGates = useFeatureGates();
  const enableOnramp =
    featureGates && featureGates[STRIPE_ENABLED] && rampEnabled;
  const renderSwap =
    blockchain !== Blockchain.ETHEREUM &&
    enabledBlockchains.includes(Blockchain.SOLANA);

  const onPress = (route: string, options: any) =>
    onPressOption(route, options);

  console.log("transferwidget", blockchain);

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {enableOnramp ? (
        <>
          <RampButton
            onPress={onPress}
            blockchain={blockchain}
            address={address}
          />
          <HorizontalSpacer />
        </>
      ) : null}
      <ReceiveButton onPress={onPress} blockchain={blockchain} />
      <HorizontalSpacer />
      <SendButton onPress={onPress} blockchain={blockchain} address={address} />
      {renderSwap && (
        <>
          <HorizontalSpacer />
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
            borderRadius: 25,
            borderColor: theme.custom.colors.borderFull,
            backgroundColor: theme.custom.colors.nav,
            borderWidth: 2,
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
  console.log("receive blockchain", blockchain);
  return (
    <TransferButton
      label="Receive"
      icon="arrow-downward"
      onPress={() => onPress("ReceiveModal", { blockchain })}
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
