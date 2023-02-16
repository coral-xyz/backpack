import { Pressable, Text, View } from "react-native";

import { Token, NavTokenAction, NavTokenOptions } from "@@types/types";
import { Blockchain } from "@coral-xyz/common";
import {
  SwapProvider, // TODO(peter): broken
  enabledBlockchains as enabledBlockchainsAtom,
} from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";
import { useRecoilValueLoadable } from "recoil";

import { Margin } from "~components/index";
import { useTheme } from "~hooks/useTheme";

const HorizontalSpacer = () => <View style={{ width: 16 }} />;
const ENABLE_ONRAMP = false;

const getRouteFromAction = (
  action: NavTokenAction
): "DepositList" | "SendSelectTokenModal" | "SwapModal" => {
  switch (action) {
    case NavTokenAction.Receive:
      return "DepositList";
    case NavTokenAction.Send:
      return "SendSelectTokenModal";
    case NavTokenAction.Swap:
      return "SwapModal";
    default:
      return "DepositList";
  }
};

export function TransferWidget({
  blockchain,
  address,
  onPressOption,
  token,
}: {
  blockchain?: Blockchain;
  address?: string;
  rampEnabled: boolean;
  onPressOption: (action: NavTokenAction, options: NavTokenOptions) => void;
  token?: Token;
}): JSX.Element {
  const eb = useRecoilValueLoadable(enabledBlockchainsAtom);
  const enabledBlockchains = eb.state === "hasValue" ? eb.contents : [];
  const enableOnramp = ENABLE_ONRAMP;
  const renderSwap =
    blockchain !== Blockchain.ETHEREUM &&
    enabledBlockchains.includes(Blockchain.SOLANA);

  const onPress = (action: NavTokenAction, options: NavTokenOptions) => {
    const route = getRouteFromAction(action);
    onPressOption(route, options);
  };

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
          <RampButton blockchain={blockchain} address={address} />
          <HorizontalSpacer />
        </>
      ) : null}
      <ReceiveButton onPress={onPress} blockchain={blockchain} />
      <HorizontalSpacer />
      <SendButton onPress={onPress} blockchain={blockchain} token={token} />
      {renderSwap ? (
        <>
          <HorizontalSpacer />
          <SwapButton
            onPress={onPress}
            blockchain={blockchain}
            address={address}
          />
        </>
      ) : null}
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
}): JSX.Element {
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
  onPress: (route: NavTokenAction, options: NavTokenOptions) => void;
}) {
  return (
    <SwapProvider tokenAddress={address}>
      <TransferButton
        label="Swap"
        icon="compare-arrows"
        onPress={() => onPress(NavTokenAction.Swap, { blockchain })}
      />
    </SwapProvider>
  );
}

function SendButton({
  blockchain,
  onPress,
  token,
}: {
  blockchain?: Blockchain;
  onPress: (route: NavTokenAction, options: NavTokenOptions) => void;
  token?: Token;
}): JSX.Element {
  return (
    <TransferButton
      label="Send"
      icon="arrow-upward"
      onPress={() =>
        onPress(NavTokenAction.Send, {
          blockchain,
          token: token
            ? { ...token, nativeBalance: token.nativeBalance.toString() }
            : null,
          title: "TODO",
        })
      }
    />
  );
}

function ReceiveButton({
  blockchain,
  onPress,
}: {
  blockchain?: Blockchain;
  onPress: (route: NavTokenAction, options: NavTokenOptions) => void;
}): JSX.Element {
  return (
    <TransferButton
      label="Receive"
      icon="arrow-downward"
      onPress={() => onPress(NavTokenAction.Receive, { blockchain })}
    />
  );
}

function RampButton({
  blockchain,
  address,
}: {
  blockchain?: Blockchain;
  address?: string;
}): null {
  return null;
}
