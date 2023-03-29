import { useEffect, useState } from "react";
import { Alert, Text, View, ScrollView } from "react-native";

import * as Linking from "expo-linking";

import {
  UNKNOWN_NFT_ICON_SRC,
  toTitleCase,
  UI_RPC_METHOD_NAVIGATION_TO_ROOT,
  explorerNftUrl,
} from "@coral-xyz/common";
import {
  useAnchorContext,
  useBackgroundClient,
  useEthereumCtx,
  nftById,
  useIsValidAddress,
  useEthereumExplorer,
  useSolanaExplorer,
} from "@coral-xyz/recoil";
import { Box } from "@coral-xyz/tamagui";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { useRecoilValueLoadable } from "recoil";

import {
  PrimaryButton,
  ProxyImage,
  Screen,
  SecondaryButton,
  StyledTextInput,
  Margin,
} from "~components/index";
import { useTheme } from "~hooks/useTheme";

function ActionMenu({ explorer, connectionUrl, nft }) {
  const { showActionSheetWithOptions } = useActionSheet();

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

  return <SecondaryButton label="Options" onPress={onPress} />;
}

export function NftDetailScreen({ navigation, route }): JSX.Element | null {
  const ethExpl = useEthereumExplorer();
  const solExpl = useSolanaExplorer();

  const { nftId, publicKey, connectionUrl } = route.params;
  const { contents, state } = useRecoilValueLoadable(
    nftById({ publicKey, connectionUrl, nftId })
  );

  const nft = (state === "hasValue" && contents) || null;

  if (!nftId) {
    return null;
  }

  // TODO: this is hit when the NFT has been transferred out and
  //       the user re-opens the app to the old url which is no longer
  //       valid.
  //
  //       Should probably just pop the stack here or redirect.
  if (!nft) {
    return null;
  }

  // @ts-ignore
  const isEthereum: boolean = nft && nft.contractAddress;
  const explorer = isEthereum ? ethExpl : solExpl;

  return (
    <ScrollView>
      <Screen>
        <NftImage imageUrl={nft.imageUrl} />
        <Description description={nft.description} />
        <Box my={12}>
          <PrimaryButton
            label="Send"
            onPress={() => {
              navigation.push("SendNFT", { nft });
            }}
          />
        </Box>
        {nft.attributes ? <NftAttributes attributes={nft.attributes} /> : null}
        <ActionMenu
          nft={nft}
          explorer={explorer}
          connectionUrl={connectionUrl}
        />
      </Screen>
    </ScrollView>
  );
}

function NftImage({ imageUrl }: { imageUrl: string }): JSX.Element {
  return (
    <ProxyImage
      style={{
        width: "100%",
        borderRadius: 8,
        aspectRatio: 1,
      }}
      src={imageUrl ?? UNKNOWN_NFT_ICON_SRC}
    />
  );
}

function Description({ description }: { description: string }): JSX.Element {
  const theme = useTheme();

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

export function NftDetailSendScreen({ navigation, route }): JSX.Element {
  const { nft } = route.params;
  const background = useBackgroundClient();
  const { provider: solanaProvider } = useAnchorContext();
  const ethereumCtx = useEthereumCtx();
  const [destinationAddress, setDestinationAddress] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [wasSent, setWasSent] = useState(false);

  const {
    isValidAddress,
    isErrorAddress,
    isFreshAddress: _,
  } = useIsValidAddress(
    nft.blockchain,
    destinationAddress,
    solanaProvider.connection,
    ethereumCtx.provider
  );

  useEffect(() => {
    (async () => {
      // If the modal is being closed and the NFT has been sent elsewhere then
      // navigate back to the nav root because the send screen is no longer
      // valid as the wallet no longer possesses the NFT.
      if (!openConfirm && wasSent) {
        await background.request({
          method: UI_RPC_METHOD_NAVIGATION_TO_ROOT,
          params: [],
        });
      }
    })();
  }, [openConfirm, wasSent, background]);

  return (
    <View
      style={{
        paddingLeft: 16,
        paddingRight: 16,
      }}
    >
      <View
        style={{
          justifyContent: "space-between",
        }}
      >
        <View>
          <NftImage imageUrl={nft.imageUrl} />
          <StyledTextInput
            autoFocus
            placeholder={`Recipient's ${toTitleCase(nft.blockchain)} Address`}
            value={destinationAddress}
            //   setValue={(e) => setDestinationAddress(e.target.value)}
            //   error={isErrorAddress}
            //   inputProps={{
            //     name: "to",
            //   }}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingTop: 18,
            paddingBottom: 16,
          }}
        >
          <SecondaryButton
            style={{
              marginRight: 8,
            }}
            onPress={close}
            label="Cancel"
          />
          <PrimaryButton
            disabled={!isValidAddress}
            onPress={() => setOpenConfirm(true)}
            label="Next"
          />
        </View>
      </View>
    </View>
  );
}

type Attribute = {
  traitType: string;
  value: string;
};

function NftAttributes({
  attributes,
}: {
  attributes: Attribute[];
}): JSX.Element {
  const theme = useTheme();

  return (
    <View>
      <Text style={{ color: theme.custom.colors.secondary }}>Attributes</Text>
      <View
        style={{
          marginBottom: 24,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            marginTop: 4,
            marginLeft: -4,
            marginRight: -4,
          }}
        >
          {attributes.map((attr: Attribute) => {
            return (
              <View
                key={attr.traitType}
                style={{
                  padding: 4,
                }}
              >
                <View
                  style={{
                    borderRadius: 8,
                    backgroundColor: theme.custom.colors.nav,
                    paddingTop: 4,
                    paddingBottom: 4,
                    paddingLeft: 8,
                    paddingRight: 8,
                  }}
                >
                  <Text
                    style={{
                      color: theme.custom.colors.secondary,
                      fontSize: 14,
                    }}
                  >
                    {toTitleCase(attr.traitType)}
                  </Text>
                  <Text
                    style={{
                      color: theme.custom.colors.fontColor,
                      fontSize: 16,
                    }}
                  >
                    {attr.value}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
