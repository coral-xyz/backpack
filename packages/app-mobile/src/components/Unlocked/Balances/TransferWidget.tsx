import { Pressable, Text, View } from "react-native";

import { Token, NavTokenAction, NavTokenOptions } from "@@types/types";
import { Blockchain } from "@coral-xyz/common";
// import // SwapProvider, // TODO(peter): turn back on when app store approved
// enabledBlockchains as enabledBlockchainsAtom,
// "@coral-xyz/recoil";
import { XStack } from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";
// import { useRecoilValueLoadable } from "recoil";

import { Margin } from "~components/index";
import { useTheme } from "~hooks/useTheme";

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
  address,
  blockchain,
  onPressOption,
  rampEnabled,
  swapEnabled,
  token,
}: {
  address?: string;
  blockchain?: Blockchain;
  onPressOption: (action: NavTokenAction, options: NavTokenOptions) => void;
  rampEnabled: boolean;
  swapEnabled: boolean;
  token?: Token;
}): JSX.Element {
  // const eb = useRecoilValueLoadable(enabledBlockchainsAtom);
  // const enabledBlockchains = eb.state === "hasValue" ? eb.contents : [];
  // const renderSwap =
  //   blockchain !== Blockchain.ETHEREUM &&
  //   enabledBlockchains.includes(Blockchain.SOLANA);

  const onPress = (action: NavTokenAction, options: NavTokenOptions) => {
    const route = getRouteFromAction(action);
    onPressOption(route, options);
  };

  return (
    <XStack space jc="center">
      {rampEnabled ? (
        <RampButton blockchain={blockchain} address={address} />
      ) : null}
      <ReceiveButton onPress={onPress} blockchain={blockchain} />
      <SendButton onPress={onPress} blockchain={blockchain} token={token} />
      {swapEnabled ? (
        <SwapButton
        // onPress={onPress}
        // blockchain={blockchain}
        // address={address}
        />
      ) : null}
    </XStack>
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

// NOTE(peter) turned off for app store launch
function SwapButton() {
  // function SwapButton({
  // blockchain,
  // address,
  // onPress,
  // }: {
  // blockchain?: Blockchain;
  // address?: string;
  // onPress: (route: NavTokenAction, options: NavTokenOptions) => void;
  // }) {
  return null;
  // return (
  //   <SwapProvider tokenAddress={address}>
  //     <TransferButton
  //       label="Swap"
  //       icon="compare-arrows"
  //       onPress={() => onPress(NavTokenAction.Swap, { blockchain })}
  //     />
  //   </SwapProvider>
  // );
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
