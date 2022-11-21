import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@hooks";
import { Text, View, Pressable, StyleSheet } from "react-native";
import {
  useEnabledBlockchains,
  SwapProvider,
  useFeatureGates,
} from "@coral-xyz/recoil";
import {
  Blockchain,
  SOL_NATIVE_MINT,
  ETH_NATIVE_MINT,
  STRIPE_ENABLED,
} from "@coral-xyz/common";
import { Margin } from "@components";
// import { WithHeaderButton } from "./TokensWidget/Token";
// import { Deposit } from "./TokensWidget/Deposit";
// import { SendLoader, Send } from "./TokensWidget/Send";
import type { Token } from "../../common/TokenTable";
// import { SearchableTokenTables } from "../../common/TokenTable";
// import { Swap, SelectToken } from "../../Unlocked/Swap";
// import { Ramp } from "./TokensWidget/Ramp";
// import { StripeRamp } from "./StripeRamp";

function Deposit() {
  return null;
}

function SendLoader() {
  return null;
}

function Send() {
  return null;
}

function SearchableTokenTables() {
  return null;
}

function Swap() {
  return null;
}

function SelectToken() {
  return null;
}

function Ramp() {
  return null;
}

function StripeRamp() {
  return null;
}

function IconPlaceholder(props: any) {
  return (
    <View
      style={{
        width: 40,
        height: 40,
        backgroundColor: "orange",
        borderRadius: 80,
      }}
      {...props}
    />
  );
}

const Dollar = IconPlaceholder;
const SwapHoriz = IconPlaceholder;

export function TransferWidget({
  blockchain,
  address,
  rampEnabled,
}: {
  blockchain?: Blockchain;
  address?: string;
  rampEnabled: boolean;
}) {
  const enabledBlockchains = useEnabledBlockchains();
  const featureGates = useFeatureGates();
  const enableOnramp =
    featureGates && featureGates[STRIPE_ENABLED] && rampEnabled;
  const renderSwap =
    blockchain !== Blockchain.ETHEREUM &&
    enabledBlockchains.includes(Blockchain.SOLANA);

  const Spacer = () => <View style={{ width: 16 }} />;

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center", // TODO could be alignItems
        alignItems: "center",
      }}
    >
      {enableOnramp && (
        <>
          <RampButton blockchain={blockchain} address={address} />
          <Spacer />
        </>
      )}
      <ReceiveButton blockchain={blockchain} />
      <Spacer />
      <SendButton blockchain={blockchain} address={address} />
      {renderSwap && (
        <>
          <Spacer />
          <SwapButton blockchain={blockchain} address={address} />
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
}: {
  blockchain?: Blockchain;
  address?: string;
}) {
  const onPress = () => {};

  return (
    <SwapProvider blockchain={Blockchain.SOLANA} tokenAddress={address}>
      <TransferButton label="Swap" icon="compare-arrows" onPress={onPress} />
    </SwapProvider>
  );
}

function SendButton({ blockchain }: { blockchain?: Blockchain }) {
  const onPress = () => {};
  return <TransferButton label="Send" icon="arrow-upward" onPress={onPress} />;
}

function ReceiveButton({ blockchain }: { blockchain?: Blockchain }) {
  const onPress = () => {};
  return (
    <TransferButton label="Receive" icon="arrow-downward" onPress={onPress} />
  );
}

function RampButton({
  blockchain,
  address,
}: {
  blockchain?: Blockchain;
  address?: string;
}) {
  const theme = useTheme();
  return (
    <TransferButton
      label={"Buy"}
      labelComponent={
        <Dollar
          fill={theme.custom.colors.fontColor}
          style={{
            display: "flex",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      }
      routes={
        blockchain && address
          ? [
              {
                name: "stripe",
                component: (props: any) => <StripeRamp {...props} />,
                title: "Buy",
                props: {
                  blockchain,
                  publicKey: address,
                },
              },
            ]
          : [
              {
                component: Ramp,
                title: "Buy",
                name: "onramp",
                props: {
                  blockchain,
                  publicKey: address,
                },
              },
              {
                component: (props: any) => <StripeRamp {...props} />,
                title: "Buy using Link",
                name: "stripe",
              },
            ]
      }
    />
  );
}

function SendToken() {
  const navigation = useNavigation();

  const onPressRow = (blockchain: Blockchain, token: Token) => {
    navigation.push("SendScreenTODO", { blockchain, token });
  };

  return (
    <SearchableTokenTables
      onPressRow={onPressRow}
      customFilter={(token: Token) => {
        if (token.mint && token.mint === SOL_NATIVE_MINT) {
          return true;
        }
        if (token.address && token.address === ETH_NATIVE_MINT) {
          return true;
        }
        return !token.nativeBalance.isZero();
      }}
    />
  );
}
