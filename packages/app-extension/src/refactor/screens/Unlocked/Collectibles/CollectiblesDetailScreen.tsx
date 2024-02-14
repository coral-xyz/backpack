import { useCallback, useLayoutEffect, useState } from "react";
import { useApolloClient } from "@apollo/client";
import {
  externalResourceUri,
  LOCKABLE_COLLECTIONS,
  proxyImageUrl,
  toDisplayBalance,
  toTitleCase,
  UNKNOWN_NFT_ICON_SRC,
  wait,
} from "@coral-xyz/common";
import {
  CollectibleInscriptionTable,
  GET_COLLECTIBLES_QUERY,
  LockCollectionToggle,
} from "@coral-xyz/data-components";
import type { CollectibleDetailsProps } from "@coral-xyz/data-components/src/components/Collectibles/CollectibleDetails";
import { useTranslation } from "@coral-xyz/i18n";
import {
  tensorProgressAtom,
  useActiveWallet,
  useAppStoreMetaLoadable,
  useCollectibleXnftLoadable,
  useCreateTensorAction,
  useOpenPlugin,
  useTensorMintData,
} from "@coral-xyz/recoil";
import type { ProviderId } from "@coral-xyz/recoil/src/apollo/graphql";
import type { TensorMintDataType } from "@coral-xyz/secure-clients/types";
import {
  Button,
  Image,
  PrimaryButton,
  ProxyImage,
  SecondaryButton,
  Skeleton,
  Stack,
  StyledText,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";
import { useNavigation } from "@react-navigation/native";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useRecoilState } from "recoil";
import { v4 } from "uuid";

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
  const progressId = v4();
  const navigation = useNavigation<any>();
  const [height, setHeight] = useState(size);
  const { t } = useTranslation();
  const { blockchain, publicKey } = useActiveWallet();
  const createAction = useCreateTensorAction();
  const [, setProgress] = useRecoilState(tensorProgressAtom(progressId));

  const apollo = useApolloClient();
  const [tensorMintData, refreshTensorMintData] = useTensorMintData(
    data.address,
    publicKey,
    blockchain
  );
  const edit = tensorMintData.data?.activeListing?.type === "tlisting";
  const hasActiveListing = tensorMintData.data?.activeListing;
  const activeListingPrice = tensorMintData.data?.activeListing?.listPrice
    ? (
        tensorMintData.data?.activeListing?.listPrice / LAMPORTS_PER_SOL
      ).toString()
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
      const execute = createAction({
        action: "sell",
        publicKey: publicKey,
        mint: data.address,
        compressed: !!data.compressed,
        price,
        tensorMintData: tensorMintData!.data!,
        onDone: async () => {
          refreshTensorMintData();
          await wait(2);
          await apollo.query({
            query: GET_COLLECTIBLES_QUERY,
            fetchPolicy: "network-only",
            variables: {
              address: publicKey,
              providerId: blockchain.toUpperCase() as ProviderId,
            },
          });
        },
      });

      setProgress({ executing: false, execute });

      navigation.navigate(WalletsRoutes.TensorNavigator, {
        screen: TensorRoutes.TensorCollectibleActionScreen,
        params: {
          ctx: { blockchain, publicKey },
          action: "sell",
          progressId,
          mint: data.address,
          nft: data,
          price,
          description: t("accepting_offer_on_tensor"),
        },
      });
    },
    [
      createAction,
      publicKey,
      data,
      tensorMintData,
      setProgress,
      navigation,
      blockchain,
      progressId,
      t,
      refreshTensorMintData,
      apollo,
    ]
  );

  const openDelistFlow = useCallback(() => {
    const execute = createAction({
      action: "delist",
      publicKey: publicKey,
      mint: data.address,
      compressed: !!data.compressed,
      price: "",
      tensorMintData: tensorMintData!.data!,
      onDone: async () => {
        refreshTensorMintData();
        await wait(2);
        await apollo.query({
          query: GET_COLLECTIBLES_QUERY,
          fetchPolicy: "network-only",
          variables: {
            address: publicKey,
            providerId: blockchain.toUpperCase() as ProviderId,
          },
        });
      },
    });

    setProgress({ executing: false, execute });

    navigation.navigate(WalletsRoutes.TensorNavigator, {
      screen: TensorRoutes.TensorCollectibleActionScreen,
      params: {
        ctx: { blockchain, publicKey },
        action: "delist",
        progressId,
        mint: data.address,
        nft: data,
        description: t("removing_listing_on_tensor"),
      },
    });
  }, [
    createAction,
    publicKey,
    data,
    tensorMintData,
    setProgress,
    navigation,
    blockchain,
    progressId,
    t,
    refreshTensorMintData,
    apollo.cache,
  ]);

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
      {tensorMintData.status === "loading" ? (
        <YStack space="$4">
          <XStack flex={1} space="$3">
            <YStack
              flexBasis={1}
              flex={1}
              borderRadius="$medium"
              overflow="hidden"
            >
              <Skeleton height={48} width="100%" />
            </YStack>
            <YStack
              flexBasis={1}
              flex={1}
              borderRadius="$medium"
              overflow="hidden"
            >
              <Skeleton height={48} width="100%" />
            </YStack>
          </XStack>
          <XStack flex={1} space="$3">
            <YStack flexBasis={1} flex={1} space="$3" position="relative">
              <Skeleton height={16} width="50%" />
              <Skeleton height={24} width="80%" />
            </YStack>
            <YStack flexBasis={1} flex={1} space="$3" position="relative">
              <Skeleton height={16} width="50%" />
              <Skeleton height={24} width="80%" />
              <Skeleton height={12} width="60%" />
            </YStack>
          </XStack>
        </YStack>
      ) : tensorMintData.data?.activeListing?.type !== "other" ? (
        <XStack flex={1} space="$4">
          {["tlisting", "tswap"].includes(
            tensorMintData.data?.activeListing?.type ?? ""
          ) ? (
            <YStack
              position="relative"
              flex={1}
              flexBasis={1}
              overflow="hidden"
            >
              <SecondaryButton
                label={t("delist_nft")}
                onPress={openDelistFlow}
              />
            </YStack>
          ) : null}
          {!tensorMintData.data ||
          tensorMintData.data?.activeListing === null ? (
            <YStack
              position="relative"
              flex={1}
              flexBasis={1}
              overflow="hidden"
            >
              <SecondaryButton label={t("send")} onPress={() => onSend(data)} />
            </YStack>
          ) : null}
          {tensorMintData.data &&
          (tensorMintData.data?.activeListing === null ||
            tensorMintData.data?.activeListing?.type === "tlisting") ? (
              <YStack
                position="relative"
                flex={1}
                flexBasis={1}
                overflow="hidden"
            >
                <PrimaryButton
                  label={edit ? t("list_nft_edit") : t("list_nft")}
                  onPress={() => openListFlow(activeListingPrice)}
              />
              </YStack>
          ) : null}
        </XStack>
      ) : null}
      <TensorPriceData
        openSellFlow={openSellFlow}
        tensorData={tensorMintData.data}
      />
      <CollectibleInscriptionTable
        info={data.solana}
        onAddressClick={window.open}
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
          openListFlow={
            tensorMintData.status === "ok" &&
            tensorMintData.data?.activeListing?.type !== "other"
              ? openListFlow
              : undefined
          }
          attributes={data.attributes}
          attributeMeta={tensorMintData.data?.traits}
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
  const { t } = useTranslation();

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
        {t("application")}
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
          {t("open")}
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
  const { t } = useTranslation();

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
      label: t("listed"),
      color: "$greenText",
      price: tensorData.activeListing.listPriceStr,
    });
  }

  if (tensorData.highestBid) {
    prices.push({
      label: t("highest_offer"),
      price: tensorData.highestBid.offerPriceStr,
      action:
        tensorData.activeListing?.type !== "other"
          ? {
              label: t("accept_offer"),
              action: () => {
                openSellFlow(tensorData.highestBid!.offerPriceStr);
              },
            }
          : undefined,
    });
  }

  if (tensorData.floorPrice) {
    prices.push({
      label: t("floor_price"),
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
            flexBasis={1}
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
