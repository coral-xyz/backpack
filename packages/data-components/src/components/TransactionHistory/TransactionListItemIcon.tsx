import { View, type ViewStyle } from "react-native";
import { SOL_LOGO_URI, UNKNOWN_ICON_SRC } from "@coral-xyz/recoil";
import type { SizeTokens } from "@coral-xyz/tamagui";
import { ListItemIconCore, TamaguiIcons } from "@coral-xyz/tamagui";
import { Source, TransactionType } from "helius-sdk";

import type { Transaction } from "../../apollo/graphql";

const wrapperStyles = (size: SizeTokens): ViewStyle => ({
  height: size,
  width: size,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

export type TransactionListItemIconProps = {
  transaction: Partial<Transaction>;
  size: SizeTokens;
};

export function TransactionListItemIcon({
  transaction,
  size,
}: TransactionListItemIconProps) {
  if (transaction.error) {
    return <TransactionListItemIconError size={size} />;
  }

  switch (transaction.type) {
    case TransactionType.SWAP: {
      return (
        <TransactionListItemIconSwap
          size={size}
          tokenLogos={[UNKNOWN_ICON_SRC, SOL_LOGO_URI]}
        />
      );
    }

    case TransactionType.TRANSFER: {
      if (transaction.source === Source.SYSTEM_PROGRAM) {
        return (
          <TransactionListItemIconTransfer
            size={size}
            tokenLogo={SOL_LOGO_URI}
          />
        );
      }
      return <TransactionListItemIconReceived size={size} />; // TODO: change to received with token image
    }

    case TransactionType.BURN:
    case TransactionType.BURN_NFT: {
      return <TransactionListItemIconBurn size={44} />;
    }

    default: {
      return <TransactionListItemIconDefault size={size} />;
    }
  }
}

export type TransactionListItemIconTypeProps = {
  size: SizeTokens;
};

const TransactionListItemIconBurn = ({
  size,
}: TransactionListItemIconTypeProps) => (
  <View style={wrapperStyles(size)}>
    <TamaguiIcons.Flame color="$negative" />
  </View>
);

const TransactionListItemIconDefault = ({
  size,
}: TransactionListItemIconTypeProps) => (
  <View style={wrapperStyles(size)}>
    <TamaguiIcons.Check color="$positive" />
  </View>
);

const TransactionListItemIconError = ({
  size,
}: TransactionListItemIconTypeProps) => (
  <View style={wrapperStyles(size)}>
    <TamaguiIcons.X color="$negative" />
  </View>
);

const TransactionListItemIconReceived = ({
  size,
}: TransactionListItemIconTypeProps) => (
  <View style={wrapperStyles(size)}>
    <TamaguiIcons.ArrowDown color="$secondary" />
  </View>
);

const TransactionListItemIconSwap = ({
  tokenLogos,
}: TransactionListItemIconTypeProps & {
  tokenLogos: [string, string];
}) => (
  <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
    <ListItemIconCore
      style={{ marginRight: 10, marginBottom: 15 }}
      radius={12}
      size={24}
      image={tokenLogos[0]}
    />
    <ListItemIconCore
      style={{ marginLeft: -15, zIndex: 10 }}
      radius={12}
      size={24}
      image={tokenLogos[1]}
    />
  </View>
);

const TransactionListItemIconTransfer = ({
  size,
  tokenLogo,
}: TransactionListItemIconTypeProps & { tokenLogo: string }) => (
  <View style={wrapperStyles(size)}>
    <ListItemIconCore size={size} radius={22} image={tokenLogo} />
  </View>
);
