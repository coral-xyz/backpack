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
  TokenData,
  TokenDataWithPrice,
} from "@coral-xyz/recoil";
import {
  XStack,
  Stack,
  YStack,
  StyledText,
  IconKeyboardArrowRight,
  ProxyImage,
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
import { UnstyledTokenTextInput } from "~src/components/TokenInputField";
import { Token } from "~types/types";

const { Zero } = ethers.constants;

/**
 * Hides miniscule amounts of SOL
 * @example approximateAmount(0.00203928) = "0.002"
 * @param value BigNumberish amount of Solana Lamports
 */
const approximateAmount = (value: BigNumberish) =>
  ethers.utils.formatUnits(value, 9).replace(/(0.0{2,}[1-9])(\d+)/, "$1");

function SwitchTokensButton({
  disabled,
  onPress,
}: {
  disabled: boolean;
  onPress: () => void;
}): JSX.Element {
  return (
    <Stack
      bg="$baseBackgroundL1"
      borderColor="$baseBackgroundL1"
      borderWidth={1}
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
        disabled={disabled}
        onPress={onPress}
        name="compare-arrows"
        color="$accentBlue"
        size={24}
      />
    </Stack>
  );
}

function TextInputToken({
  direction,
}: {
  direction: "from" | "to";
}): JSX.Element {
  const { toAmount, toToken, fromAmount, setFromAmount, fromToken } =
    useSwapContext();

  if (direction === "from") {
    return (
      <UnstyledTokenTextInput
        placeholder="0"
        onChangeAmount={setFromAmount}
        decimals={fromToken?.decimals}
        value={fromAmount}
        style={{ fontSize: 36, flex: 1 }}
      />
    );
  }

  const value = toAmount
    ? ethers.utils.formatUnits(toAmount, toToken?.decimals)
    : "";

  return <StyledText fontSize="$3xl">{value.toString()}</StyledText>;
}

function InputTokenSelectorButton({ onPress }) {
  const { fromToken } = useSwapContext();
  return (
    <TokenSelectorButton token={fromToken!} direction="to" onPress={onPress} />
  );
}

function OutputTokenSelectorButton({ onPress }) {
  const { toToken } = useSwapContext();
  return (
    <TokenSelectorButton token={toToken!} direction="from" onPress={onPress} />
  );
}

function TokenSelectorButton({
  token,
  direction,
  onPress,
}: {
  token: TokenData;
  direction: string;
  onPress: (direction: string) => void;
}): JSX.Element {
  return (
    <Pressable onPress={() => onPress(direction)}>
      <XStack
        bg="$card"
        ai="center"
        borderRadius={8}
        px={8}
        py={4}
        borderColor="$baseBackgroundL1"
        borderWidth={1}
      >
        <ProxyImage src={token?.logo} size={24} style={{ borderRadius: 12 }} />
        <StyledText ml={4}>{token?.ticker}</StyledText>
        <IconKeyboardArrowRight />
      </XStack>
    </Pressable>
  );
}

function InputMaxTokenButton() {
  const { availableForSwap, setFromAmount, fromToken } = useSwapContext();

  return (
    <InputFieldMaxLabel
      amount={availableForSwap}
      decimals={fromToken?.decimals!}
      onSetAmount={setFromAmount}
    />
  );
}

function CurrencyInputBox({ children, direction }): JSX.Element {
  return (
    <Stack jc="center" bg="$card" borderRadius={16} height={88} p={16}>
      <XStack ai="center" jc="space-between">
        <TextInputToken direction={direction} />
        <YStack>{children}</YStack>
      </XStack>
    </Stack>
  );
}

function SwapForm({ navigation }) {
  const { swapToFromMints, fromToken, canSwitch } = useSwapContext();

  const handleChangeToken = (direction: string) => {
    navigation.push("SwapTokenList", { direction });
    // navigation.push token selector
  };

  return (
    <YStack space={3}>
      <CurrencyInputBox direction="from">
        <YStack space={4}>
          <InputTokenSelectorButton onPress={handleChangeToken} />
          <InputMaxTokenButton />
        </YStack>
      </CurrencyInputBox>
      <SwitchTokensButton disabled={!canSwitch} onPress={swapToFromMints} />
      <CurrencyInputBox direction="to">
        <OutputTokenSelectorButton onPress={handleChangeToken} />
      </CurrencyInputBox>
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
    return (
      <Stack opacity={0.5} bg="$card" borderRadius={16} p={16}>
        <ActivityIndicator
          style={{ position: "absolute", left: "50%", top: "50%" }}
        />
        <SwapInfoRow label="Wallet" value="TODO wallet" />
        <SwapInfoRow label="You Pay" value="-" />
        <SwapInfoRow label="Rate" value="-" />
        <SwapInfoRow label="Estimated fees" value="-" />
        <SwapInfoRow label="Price impact" value="-" />
      </Stack>
    );
  }

  if (!fromAmount || !toAmount || !fromToken || !toToken) {
    return (
      <Stack bg="$card" borderRadius={16} p={16}>
        <SwapInfoRow label="Wallet" value="TODO wallet" />
        <SwapInfoRow label="You Pay" value="-" />
        <SwapInfoRow label="Rate" value="-" />
        <SwapInfoRow label="Estimated fees" value="-" />
        <SwapInfoRow label="Price impact" value="-" />
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
    <Stack bg="$card" borderRadius={16} p={16}>
      <SwapInfoRow label="Wallet" value="TODO wallet" />
      <SwapInfoRow label="You Pay" value={youPayLabel} />
      <SwapInfoRow label="Rate" value={rateLabel} />
      <SwapInfoRow label="Estimated fees" value={networkFeeLabel} />
      <SwapInfoRow label="Price impact" value={priceImpactLabel} />
    </Stack>
  );
}

function Container({ navigation, route }) {
  const handleSwap = () => {};

  const { isLoadingRoutes, isLoadingTransactions } = useSwapContext();

  const isDisabled = isLoadingRoutes || isLoadingTransactions;

  return (
    <Screen>
      <YStack space={6}>
        <SwapForm navigation={navigation} />
        <SwapInfo />
        <PrimaryButton
          loading={isLoadingRoutes || isLoadingTransactions}
          disabled={isDisabled}
          label="Review"
          onPress={() => handleSwap()}
        />
      </YStack>
    </Screen>
  );
}

export function SwapTokenListScreen({ navigation, route }): JSX.Element {
  const { direction } = route.params;
  const { fromTokens, toTokens, setFromMint, setToMint } = useSwapContext();
  console.log("debug1:fromTokens", fromTokens);
  console.log("debug1:toTokens", toTokens);

  return (
    <Screen>
      <SwapProvider>
        <SearchableTokenTables
          onPressRow={(_b: Blockchain, token: Token) => {
            if (direction === "from") {
              setFromMint(token.mint!);
            } else {
              setToMint(token.mint!);
            }
            navigation.goBack();
          }}
          customFilter={(token: Token) => {
            // TODO make sure custom filter only supports SOL swaps
            if (token.mint && token.mint === SOL_NATIVE_MINT) {
              return true;
            }
            if (token.address && token.address === ETH_NATIVE_MINT) {
              return true;
            }
            return !token.nativeBalance.isZero();
          }}
        />
      </SwapProvider>
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
