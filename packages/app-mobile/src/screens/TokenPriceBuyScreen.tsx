import { Suspense, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Button,
  TextInput,
  Pressable,
} from "react-native";

import {
  PrimaryButton,
  StyledText,
  XStack,
  YStack,
  Stack,
  YGroup,
  ListItemSettings,
  Separator,
  ListItem,
  _ListItemOneLine,
} from "@coral-xyz/tamagui";
import { ErrorBoundary } from "react-error-boundary";

import { IconConvert } from "~components/Icon";
import { Screen, ScreenError, ScreenLoading } from "~components/index";
import { TokenPriceBuyScreenParams } from "~navigation/types";

// TODO(peter) remove
import data from "./TokenPriceListData.json";
type TokenResult = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_24h: number;
  market_cap: number;
  total_volume: number;
  circulating_supply: number;
  ath: number;
};

function ConvertButton({
  tokenAmount,
  currency,
  baseCurrency,
  baseCurrencySymbol,
  onPressConvert,
}: {
  tokenAmount: string;
  currency: string;
  onPressConvert: () => void;
  baseCurrencySymbol: string;
  baseCurrency: string;
}): JSX.Element {
  return (
    <Pressable onPress={onPressConvert}>
      <XStack>
        <StyledText color="$accentBlue" fontSize="$lg">
          {currency === baseCurrency ? baseCurrencySymbol : ""}
          {tokenAmount} {currency.toUpperCase()}
        </StyledText>
        <IconConvert size="$xl" color="$accentBlue" />
      </XStack>
    </Pressable>
  );
}

function TokenPicker({ onPressChangeToken, symbol }) {
  return (
    <Pressable onPress={onPressChangeToken}>
      <XStack space={8} ai="center">
        <StyledText fontSize="$3xl" color="$primaryText" fontWeight="600">
          {symbol.toUpperCase()}
        </StyledText>
      </XStack>
    </Pressable>
  );
}

const convertFromUsd = (usdAmount, tokenPrice) =>
  Number(usdAmount) / tokenPrice;
const convertToUsd = (tokenAmount, tokenPrice) =>
  Number(tokenAmount) * tokenPrice;

function MaxButton({ onPress, maxAmount }): JSX.Element {
  return (
    <Pressable onPress={onPress}>
      <Stack
        borderRadius={12}
        borderWidth={1}
        borderColor="$borderColor"
        bg="$card"
        px={12}
        py={8}
      >
        <StyledText color="$fontColor">Max: ${maxAmount}</StyledText>
      </Stack>
    </Pressable>
  );
}

function PaymentToFrom() {
  return (
    <YGroup
      width="100%"
      overflow="hidden"
      borderWidth={2}
      borderColor="$borderFull"
      borderRadius={0}
      separator={<Separator />}
    >
      <YGroup.Item>
        <_ListItemOneLine
          title="Pay with"
          icon={<IconConvert />}
          rightText="Wallet 1 (USDC)"
          iconAfter={<IconConvert />}
        />
      </YGroup.Item>
      <YGroup.Item>
        <ListItemSettings title="Deposit to" iconName="account-circle" />
      </YGroup.Item>
    </YGroup>
  );
}

function Buy({ tokenPrice, tokenSymbol, baseCurrency, baseCurrencySymbol }) {
  const [priceInput, setPriceInput] = useState({
    currency: tokenSymbol,
    amount: "0",
  });

  const handleChangeToUsd = () => {
    setPriceInput({
      currency: baseCurrency,
      amount: convertToUsd(priceInput.amount, tokenPrice),
    });
  };

  const handleChangeFromUsd = () => {
    setPriceInput({
      currency: tokenSymbol,
      amount: convertFromUsd(priceInput.amount, tokenPrice),
    });
  };

  const handlePressChangeToken = () => {
    console.log("open modal");
  };

  const onPressMaxAmount = () => {
    console.log("press max");
  };

  const handlePressReview = () => {
    console.log("review");
  };

  const isDisabled = false;

  return (
    <YStack ai="center">
      <XStack ai="center" space={8} mb={12}>
        <TextInput
          placeholder="0"
          style={{ fontSize: 28 }}
          value={priceInput.amount}
          onChangeText={(amount) => {
            setPriceInput({ ...priceInput, amount });
          }}
        />
        <TokenPicker
          symbol={tokenSymbol}
          onPressChangeToken={handlePressChangeToken}
        />
      </XStack>
      <ConvertButton
        baseCurrency={baseCurrency}
        baseCurrencySymbol={baseCurrencySymbol}
        tokenAmount={priceInput.amount}
        tokenPrice={tokenPrice}
        currency={priceInput.currency}
        onPressConvert={() => {
          if (priceInput.currency === baseCurrency) {
            handleChangeFromUsd();
          } else {
            handleChangeToUsd();
          }
        }}
      />
      <MaxButton maxAmount="0.25 BTC" onPress={onPressMaxAmount} />
      <PaymentToFrom />
      <PrimaryButton
        label="Review"
        onPress={handlePressReview}
        disabled={isDisabled}
      />
    </YStack>
  );
}

function Container({ route }: TokenPriceBuyScreenParams): JSX.Element {
  const { tokenId } = route.params;

  // TODO(peter) graphql query when the time comes
  const token = data.find((item) => item.id === tokenId) as TokenResult;

  return (
    <ScrollView>
      <Screen style={{ paddingTop: 0, paddingHorizontal: 0 }}>
        <Buy
          tokenPrice={token.current_price}
          tokenSymbol={token.symbol}
          baseCurrency="usd"
          baseCurrencySymbol="$"
        />
      </Screen>
    </ScrollView>
  );
}

export function TokenPriceBuyScreen({
  navigation,
  route,
}: TokenPriceBuyScreenParams): JSX.Element {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <ScreenError error={error} />}
    >
      <Suspense fallback={<ScreenLoading />}>
        <Button
          title="Swap"
          onPress={() => {
            navigation.push("TokenPriceSwap", { tokenId: 1 });
          }}
        />
        <Container route={route} navigation={navigation} />
      </Suspense>
    </ErrorBoundary>
  );
}
