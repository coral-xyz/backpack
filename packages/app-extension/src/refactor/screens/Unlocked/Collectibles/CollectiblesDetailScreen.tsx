import { useCallback, useLayoutEffect, useState } from "react";
import {
  externalResourceUri,
  LOCKABLE_COLLECTIONS,
  proxyImageUrl,
  toDisplayBalance,
  toTitleCase,
  UNKNOWN_NFT_ICON_SRC,
} from "@coral-xyz/common";
import { LockCollectionToggle } from "@coral-xyz/data-components";
import type { CollectibleDetailsProps } from "@coral-xyz/data-components/src/components/Collectibles/CollectibleDetails";
import { useTranslation } from "@coral-xyz/i18n";
import {
  useActiveWallet,
  useAppStoreMetaLoadable,
  useCollectibleXnftLoadable,
  useOpenPlugin,
  useTensorMintData,
} from "@coral-xyz/recoil";
import type { TensorMintDataType } from "@coral-xyz/secure-clients/types";
import {
  Button,
  Image,
  PrimaryButton,
  ProxyImage,
  SecondaryButton,
  Stack,
  StyledText,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";
import { useNavigation } from "@react-navigation/native";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import { ScreenContainer } from "../../../components/ScreenContainer";
import { Routes as SendCollectibleRoutes } from "../../../navigation/SendCollectibleNavigator";
import { Routes as TensorRoutes } from "../../../navigation/TensorNavigator";
import {
  type CollectiblesDetailScreenProps,
  Routes as WalletsRoutes,
} from "../../../navigation/WalletsNavigator";

export function CollectiblesDetailScreen(props: CollectiblesDetailScreenProps) {
  return (
    <ScreenContainer loading={<Loading />}>
      <Container {...props} />
    </ScreenContainer>
  );
}

function Loading() {
  // TODO.
  return null;
}

function Container({ route }: CollectiblesDetailScreenProps) {
  const navigation = useNavigation<any>();
  const { data } = route.params;

  const onSend = () => {
    navigation.push(WalletsRoutes.SendCollectibleNavigator, {
      screen: SendCollectibleRoutes.SendCollectibleAddressSelectScreen,
      params: {
        nftId: data.id,
      },
    });
  };

  return <CollectibleDetails data={data} onSend={onSend} />;
}

function CollectibleDetails({
  data,
  onSend,
}: Omit<CollectibleDetailsProps, "loaderComponent">) {
  const size = 340;
  const navigation = useNavigation<any>();
  const [height, setHeight] = useState(size);
  const { t } = useTranslation();
  const { blockchain, publicKey } = useActiveWallet();
  const [tensorMintData, refreshTensorMintData] = useTensorMintData(
    data.address,
    publicKey,
    blockchain
  );
  const edit = tensorMintData?.activeListing?.type === "tlisting";
  const hasActiveListing = tensorMintData?.activeListing;
  const activeListingPrice = tensorMintData?.activeListing?.listPrice
    ? (tensorMintData?.activeListing?.listPrice / LAMPORTS_PER_SOL).toString()
    : undefined;

  const openListFlow = useCallback(
    (price?: string) => {
      navigation.push(WalletsRoutes.TensorNavigator, {
        screen: TensorRoutes.TensorCollectibleListScreen,
        params: {
          nft: data,
          price: price ?? activeListingPrice,
          edit: hasActiveListing,
          ctx: { publicKey, blockchain },
        },
      });
    },
    [
      navigation,
      data,
      activeListingPrice,
      hasActiveListing,
      publicKey,
      blockchain,
    ]
  );

  const openSellFlow = useCallback(
    (price: string) => {
      navigation.navigate(WalletsRoutes.TensorNavigator, {
        screen: TensorRoutes.TensorCollectibleActionScreen,
        params: {
          ctx: { blockchain, publicKey },
          action: "sell",
          mint: data.address,
          nft: data,
          price,
          description: "Accepting offer on Tensor",
        },
      });
    },
    [navigation, data, publicKey, blockchain]
  );
  const imageSource =
    data.image && data.image !== ""
      ? proxyImageUrl(externalResourceUri(data.image), undefined, true)
      : UNKNOWN_NFT_ICON_SRC;

  /**
   * Component layout effect to fetch the dimensions of the image from the
   * parse source URI and set the adjusted image height if it is not a square NFT image.
   */
  useLayoutEffect(() => {
    Image.getSize(imageSource, (w, h) => {
      if (h !== w) {
        const ratio = size / w;
        setHeight(h * ratio);
      }
    });
  }, [imageSource, setHeight, size]);

  return (
    <YStack
      gap={20}
      marginHorizontal={16}
      marginTop={8}
      maxWidth="100%"
      overflow="hidden"
      paddingBottom={16}
    >
      <XStack
        alignItems="center"
        justifyContent="center"
        minHeight={height}
        width="100%"
      >
        <Image
          borderRadius={8}
          source={{ uri: imageSource, width: size }}
          minHeight={height}
          width="100%"
        />
      </XStack>
      {data.collection &&
      LOCKABLE_COLLECTIONS.includes(data.collection.address) ? (
        <LockCollectionToggle
          collectionAddress={data.collection.address}
          collectionName={data.collection.name ?? ""}
        />
      ) : null}
      <XStack flex={1} space="$4">
        {["tlisting", "tswap"].includes(
          tensorMintData?.activeListing?.type ?? ""
        ) ? (
          <YStack position="relative" flex={1} flexBasis={1} overflow="hidden">
            <SecondaryButton
              label={t("delist_nft")}
              onPress={() => {
                navigation.navigate(WalletsRoutes.TensorNavigator, {
                  screen: TensorRoutes.TensorCollectibleActionScreen,
                  params: {
                    ctx: { blockchain, publicKey },
                    action: "delist",
                    mint: data.address,
                    nft: data,
                    description: "Removing listing on Tensor",
                  },
                });
              }}
            />
          </YStack>
        ) : null}
        {!tensorMintData || tensorMintData?.activeListing === null ? (
          <YStack position="relative" flex={1} flexBasis={1} overflow="hidden">
            <SecondaryButton label={t("send")} onPress={() => onSend(data)} />
          </YStack>
        ) : null}
        {tensorMintData &&
        !edit &&
        (tensorMintData?.activeListing === null ||
          tensorMintData?.activeListing?.type === "tlisting") ? (
            <YStack position="relative" flex={1} flexBasis={1} overflow="hidden">
              <PrimaryButton
                label={edit ? t("list_nft_edit") : t("list_nft")}
                onPress={() => openListFlow(activeListingPrice)}
            />
            </YStack>
        ) : null}
      </XStack>
      <TensorPriceData
        openSellFlow={openSellFlow}
        tensorData={tensorMintData}
      />
      <CollectibleApplication
        collectionAddress={data.collection?.address}
        compressed={data.compressed}
        mint={data.address}
      />
      {data.description ? (
        <YStack gap="$2">
          <StyledText fontSize="$sm" color="$baseTextMedEmphasis">
            {t("description")}
          </StyledText>
          <StyledText>{data.description}</StyledText>
        </YStack>
      ) : null}
      {data.attributes ? (
        <CollectionAttributes
          openListFlow={openListFlow}
          attributes={data.attributes}
          attributeMeta={tensorMintData?.traits}
        />
      ) : null}
    </YStack>
  );
}

type CollectibleApplicationProps = {
  collectionAddress?: string;
  compressed?: boolean;
  mint: string;
};

function CollectibleApplication({
  collectionAddress,
  compressed,
  mint,
}: CollectibleApplicationProps) {
  // Attempt to fetch any existing xNFT that may be associated with the item.
  const { contents: xnftContents, state: xnftState } =
    useCollectibleXnftLoadable(
      !compressed ? { collection: collectionAddress, mint } : undefined
    );
  const xnft = (xnftState === "hasValue" && xnftContents) || null;

  // Attempt to fetch the html document meta tag values for the discovered xNFT
  const { contents: appStoreMetaContents, state: appStoreMetaState } =
    useAppStoreMetaLoadable(xnft ?? "");
  const appStoreData =
    (appStoreMetaState === "hasValue" && appStoreMetaContents) || null;

  const openPlugin = useOpenPlugin();

  const handleClick = () => {
    openPlugin(`${xnft}/${mint}`);
  };

  return xnft && appStoreData ? (
    <YStack space="$2" position="relative">
      <StyledText fontSize="$sm" color="$baseTextMedEmphasis" marginBottom={4}>
        Application
      </StyledText>
      <XStack
        alignItems="center"
        backgroundColor="$baseBackgroundL1"
        borderRadius={12}
        gap={12}
        padding={12}
        position="relative"
        width="100%"
      >
        <ProxyImage
          style={{ borderRadius: 8, height: 64, width: 64 }}
          size={64}
          src={appStoreData.image || UNKNOWN_NFT_ICON_SRC}
        />
        <YStack flex={1} overflow="hidden" maxWidth={170}>
          <StyledText>{appStoreData.name ?? "Unknown"}</StyledText>
          <StyledText
            color="$baseTextMedEmphasis"
            ellipsizeMode="tail"
            fontSize="$sm"
            maxWidth={100}
            numberOfLines={1}
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
          >
            {appStoreData.description ?? ""}
          </StyledText>
        </YStack>
        <Button
          padded
          hoverTheme
          backgroundColor="$baseBackgroundL2"
          color="$baseTextHighEmphasis"
          borderRadius={12}
          borderWidth={0}
          onPress={handleClick}
          paddingHorizontal={12}
          paddingVertical={18}
          fontWeight="500"
        >
          Open
        </Button>
      </XStack>
    </YStack>
  ) : null;
}

function TensorPriceData({
  tensorData,
  openSellFlow,
}: {
  openSellFlow: (price: string) => void;
  tensorData: TensorMintDataType | null;
}) {
  if (!tensorData) {
    return null;
  }

  const prices: {
    label: string;
    price: string;
    color?: string;
    action?: {
      label: string;
      action: () => void;
    };
  }[] = [];

  if (tensorData.activeListing) {
    prices.push({
      label: "Listed",
      color: "$greenText",
      price: tensorData.activeListing.listPriceStr,
    });
  }

  if (tensorData.highestBid) {
    prices.push({
      label: "Highest Offer",
      price: tensorData.highestBid.offerPriceStr,
      action: {
        label: "Accept Offer",
        action: () => {
          openSellFlow(tensorData.highestBid!.offerPriceStr);
        },
      },
    });
  }

  if (tensorData.floorPrice) {
    prices.push({
      label: "Floor Price",
      price: tensorData.floorPrice,
    });
  }

  return (
    <Stack flexDirection="row" flexWrap="wrap" gap={8}>
      {[...prices].map((price) => {
        return (
          <Stack
            minWidth="35%"
            borderRadius="$container"
            rowGap="$2"
            columnGap="$2"
            flex={1}
            key={price.label}
            cursor={price.action ? "pointer" : undefined}
            onPress={() => {
              price.action?.action();
            }}
          >
            <StyledText fontSize="$sm" color="$baseTextMedEmphasis">
              {toTitleCase(price.label)}
            </StyledText>
            <StyledText color={price.color}>{`◎ ${toDisplayBalance(
              price.price,
              9
            )}`}</StyledText>
            {price.action ? (
              <StyledText
                textAlign="left"
                fontSize="$xs"
                color="$accentBlue"
              >{`${price.action.label}`}</StyledText>
            ) : null}
          </Stack>
        );
      })}
    </Stack>
  );
}

export type Attribute = {
  trait: string;
  value: string;
  price?: number | undefined;
};

export function CollectionAttributes({
  attributes,
  attributeMeta,
  openListFlow,
}: {
  attributes: Attribute[] | null;
  attributeMeta?: TensorMintDataType["traits"];
  openListFlow?: (price?: string) => void;
}): JSX.Element | null {
  const { t } = useTranslation();
  if (!attributes || attributes?.length === 0) {
    return null;
  }

  return (
    <YStack>
      <StyledText mb={8} color="$baseTextMedEmphasis" fontSize="$sm">
        {t("attributes")}
      </StyledText>
      <XStack flexWrap="wrap" columnGap="$3" rowGap="$3">
        {attributes.map((attr: Attribute) => {
          const price = attributeMeta?.[attr.trait]?.[attr.value]?.p;

          return (
            <Stack
              bg="$baseBackgroundL1"
              px={12}
              py={8}
              minWidth="35%"
              borderRadius="$container"
              space={2}
              flex={1}
              flexBasis={1}
              key={attr.trait}
              cursor={price && openListFlow ? "pointer" : undefined}
              onPress={() => {
                if (price && openListFlow) {
                  openListFlow((price / LAMPORTS_PER_SOL).toString());
                }
              }}
            >
              <StyledText fontSize="$xs" color="$baseTextMedEmphasis">
                {toTitleCase(attr.trait)}
              </StyledText>
              <StyledText fontSize="$sm">{attr.value}</StyledText>
              {price ? (
                <StyledText
                  mt="$2"
                  textAlign="right"
                  fontSize="$xs"
                  color="$baseTextMedEmphasis"
                >{`◎ ${toDisplayBalance(price, 9)}`}</StyledText>
              ) : null}
            </Stack>
          );
        })}
      </XStack>
    </YStack>
  );
}
