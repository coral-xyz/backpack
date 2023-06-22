import { useState, useLayoutEffect, Suspense, useTransition } from "react";
import {
  ScrollView,
  View,
  Pressable,
  ActivityIndicator,
  Keyboard,
} from "react-native";

import {
  Blockchain,
  ETH_NATIVE_MINT,
  SOL_NATIVE_MINT,
  WSOL_MINT,
  toDisplayBalance,
} from "@coral-xyz/common";
import {
  useSwapContext,
  TokenData,
  useJupiterOutputTokens,
  SwapState,
} from "@coral-xyz/recoil";
import {
  XStack,
  Stack,
  YStack,
  StyledText,
  IconKeyboardArrowRight,
  ProxyImage,
  useTheme as useTamaguiTheme,
} from "@coral-xyz/tamagui";
import { ethers, FixedNumber } from "ethers";
import { ErrorBoundary } from "react-error-boundary";

import { InputFieldMaxLabel } from "~components/Form";
import {
  ScreenLoading,
  PrimaryButton,
  DangerButton,
  Screen,
  ScreenErrorFallback,
} from "~components/index";

import { SearchableTokenList, TokenTables } from "./components/Balances";

import { IconButton } from "~src/components/Icon";
import { TokenInputField } from "~src/components/TokenInputField";
import { formatAmount, approximateAmount } from "~src/lib/CurrencyUtils";
import { useSession } from "~src/lib/SessionProvider";
import { Token } from "~types/types";

export enum Direction {
  To,
  From,
}

const { Zero } = ethers.constants;

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

function TextInputToken({ direction }: { direction: Direction }): JSX.Element {
  const theme = useTamaguiTheme();
  const {
    toAmount,
    toToken,
    fromAmount,
    setFromAmount,
    fromToken,
    exceedsBalance,
  } = useSwapContext();

  if (direction === Direction.From) {
    return (
      <View style={{ height: 45 }}>
        <TokenInputField
          setValue={setFromAmount}
          value={fromAmount}
          decimals={fromToken?.decimals}
          style={{
            fontSize: 36,
            flex: 1,
            color: exceedsBalance
              ? theme.redText.val
              : theme.baseTextHighEmphasis.val,
          }}
        />
      </View>
    );
  }

  const value = formatAmount(toAmount, toToken?.decimals);

  return (
    <View style={{ height: 45 }}>
      <StyledText fontSize="$3xl" textOverflow="ellipsis">
        {value.toString()}
      </StyledText>
    </View>
  );
}

function InputTokenSelectorButton({ onPress }) {
  const { fromToken } = useSwapContext();
  return (
    <TokenSelectorButton
      token={fromToken!}
      direction={Direction.From}
      onPress={onPress}
    />
  );
}

function OutputTokenSelectorButton({ onPress }) {
  const { toToken } = useSwapContext();
  return (
    <TokenSelectorButton
      token={toToken!}
      direction={Direction.To}
      onPress={onPress}
    />
  );
}

function TokenSelectorButton({
  token,
  direction,
  onPress,
}: {
  token: TokenData;
  direction: Direction;
  onPress: (direction: Direction) => void;
}): JSX.Element {
  return (
    <Pressable onPress={() => onPress(direction)}>
      <XStack
        bg="$card"
        ai="center"
        borderRadius={12}
        px={12}
        py={8}
        borderColor="$baseBackgroundL1"
        borderWidth={1}
      >
        <ProxyImage src={token?.logo} size={24} style={{ borderRadius: 12 }} />
        <StyledText ml={8} mr={-4}>
          {token?.ticker}
        </StyledText>
        <IconKeyboardArrowRight size={24} />
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
  hasError,
}: {
  children: React.ReactNode;
  hasError?: boolean;
}): JSX.Element {
  return (
    <Stack
      jc="center"
      bg="$card"
      borderRadius={16}
      p={16}
      borderWidth={1}
      borderColor={hasError ? "$redBorder" : "$borderFull"}
    >
      {children}
    </Stack>
  );
}

function CurrencyInputBox({
  children,
  direction,
}: {
  children: React.ReactNode;
  direction: Direction;
}): JSX.Element {
  const { exceedsBalance, isLoadingRoutes, isLoadingTransactions } =
    useSwapContext();

  const isLoading = isLoadingTransactions || isLoadingRoutes;
  return (
    <BoxContainer
      hasError={direction === Direction.From ? exceedsBalance : false}
    >
      <XStack ai="center" jc="space-between">
        <YStack f={1} pr={16} opacity={isLoading ? 0.4 : 1}>
          <StyledText mb={4} fontSize="$xs" color="$baseTextMedEmphasis">
            {direction === Direction.From ? "You pay" : "You receive"}
          </StyledText>
          <TextInputToken direction={direction} />
          <StyledText fontSize="$xs" color="$redText">
            {direction === Direction.From && exceedsBalance
              ? "Insufficient balance"
              : ""}
          </StyledText>
        </YStack>
        <YStack>{children}</YStack>
      </XStack>
    </BoxContainer>
  );
}

