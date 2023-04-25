import { useState } from "react";
import {
  Alert,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import * as Linking from "expo-linking";

import {
  UNKNOWN_NFT_ICON_SRC,
  toTitleCase,
  explorerNftUrl,
} from "@coral-xyz/common";
import {
  useAnchorContext,
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
} from "~components/index";
import { useTheme } from "~hooks/useTheme";

import { SendTokenSelectUserScreen } from "./SendTokenScreen2";

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

  const nft = (state === "hasValue" && contents) || {
    imageUrl: "",
    description: "",
    attributes: [],
  };

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
        {(nft.attributes ?? []).length > 0 ? (
          <NftAttributes attributes={nft.attributes} />
        ) : null}
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
  const [address, setAddress] = useState<string>("");
  const { provider: solanaProvider } = useAnchorContext();
  const ethereumCtx = useEthereumCtx();

  const {
    isValidAddress,
    _isErrorAddress,
    normalizedAddress: destinationAddress,
  } = useIsValidAddress(
    nft.blockchain,
    address,
    solanaProvider.connection,
    ethereumCtx.provider
  );

  const hasInputError = !isValidAddress && address.length > 15;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Screen style={{ paddingHorizontal: 12, paddingVertical: 16 }}>
        <SendTokenSelectUserScreen
          blockchain={nft.blockchain}
          token={nft.token}
          inputContent={address}
          setInputContent={setAddress}
          hasInputError={hasInputError}
          onSelectUserResult={({ user, address }) => {
            if (!address) {
              return;
            }

            navigation.navigate("SendNFTConfirm", {
              nft,
              to: {
                address,
                username: user.username,
                walletName: user.walletName,
                image: user.image,
                uuid: user.uuid,
              },
            });
          }}
          onPressNext={({ user }) => {
            navigation.navigate("SendNFTConfirm", {
              nft,
              to: {
                address: destinationAddress,
                username: user?.username,
                image: user?.image,
                uuid: user?.uuid,
              },
            });
          }}
        />
      </Screen>
    </KeyboardAvoidingView>
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
