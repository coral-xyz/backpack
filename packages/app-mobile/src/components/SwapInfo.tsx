import type { Token } from "../common/TokenTable";
import type { Button } from "@mui/material";

import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import {
  Blockchain,
  ETH_NATIVE_MINT,
  SOL_NATIVE_MINT,
  WSOL_MINT,
} from "@coral-xyz/common";
import { CheckIcon, CrossIcon } from "@coral-xyz/react-common";
import {
  useJupiterOutputMints,
  useSplTokenRegistry,
  useSwapContext,
} from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { useTheme } from "~hooks/useTheme";
import { ExpandMore, SwapVert } from "@mui/icons-material";
import { IconButton, InputAdornment, Typography } from "@mui/material";
import { ethers, FixedNumber } from "ethers";

import { Button as XnftButton } from "../../plugin/Component";
import {
  DangerButton,
  Loading,
  PrimaryButton,
  SecondaryButton,
  TextField,
  TextFieldLabel,
} from "../common";
import { ApproveTransactionDrawer } from "../common/ApproveTransactionDrawer";
import { useDrawerContext } from "../common/Layout/Drawer";
import { useNavStack } from "../common/Layout/NavStack";
import { TokenAmountHeader } from "../common/TokenAmountHeader";
import { TokenInputField } from "../common/TokenInput";
import { SearchableTokenTable } from "../common/TokenTable";
import { BottomCard } from "./Balances/TokensWidget/Send";

const { Zero } = ethers.constants;

export function SwapInfo({ compact = true }: { compact?: boolean }) {
  const theme = useTheme();
  const {
    fromAmount,
    toAmount,
    fromMintInfo,
    toMintInfo,
    priceImpactPct,
    isLoadingRoutes,
    isLoadingTransactions,
    transactionFee,
    swapFee,
  } = useSwapContext();

  // Loading indicator when routes are being loaded due to polling
  if (isLoadingRoutes || isLoadingTransactions) {
    return <ActivityIndicator style={{ alignSelf: "center" }} />;
  }

  if (!fromAmount || !toAmount) {
    return <></>;
  }

  const decimalDifference = fromMintInfo.decimals - toMintInfo.decimals;
  const toAmountWithFees = toAmount.sub(swapFee);

  // Scale a FixedNumber up or down by a number of decimals
  const scale = (x: FixedNumber, decimalDifference: number) => {
    if (decimalDifference > 0) {
      return x.mulUnsafe(FixedNumber.from(10 ** decimalDifference));
    } else if (decimalDifference < 0) {
      return x.divUnsafe(FixedNumber.from(10 ** Math.abs(decimalDifference)));
    }
    return x;
  };

  const rate = fromAmount.gt(Zero)
    ? scale(
        FixedNumber.from(toAmountWithFees).divUnsafe(
          FixedNumber.from(fromAmount)
        ),
        decimalDifference
      ).toString()
    : "0";

  const rows = [];
  if (!compact) {
    rows.push([
      "You Pay",
      `${ethers.utils.formatUnits(fromAmount, fromMintInfo.decimals)} ${
        fromMintInfo.symbol
      }`,
    ]);
  }
  rows.push([
    "Rate",
    `1 ${fromMintInfo.symbol} = ${rate} ${toMintInfo.symbol}`,
  ]);
  rows.push([
    "Network Fee",
    transactionFee ? `${ethers.utils.formatUnits(transactionFee, 9)} SOL` : "-",
  ]);
  if (!compact) {
    rows.push([
      "Backpack Fee",
      <span style={{ color: theme.custom.colors.secondary }}>FREE</span>,
    ]);
  }
  rows.push([
    "Price Impact",
    `${
      priceImpactPct === 0
        ? 0
        : priceImpactPct > 0.1
        ? priceImpactPct.toFixed(2)
        : "< 0.1"
    }%`,
  ]);

  return (
    <>
      {rows.map((r: any) => (
        <SwapInfoRow key={r[0]} titleLeft={r[0]} titleRight={r[1]} />
      ))}
    </>
  );
}

export function SwapInfoRow({
  titleLeft,
  titleRight,
}: {
  titleLeft: string;
  titleRight: string;
}): JSX.Element {
  const theme = useTheme();
  return (
    <View style={swapInfoStyles.swapInfoRow}>
      <Text
        style={[
          swapInfoStyles.swapInfoTitleLeft,
          { color: theme.custom.colors.secondary },
        ]}
      >
        {titleLeft}
      </Text>
      <Text
        style={[
          swapInfoStyles.swapInfoTitleRight,
          { color: theme.custom.colors.fontColor },
        ]}
      >
        {titleRight}
      </Text>
    </View>
  );
}

const swapInfoStyles = StyleSheet.create({
  swapInfoRow: {
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  swapInfoTitleLeft: {
    lineHeight: 20,
    fontSize: 14,
    fontWeight: "500",
  },
  swapInfoTitleRight: {
    lineHeight: 20,
    fontSize: 14,
    fontWeight: "500",
  },
});