function SwapForm({ navigation }) {
  const { swapToFromMints, canSwitch } = useSwapContext();

  const handleChangeToken = (direction: Direction) => {
    Keyboard.dismiss();
    navigation.push("SwapTokenList", { direction });
  };

  const onPressSwitchTokens = () => {
    Keyboard.dismiss();
    swapToFromMints();
  };

  return (
    <YStack space={3}>
      <CurrencyInputBox direction={Direction.From}>
        <YStack space={4}>
          <InputTokenSelectorButton onPress={handleChangeToken} />
          <InputMaxTokenButton />
        </YStack>
      </CurrencyInputBox>
      <SwitchTokensButton disabled={!canSwitch} onPress={onPressSwitchTokens} />
      <CurrencyInputBox direction={Direction.To}>
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

  const toDisplayValue = formatAmount(toAmount, toToken?.decimals);
  const fromDisplayValue = formatAmount(fromAmount, fromToken?.decimals);

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

function ConfirmSwapButton({ onPress }: { onPress: () => void }): JSX.Element {
  const {
    toAmount,
    toMint,
    fromAmount,
    fromMint,
    isJupiterError,
    exceedsBalance,
    feeExceedsBalance,
    isLoadingRoutes,
    isLoadingTransactions,
  } = useSwapContext();
  const tokenAccounts = useJupiterOutputTokens(fromMint);

  // Parameters aren't all entered or the swap data is loading
  const isIncomplete =
    !fromAmount || !toAmount || isLoadingRoutes || isLoadingTransactions;

  if (fromMint === toMint) {
    return <DangerButton label="Invalid swap" disabled />;
  } else if (exceedsBalance) {
    return <DangerButton label="Insufficient balance" disabled />;
  } else if (feeExceedsBalance && !isIncomplete) {
    return <DangerButton label="Insufficient balance for fee" disabled />;
  } else if (isJupiterError || tokenAccounts.length === 0) {
    return <DangerButton label="Swaps unavailable" disabled />;
  }

  let label;
  if (fromMint === SOL_NATIVE_MINT && toMint === WSOL_MINT) {
    label = "Wrap";
  } else if (fromMint === WSOL_MINT && toMint === SOL_NATIVE_MINT) {
    label = "Unwrap";
  } else {
    label = "Review";
  }

  return (
    <PrimaryButton label={label} disabled={isIncomplete} onPress={onPress} />
  );
}

export function SwapTokenListScreen({ navigation, route }): JSX.Element {
  const { direction } = route.params;
  const { activeWallet } = useSession();
  const { setFromMint, setToMint, fromToken } = useSwapContext();
  const [_inputText, setInputText] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [_isPending, startTransition] = useTransition();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: "Search for tokens",
        onChangeText: (event) => {
          const text = event.nativeEvent.text.toLowerCase();
          setInputText(text);
          startTransition(() => {
            setSearchFilter(text);
          });
        },
      },
    });
  }, [navigation]);

  return (
    <SearchableTokenList
      style={{ flex: 1, paddingTop: 16, paddingHorizontal: 12 }}
      contentContainerStyle={{ paddingBottom: 64 }}
      searchFilter={searchFilter}
      publicKey={activeWallet!.publicKey}
      blockchain={activeWallet!.blockchain as Blockchain}
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
      onPressRow={(_b: Blockchain, token: Token) => {
        const handler = direction === Direction.From ? setFromMint : setToMint;
        handler(token.mint!);
        navigation.goBack();
      }}
    />
  );
}

function Container({ navigation }) {
  return (
    <Screen>
      <YStack space={6} f={1} jc="space-between">
        <YStack space={6}>
          <SwapForm navigation={navigation} />
          <SwapInfo />
        </YStack>
        <ConfirmSwapButton
          onPress={() => {
            navigation.push("SwapTokenConfirm");
          }}
        />
      </YStack>
    </Screen>
  );
}

export function SwapTokenScreen({ navigation, route }): JSX.Element {
  return (
    <ErrorBoundary FallbackComponent={ScreenErrorFallback}>
      <Suspense fallback={<ScreenLoading />}>
        <Container navigation={navigation} route={route} />
      </Suspense>
    </ErrorBoundary>
  );
}
