import type { BigNumberish } from "ethers";

import { memo, Suspense, useCallback, useMemo } from "react";
import {
  Pressable,
  Text,
  View,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";

import {
  Blockchain,
  ETH_NATIVE_MINT,
  SOL_NATIVE_MINT,
  formatWalletAddress,
  toDisplayBalance,
  NATIVE_ACCOUNT_RENT_EXEMPTION_LAMPORTS,
} from "@coral-xyz/common";
import {
  useActiveWallet,
  useDarkMode,
  useJupiterOutputTokens,
  useSwapContext,
  SwapProvider,
} from "@coral-xyz/recoil";
import {
  XStack,
  Stack,
  YStack,
  StyledText,
  IconKeyboardArrowRight,
} from "@coral-xyz/tamagui";
import { useNavigation } from "@react-navigation/native";
import { Currency } from "@tamagui/lucide-icons";
import { ethers, FixedNumber, BigNumber } from "ethers";
import { ErrorBoundary } from "react-error-boundary";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { InputField, InputFieldMaxLabel } from "~components/Form";
import {
  ScreenError,
  ScreenLoading,
  StyledTokenTextInput,
  PrimaryButton,
  Screen,
} from "~components/index";

import { SearchableTokenTables } from "./components/Balances";

import { IconButton } from "~src/components/Icon";
import { Token } from "~types/types";

/**
 * Hides miniscule amounts of SOL
 * @example approximateAmount(0.00203928) = "0.002"
 * @param value BigNumberish amount of Solana Lamports
 */
const approximateAmount = (value: BigNumberish) =>
  ethers.utils.formatUnits(value, 9).replace(/(0.0{2,}[1-9])(\d+)/, "$1");

function SwitchTokensButton({ onPress }) {
  return (
    <Stack
      bg="blue"
      width={44}
      height={44}
      borderRadius={12}
      ai="center"
      jc="center"
      position="absolute"
      top="38%"
      left="40%"
      zIndex={1000}
    >
      <IconButton
        onPress={onPress}
        name="keyboard-arrow-down"
        color="$accentBlue"
        size={24}
      />
    </Stack>
  );
}

function TextInputToken() {
  return (
    <TextInput
      placeholder="0"
      style={{ backgroundColor: "yellow", fontSize: 36, flex: 1 }}
    />
  );
}

function TokenSelector({ onPress }) {
  return (
    <Pressable onPress={onPress}>
      <XStack bg="orange" ai="center" borderRadius={8} p={4}>
        <StyledText>SOL</StyledText>
        <IconKeyboardArrowRight />
      </XStack>
    </Pressable>
  );
}

function Balance() {
  return <StyledText>Balance: 0</StyledText>;
}

function CurrencyInputBox({ onPressSelectToken }): JSX.Element {
  return (
    <Stack jc="center" bg="white" borderRadius={16} height={100} mb={6} p={16}>
      <XStack ai="center" jc="space-between">
        <TextInputToken />
        <YStack>
          <TokenSelector onPress={onPressSelectToken} />
          <Balance />
        </YStack>
      </XStack>
    </Stack>
  );
}

function SwapForm({ navigation }) {
  const { swapToFromMints, fromToken, canSwitch } = useSwapContext();

  const handlePressSwapDirection = () => {
    // swap direction (to begins from, etc)
  };

  const handlePressSelectToken = () => {
    navigation.push("SwapTokenList");
    // navigation.push token selector
  };

  return (
    <YStack>
      <CurrencyInputBox onPressSelectToken={handlePressSelectToken} />
      <SwitchTokensButton disabled={!canSwitch} onPress={swapToFromMints} />
      <CurrencyInputBox onPressSelectToken={handlePressSelectToken} />
    </YStack>
  );
}

function SwapInfoRow({ label, value }) {
  return (
    <XStack ai="center" jc="space-between">
      <StyledText>{label}</StyledText>
      <StyledText>{value}</StyledText>
    </XStack>
  );
}

function SwapInfo() {
  const {
    fromAmount,
    toAmount,
    fromToken,
    toToken,
    priceImpactPct,
    isLoadingRoutes,
    isLoadingTransactions,
    transactionFees,
    // swapFee,
  } = useSwapContext();

  // Loading indicator when routes are being loaded due to polling
  if (isLoadingRoutes || isLoadingTransactions) {
    return <ActivityIndicator size="small" />;
  }

  if (!fromAmount || !toAmount || !fromToken || !toToken) {
    return (
      <Stack bg="white" borderRadius={16} mb={6} p={16}>
        <StyledText>Select a token to see fees, etc</StyledText>
      </Stack>
    );
  }

  const decimalDifference = fromToken.decimals - toToken.decimals;

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
    ? ethers.utils.commify(
        scale(
          FixedNumber.from(toAmount).divUnsafe(FixedNumber.from(fromAmount)),
          decimalDifference
        ).toString()
      )
    : "0";

  const youPayLabel = `${toDisplayBalance(fromAmount, fromToken.decimals)} ${
    fromToken.ticker
  }`;

  const rateLabel = `1 ${fromToken.ticker} ≈ ${rate.substring(0, 10)} ${
    toToken.ticker
  }`;

  const priceImpactLabel =
    priceImpactPct === 0
      ? 0
      : priceImpactPct > 0.1
      ? priceImpactPct.toFixed(2)
      : "< 0.1";

  const networkFeeLabel = transactionFees
    ? `~ ${approximateAmount(transactionFees.total)} SOL`
    : "-";

  return (
    <Stack bg="white" borderRadius={16} height={100} mb={6} p={16}>
      <SwapInfoRow label="Wallet" value="Wallet 1" />
      <SwapInfoRow label="You Pay" value={youPayLabel} />
      <SwapInfoRow label="Rate" value={rateLabel} />
      <SwapInfoRow label="Estimated fees" value={networkFeeLabel} />
      <SwapInfoRow label="Price impact" value={priceImpactLabel} />
    </Stack>
  );
}

function Container({ navigation, route }) {
  const handleSwap = () => {};
  const isDisabled = true;

  return (
    <Screen>
      <SwapForm navigation={navigation} />
      <SwapInfo />
      <PrimaryButton
        disabled={isDisabled}
        label="Review"
        onPress={() => handleSwap()}
      />
    </Screen>
  );
}

export function SwapTokenListScreen({ navigation }): JSX.Element {
  return (
    <Screen>
      <SearchableTokenTables
        onPressRow={(blockchain: Blockchain, token: Token) => {
          navigation.goBack();
        }}
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
    </Screen>
  );
}

export function SwapTokenScreen({ navigation, route }): JSX.Element {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <ScreenError error={error} />}
    >
      <Suspense fallback={<ScreenLoading />}>
        <SwapProvider>
          <Container navigation={navigation} route={route} />
        </SwapProvider>
      </Suspense>
    </ErrorBoundary>
  );
}

// <View>
//   <InputField
//     leftLabel="Sending"
//     rightLabelComponent={
//       <InputFieldMaxLabel
//         label="Max swap:"
//         amount={BigNumber.from(0)}
//         onSetAmount={console.log}
//         decimals={0}
//       />
//     }
//   >
//     <StyledTokenTextInput
//       value={BigNumber.from(20)}
//       decimals={0}
//       placeholder="0"
//       onChangeText={console.log}
//     />
//   </InputField>
//   <InputField leftLabel="Receiving">
//     <StyledTokenTextInput
//       value={BigNumber.from(20)}
//       decimals={0}
//       placeholder="0"
//       onChangeText={console.log}
//     />
//   </InputField>
// </View>
//
