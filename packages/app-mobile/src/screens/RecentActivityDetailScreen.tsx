import type { RecentActivityDetailScreenProps } from "~src/navigation/WalletsNavigator";

import { Suspense } from "react";
import { Alert } from "react-native";

import { useFragment } from "@apollo/client";
import { formatWalletAddress } from "@coral-xyz/common";
import { Separator, YGroup } from "@coral-xyz/tamagui";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ErrorBoundary } from "react-error-boundary";

import { Screen } from "~components/index";

import { ScreenError, ScreenLoading } from "~src/components";
import { ListItemLabelValue } from "~src/components/ListItem";
import { TransactionFragment } from "~src/graphql/fragments";

function Container({
  navigation,
  route,
}: RecentActivityDetailScreenProps): JSX.Element {
  const { data } = useFragment({
    fragment: TransactionFragment,
    fragmentName: "TransactionFragment",
    from: {
      __typename: "Transaction",
      id: route.params.id,
    },
  });

  const date = new Date(data.timestamp);
  const formattedDate = `${date.toLocaleString("default", {
    month: "long",
  })} ${date.getDate()}, ${date.getFullYear()}`;

  return (
    <Screen>
      <YGroup
        overflow="hidden"
        borderWidth={2}
        borderColor="$borderFull"
        borderRadius="$container"
        backgroundColor="$nav"
        separator={<Separator />}
      >
        <YGroup.Item>
          <ListItemLabelValue label="Date" value={formattedDate} />
        </YGroup.Item>
        <YGroup.Item>
          <ListItemLabelValue label="Type" value={data.type} />
        </YGroup.Item>
        <YGroup.Item>
          <ListItemLabelValue label="Source" value={data.source ?? "Unknown"} />
        </YGroup.Item>
        <YGroup.Item>
          <ListItemLabelValue label="Network Fee" value="0.0000005 SOL" />
        </YGroup.Item>
        <YGroup.Item>
          <ListItemLabelValue
            label="Status"
            value={data.error ? "Failed" : "Success"}
            valueColor={data.error ? "$redText" : "$greenText"}
          />
        </YGroup.Item>
        <YGroup.Item>
          <ListItemLabelValue
            label="Signature"
            value={data.hash ? formatWalletAddress(data.hash) : "Unknown"}
            valueColor="$blue800"
            iconAfter={<MaterialIcons name="keyboard-arrow-right" size={24} />}
            onPress={() => {
              Alert.alert("open explorer");
            }}
          />
        </YGroup.Item>
      </YGroup>
    </Screen>
  );
}

export function RecentActivityDetailScreen({
  navigation,
  route,
}: RecentActivityDetailScreenProps): JSX.Element {
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
