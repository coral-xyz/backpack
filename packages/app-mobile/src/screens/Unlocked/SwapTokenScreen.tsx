import type { BigNumberish } from "ethers";

import { useState, Suspense } from "react";
import { View, Pressable, ActivityIndicator } from "react-native";

import {
  Blockchain,
  ETH_NATIVE_MINT,
  SOL_NATIVE_MINT,
  toDisplayBalance,
} from "@coral-xyz/common";
import { useSwapContext, TokenData } from "@coral-xyz/recoil";
import {
  XStack,
  Stack,
  YStack,
  StyledText,
  IconKeyboardArrowRight,
  ProxyImage,
} from "@coral-xyz/tamagui";
import { ethers, FixedNumber } from "ethers";
import { ErrorBoundary } from "react-error-boundary";

import { InputFieldMaxLabel } from "~components/Form";
import {
  ScreenError,
  ScreenLoading,
  PrimaryButton,
  Screen,
  FullScreenLoading,
} from "~components/index";

import { SearchableTokenTables } from "./components/Balances";

import { IconButton } from "~src/components/Icon";
import { UnstyledTokenTextInput } from "~src/components/TokenInputField";
import { Token } from "~types/types";

const { Zero } = ethers.constants;

// TODO(peter) share between extension/mobile
enum SwapState {
  INITIAL,
  CONFIRMATION,
  CONFIRMING,
  CONFIRMED,
  ERROR,
}
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
      bg="$card"
      borderColor="$baseBackgroundL1"
      borderWidth={1}
      width={44}
      height={44}
      borderRadius={16}
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
        color="$baseTextMedEmphasis"
        size={24}
        iconStyle={{ transform: [{ rotate: "90deg" }] }}
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
      <View style={{ height: 45 }}>
        <UnstyledTokenTextInput
          placeholder="0"
          onChangeAmount={setFromAmount}
          decimals={fromToken?.decimals}
          value={fromAmount}
          style={{ fontSize: 36, flex: 1, height: 0 }}
        />
      </View>
    );
  }

  const value = toAmount
    ? ethers.utils.formatUnits(toAmount, toToken?.decimals)
    : "";

  return (
    <View style={{ height: 45 }}>
      <StyledText fontSize="$3xl">{value.toString()}</StyledText>
    </View>
  );
}

function InputTokenSelectorButton({ onPress }) {
  const { fromToken } = useSwapContext();
  return (
    <TokenSelectorButton
      token={fromToken!}
      direction="from"
      onPress={onPress}
    />
  );
}

