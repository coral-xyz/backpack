import { Suspense, useEffect } from "react";
import { Alert, View, Text, ScrollView } from "react-native";

import * as Linking from "expo-linking";

import { useFragment } from "@apollo/client";
import { Blockchain, explorerNftUrl } from "@coral-xyz/common";
import {
  useEthereumExplorer,
  useSolanaExplorer,
  useBlockchainConnectionUrl,
} from "@coral-xyz/recoil";
import { YStack } from "@coral-xyz/tamagui";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { ErrorBoundary } from "react-error-boundary";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CollectionAttributes } from "~components/CollectionAttributesList";
import { ProxyNFTImage } from "~components/CollectionListItem";
import { PrimaryButton, Screen, FullScreenLoading } from "~components/index";
import { useTheme } from "~hooks/useTheme";
import { WINDOW_WIDTH } from "~lib/index";
import { HeaderButton, HeaderButtonSpacer } from "~navigation/components";

import { NftNodeFragment } from "~src/graphql/fragments";
import { CollectionItemDetailScreenProps } from "~src/navigation/WalletsNavigator";

function ActionMenu({
  blockchain,
  nft,
  ...rest
}: {
  blockchain: Blockchain;
  nft: any;
}) {
  const connectionUrl = useBlockchainConnectionUrl(blockchain);
  const ethExpl = useEthereumExplorer();
  const solExpl = useSolanaExplorer();

  const { showActionSheetWithOptions } = useActionSheet();

  // @ts-ignore
  const isEthereum: boolean = nft && nft.contractAddress;
  const explorer = isEthereum ? ethExpl : solExpl;

  const viewExplorerUrl = () => {
    try {
      const url = explorerNftUrl(explorer, nft, connectionUrl);
      Linking.openURL(url);
    } catch (error) {
      console.error("viewExplorerUrl:error", error);
      Alert.alert("Something went wrong", "Invalid URL");
    }
  };

  const onPress = () => {
    const options = ["View on Explorer", "Cancel"];
    const cancelButtonIndex = 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (selectedIndex: number) => {
        switch (selectedIndex) {
          case 0: {
            viewExplorerUrl();
            break;
          }

          case cancelButtonIndex:
          // Canceled
        }
      }
    );
  };

  return (
    <HeaderButtonSpacer>
      <HeaderButton
        {...rest}
        disabled={!nft.name}
        name="menu"
        onPress={onPress}
      />
    </HeaderButtonSpacer>
  );
}

function Description({
  description,
}: {
  description: string | undefined | null;
}) {
  const theme = useTheme();
  if (!description || description === "") {
    return null;
  }

  return (
    <View
      style={{
        marginTop: 20,
      }}
    >
      <Text
        style={{
          color: theme.custom.colors.secondary,
          fontWeight: "500",
          fontSize: 16,
          lineHeight: 24,
          marginBottom: 4,
        }}
      >
        Description
      </Text>
      <Text
        style={{
          color: theme.custom.colors.fontColor,
          fontWeight: "500",
          fontSize: 16,
        }}
      >
        {description}
      </Text>
    </View>
  );
}

function Container({
  navigation,
  route,
}: CollectionItemDetailScreenProps): JSX.Element {
  const { showActionSheetWithOptions } = useActionSheet();

  const insets = useSafeAreaInsets();
  const { blockchain } = route.params;
  const { data: nft } = useFragment({
    fragment: NftNodeFragment,
    fragmentName: "NftNodeFragment",
    from: {
      __typename: "Nft",
      id: route.params.id,
    },
  });

  useEffect(() => {
    navigation.setOptions({
      headerRight: (props) => (
        <ActionMenu {...props} nft={nft} blockchain={blockchain} />
      ),
    });
  }, [navigation, showActionSheetWithOptions, blockchain, nft]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom }}
    >
      <Screen>
        <YStack space={16}>
          <ProxyNFTImage
            src={nft.image}
            size={WINDOW_WIDTH}
            style={{ borderRadius: 8, maxWidth: "100%" }}
          />
          <Description description={nft.description} />
          <CollectionAttributes attributes={nft.attributes} />
          <PrimaryButton
            label="Send"
            onPress={() => {
              navigation.navigate("SendCollectibleSelectRecipient", {
                nft: {
                  name: nft.name ?? "NFT",
                },
              });
            }}
          />
        </YStack>
      </Screen>
    </ScrollView>
  );
}

export function CollectionItemDetailScreen({
  navigation,
  route,
}: CollectionItemDetailScreenProps): JSX.Element {
  return (
    <ErrorBoundary fallbackRender={({ error }) => <Text>{error.message}</Text>}>
      <Suspense fallback={<FullScreenLoading />}>
        <Container navigation={navigation} route={route} />
      </Suspense>
    </ErrorBoundary>
  );
}
