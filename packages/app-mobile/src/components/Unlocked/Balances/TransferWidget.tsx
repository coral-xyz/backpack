import { useNavigation } from "@react-navigation/native";
// import { Typography } from "@mui/material";
import { useTheme } from "@hooks";
import { Text, View } from "react-native";
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

function Typography({ style, children, ...props }: any) {
  return (
    <Text style={style} {...props}>
      {children}
    </Text>
  );
}

function WithHeaderButton({ children, style, ...props }: any) {
  return (
    <View style={style} {...props}>
      {children}
    </View>
  );
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
const ArrowUpward = IconPlaceholder;
const ArrowDownward = IconPlaceholder;
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
        width:
          enableOnramp && renderSwap
            ? 256
            : renderSwap || enableOnramp
            ? 188
            : 120,
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

function SwapButton({
  blockchain,
  address,
}: {
  blockchain?: Blockchain;
  address?: string;
}) {
  const theme = useTheme();

  return (
    <SwapProvider blockchain={Blockchain.SOLANA} tokenAddress={address}>
      <TransferButton
        label={"Swap"}
        labelComponent={
          <SwapHoriz
            style={{
              color: theme.custom.colors.fontColor,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />
        }
        routes={[
          {
            name: "swap",
            component: (props: any) => <Swap {...props} />,
            title: `Swap`,
            props: {
              blockchain,
            },
          },
          {
            title: `Select Token`,
            name: "select-token",
            component: (props: any) => <SelectToken {...props} />,
          },
        ]}
      />
    </SwapProvider>
  );
}

function SendButton({
  blockchain,
  address,
}: {
  blockchain?: Blockchain;
  address?: string;
}) {
  const theme = useTheme();
  return (
    <TransferButton
      label={"Send"}
      labelComponent={
        <ArrowUpward
          style={{
            color: theme.custom.colors.fontColor,
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
                name: "send",
                component: (props: any) => <SendLoader {...props} />,
                title: `Send`,
                props: {
                  blockchain,
                  address,
                },
              },
            ]
          : [
              {
                name: "select-token",
                component: SendToken,
                title: "Select token",
              },
              {
                name: "send",
                component: (props: any) => <Send {...props} />,
                title: "",
              },
            ]
      }
    />
  );
}

function ReceiveButton({ blockchain }: { blockchain?: Blockchain }) {
  const theme = useTheme();
  return (
    <TransferButton
      label={"Receive"}
      labelComponent={
        <ArrowDownward
          style={{
            color: theme.custom.colors.fontColor,
            display: "flex",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      }
      routes={[
        {
          component: Deposit,
          title: "Deposit",
          name: "deposit",
          props: {
            blockchain,
          },
        },
      ]}
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

function TransferButton({
  label,
  labelComponent,
  routes,
}: {
  label: string;
  labelComponent: any;
  routes: Array<{ props?: any; component: any; title: string; name: string }>;
}) {
  const theme = useTheme();

  return (
    <View
      style={{
        width: 52,
        height: 70,
      }}
    >
      <WithHeaderButton
        style={{
          padding: 0,
          width: 42,
          height: 42,
          borderRadius: 21,
          marginBottom: 8,
          // width: "42px",
          // height: "42px",
          // minWidth: "42px",
          // borderRadius: "21px",
          // boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.15)",
          // marginLeft: "auto",
          // marginRight: "auto",
          // display: "block",
          // marginBottom: "8px",
        }}
        label={""}
        labelComponent={labelComponent}
        routes={routes}
      />
      <Typography
        style={{
          color: theme.custom.colors.secondary,
          fontSize: 14,
          fontWeight: "500",
          lineHeight: 20,
          textAlign: "center",
        }}
      >
        {label}
      </Typography>
    </View>
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
