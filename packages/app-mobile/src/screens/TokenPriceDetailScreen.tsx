import { Suspense, useTransition, useState } from "react";
import { View, Button, ScrollView } from "react-native";

import { Image } from "expo-image";

import { formatUsd } from "@coral-xyz/common";
import {
  Stack,
  YStack,
  StyledText,
  Separator,
  XStack,
  YGroup,
  ListItemLabelValue,
  ProxyImage,
  RoundedContainerGroup,
} from "@coral-xyz/tamagui";
import { ErrorBoundary } from "react-error-boundary";

import { PercentChangePill } from "~components/Pill";
import { Screen, ScreenError, ScreenLoading } from "~components/index";
import { TokenPriceDetailScreenParams } from "~navigation/types";

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
interface TokenOverviewHeaderStripProps {
  imageUrl: string;
  symbol: string;
  price: number;
  percentChange: number;
}

function formatDecimals(value: number, decimals: number) {
  return value.toFixed(decimals);
}

function TokenOverviewHeaderStrip({
  imageUrl,
  symbol,
  price,
  percentChange,
}: TokenOverviewHeaderStripProps) {
  // get chart data here somewhere
  const textColor = percentChange > 0 ? "$greenText" : "$redText";
  return (
    <XStack ai="center" bg="white" borderWidth={2} borderColor="$borderFull">
      <XStack ai="center" px={24} py={12}>
        <Image source={{ uri: imageUrl }} style={{ width: 20, height: 20 }} />
        <StyledText ml={8}>{symbol}</StyledText>
      </XStack>
      <Separator alignSelf="stretch" vertical my={12} mx={12} />
      <XStack ai="center">
        <StyledText>{formatUsd(price)}</StyledText>
        <StyledText color={textColor} ml={8}>
          {formatDecimals(percentChange, 2)}%
        </StyledText>
      </XStack>
    </XStack>
  );
}

function BalanceSummaryWidget() {
  const percentChange = -0.23;
  const totalBalance = "$5,765,838.40";
  const totalBalanceChange = "-$1,237.86";

  const textColor = percentChange > 0 ? "$greenText" : "$redText";

  return (
    <YStack ai="center">
      <StyledText fontSize="$3xl">{totalBalance}</StyledText>
      <XStack ai="center">
        <StyledText mr={8} fontSize="$lg" color={textColor}>
          {totalBalanceChange}
        </StyledText>
        <PercentChangePill percentChange={percentChange} />
      </XStack>
    </YStack>
  );
}

const TransferWidget = () => {
  return (
    <XStack ai="center" jc="center" space={8}>
      <Button title="Buy" />
      <Button title="Sell" />
      <Button title="Swap" />
    </XStack>
  );
};

type TokenSummaryTableProps = {
  marketCap: number;
  volume: number;
  circulatingSupply: number;
  ath: number;
};

function TokenSummaryTable({
  marketCap,
  volume,
  circulatingSupply,
  ath,
}: TokenSummaryTableProps) {
  return (
    <YGroup
      overflow="hidden"
      borderWidth={2}
      borderColor="$borderFull"
      borderRadius="$container"
      backgroundColor="$nav"
      separator={<Separator />}
    >
      <YGroup.Item>
        <ListItemLabelValue label="Market cap" value={formatUsd(marketCap)} />
      </YGroup.Item>
      <YGroup.Item>
        <ListItemLabelValue label="Total Volume" value={formatUsd(volume)} />
      </YGroup.Item>
      <YGroup.Item>
        <ListItemLabelValue
          label="Circulating Supply"
          value={circulatingSupply.toLocaleString("en-US")}
        />
      </YGroup.Item>
      <YGroup.Item>
        <ListItemLabelValue label="All Time High" value={formatUsd(ath)} />
      </YGroup.Item>
    </YGroup>
  );
}

function TabViewHoldings() {
  return <View style={{ height: 200 }} />;
}

function TabViewActivity() {
  return <View style={{ height: 200 }} />;
}

function TabContainer() {
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState("holdings");

  function selectTab(nextTab: string) {
    startTransition(() => {
      setTab(nextTab);
    });
  }

  return (
    <RoundedContainerGroup>
      <Stack bg="white">
        <XStack ai="center">
          <Button title="Holdings" onPress={() => selectTab("holdings")} />
          <Button title="Activity" onPress={() => selectTab("activity")} />
        </XStack>
        <Separator />
        <Stack>
          {tab === "holdings" ? <TabViewHoldings /> : null}
          {tab === "activity" ? <TabViewActivity /> : null}
        </Stack>
      </Stack>
    </RoundedContainerGroup>
  );
}

function Container({ route }: TokenPriceDetailScreenParams): JSX.Element {
  const { tokenId } = route.params;
  // TODO(peter) graphql query when the time comes
  const token = data.find((item) => item.id === tokenId) as TokenResult;

  if (!token) {
    return (
      <Screen style={{ alignItems: "center" }}>
        <StyledText>Token not found</StyledText>
      </Screen>
    );
  }

  return (
    <ScrollView>
      <Screen style={{ paddingTop: 0, paddingHorizontal: 0 }}>
        <TokenOverviewHeaderStrip
          imageUrl={token.image}
          symbol={token.symbol}
          price={token.current_price}
          percentChange={token?.price_change_percentage_24h}
        />
        <ProxyImage
          size={64}
          src={token.image}
          style={{
            marginVertical: 16,
            alignSelf: "center",
          }}
        />
        <BalanceSummaryWidget />
        <TransferWidget />
        <TokenSummaryTable
          marketCap={token.market_cap}
          volume={token.total_volume}
          circulatingSupply={token.circulating_supply}
          ath={token.ath}
        />
        <TabContainer />
      </Screen>
    </ScrollView>
  );
}

export function TokenPriceDetailScreen({
  navigation,
  route,
}: TokenPriceDetailScreenParams): JSX.Element {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <ScreenError error={error} />}
    >
      <Suspense fallback={<ScreenLoading />}>
        <Container route={route} navigation={navigation} />
      </Suspense>
    </ErrorBoundary>
  );
}