function OutputTokenSelectorButton({ onPress }) {
  const { toToken } = useSwapContext();
  return (
    <TokenSelectorButton token={toToken!} direction="to" onPress={onPress} />
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

function BoxContainer({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <Stack jc="center" bg="$card" borderRadius={16} height={88} p={16}>
      {children}
    </Stack>
  );
}

function CurrencyInputBox({ children, direction }): JSX.Element {
  return (
    <BoxContainer>
      <XStack ai="center" jc="space-between">
        <YStack f={1}>
          <StyledText fontSize="$xs" color="$baseTextMedEmphasis">
            {direction === "from" ? "You pay" : "You receive"}
          </StyledText>
          <TextInputToken direction={direction} />
        </YStack>
        <YStack>{children}</YStack>
      </XStack>
    </BoxContainer>
  );
}

function SwapForm({ navigation }) {
  const { swapToFromMints, canSwitch } = useSwapContext();

  const handleChangeToken = (direction: string) => {
    navigation.push("SwapTokenList", { direction });
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
      <YStack opacity={0.5} bg="$card" borderRadius={16} p={16}>
        <ActivityIndicator
          style={{ position: "absolute", left: "50%", top: "50%" }}
        />
        <YStack space={8}>
          <SwapInfoRow label="You Pay" value="-" />
          <SwapInfoRow label="Rate" value="-" />
          <SwapInfoRow label="Estimated fees" value="-" />
          <SwapInfoRow label="Price impact" value="-" />
        </YStack>
      </YStack>
    );
  }

  if (!fromAmount || !toAmount || !fromToken || !toToken) {
    return (
      <YStack bg="$card" borderRadius={16} p={16} space={8}>
        <SwapInfoRow label="You Pay" value="-" />
        <SwapInfoRow label="Rate" value="-" />
        <SwapInfoRow label="Estimated fees" value="-" />
        <SwapInfoRow label="Price impact" value="-" />
      </YStack>
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
    <YStack bg="$card" borderRadius={16} p={16} space={8}>
      <SwapInfoRow label="You Pay" value={youPayLabel} />
      <SwapInfoRow label="Rate" value={rateLabel} />
      <SwapInfoRow label="Estimated fees" value={networkFeeLabel} />
      <SwapInfoRow label="Price impact" value={priceImpactLabel} />
    </YStack>
  );
}

export function SwapTokenConfirmScreen({ navigation }): JSX.Element {
  const { executeSwap, toToken, toAmount, fromAmount, fromToken } =
    useSwapContext();
  const [swapState, setSwapState] = useState(SwapState.CONFIRMATION);

  const handleExecuteSwap = async () => {
    navigation.setOptions({
      headerShown: false,
    });
    setSwapState(SwapState.CONFIRMING);
    const result = await executeSwap();
    if (result) {
      setSwapState(SwapState.CONFIRMED);
    } else {
      setSwapState(SwapState.ERROR);
    }
  };

  if (swapState === SwapState.CONFIRMING) {
    return (
      <Screen jc="center">
        <YStack space={12} alignSelf="center">
          <ActivityIndicator size="large" />
          <StyledText fontSize="$lg" textAlign="center">
            Swapping...
          </StyledText>
          <StyledText textAlign="center">
            {toToken?.ticker} will be deposited in your wallet once the
            transaction is complete
          </StyledText>
        </YStack>
      </Screen>
    );
  }

  if (swapState === SwapState.CONFIRMED) {
    return (
      <Screen jc="space-between">
        <Stack />
        <YStack space={12}>
          <StyledText fontSize="$3xl" textAlign="center">
            Swap confirmed!
          </StyledText>
          <StyledText textAlign="center">
            Your balance should be updated shortly
          </StyledText>
        </YStack>
        <PrimaryButton
          label="Close"
          onPress={() => {
            navigation.popToTop();
            navigation.goBack(null);
          }}
        />
      </Screen>
    );
  }

  const toDisplayValue = toAmount
    ? ethers.utils.formatUnits(toAmount, toToken?.decimals)
    : "";

  const fromDisplayValue = fromAmount
    ? ethers.utils.formatUnits(fromAmount, fromToken?.decimals)
    : "";

  return (
    <Screen style={{ justifyContent: "space-between" }}>
      <YStack f={1} space={8}>
        <BoxContainer>
          <YStack space={4}>
            <StyledText fontSize="$xs" color="$baseTextMedEmphasis">
              You pay
            </StyledText>
            <View style={{ height: 45 }}>
              <StyledText fontSize="$3xl">
                {fromDisplayValue} {fromToken?.ticker}
              </StyledText>
            </View>
          </YStack>
        </BoxContainer>
        <BoxContainer>
          <YStack space={4}>
            <StyledText fontSize="$xs" color="$baseTextMedEmphasis">
              You receive
            </StyledText>
            <View style={{ height: 45 }}>
              <StyledText fontSize="$3xl">
                {toDisplayValue} {toToken?.ticker}
              </StyledText>
            </View>
          </YStack>
        </BoxContainer>
        <SwapInfo />
      </YStack>
      <PrimaryButton label="Swap" onPress={handleExecuteSwap} />
    </Screen>
  );
}

function Container({ navigation }) {
  const { toAmount, fromAmount, isLoadingRoutes, isLoadingTransactions } =
    useSwapContext();

  // Parameters aren't all entered or the swap data is loading
  const isIncomplete =
    !fromAmount || !toAmount || isLoadingRoutes || isLoadingTransactions;

  return (
    <Screen>
      <YStack space={6} f={1} jc="space-between">
        <YStack space={6}>
          <SwapForm navigation={navigation} />
          <SwapInfo />
        </YStack>
        <PrimaryButton
          loading={isLoadingRoutes || isLoadingTransactions}
          disabled={isIncomplete}
          label="Review"
          onPress={() => {
            navigation.push("SwapTokenConfirm");
          }}
        />
      </YStack>
    </Screen>
  );
}

export function SwapTokenListScreen({ navigation, route }): JSX.Element {
  const { direction } = route.params;
  const { setFromMint, setToMint, toTokens, fromTokens, fromToken } =
    useSwapContext();
  // TODO get the right stuff to show up in each list
  console.log("debug3:toTokens", toTokens);
  console.log("debug3:fromTokens", fromTokens);

  return (
    <Screen>
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
          if (token?.mint !== fromToken?.mint) {
            return true;
          }

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
        <Container navigation={navigation} route={route} />
      </Suspense>
    </ErrorBoundary>
  );
}
