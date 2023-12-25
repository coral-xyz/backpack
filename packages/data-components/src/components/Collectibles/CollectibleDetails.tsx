import { type ReactNode, Suspense, useLayoutEffect, useState } from "react";
import { View } from "react-native";
import {
  externalResourceUri,
  LOCKABLE_COLLECTIONS,
  proxyImageUrl,
  UNKNOWN_NFT_ICON_SRC,
} from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  useAppStoreMetaLoadable,
  useCollectibleXnftLoadable,
  useOpenPlugin,
} from "@coral-xyz/recoil";
import {
  Button,
  Image,
  PrimaryButton,
  ProxyImage,
  StyledText,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";
import { Platform } from "expo-modules-core";

import { LockCollectionToggle } from "./LockCollectionToggle";
import type { ResponseCollectible } from "./utils";

export type CollectibleDetailsProps = {
  data: ResponseCollectible;
  loaderComponent?: ReactNode;
  onSend: (nft: ResponseCollectible) => void | Promise<void>;
};

export const CollectibleDetails = ({
  loaderComponent,
  ...rest
}: CollectibleDetailsProps) => (
  <Suspense fallback={loaderComponent}>
    <_CollectibleDetails {...rest} />
  </Suspense>
);

function _CollectibleDetails({
  data,
  onSend,
}: Omit<CollectibleDetailsProps, "loaderComponent">) {
  const size = Platform.select({ native: 340, web: 340 });
  const [height, setHeight] = useState(size);
  const { t } = useTranslation();

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
      <XStack flex={1} gap={8} maxWidth="100%">
        <View style={{ flex: 1 }}>
          <PrimaryButton label={t("send")} onPress={() => onSend(data)} />
        </View>
      </XStack>
      {data.collection &&
      LOCKABLE_COLLECTIONS.includes(data.collection.address) ? (
        <LockCollectionToggle
          collectionAddress={data.collection.address}
          collectionName={data.collection.name ?? ""}
        />
      ) : null}
      <_CollectibleApplication
        collectionAddress={data.collection?.address}
        compressed={data.compressed}
        mint={data.address}
      />
      {data.description ? (
        <YStack gap={2}>
          <StyledText color="$baseTextMedEmphasis">
            {t("description")}
          </StyledText>
          <StyledText>{data.description}</StyledText>
        </YStack>
      ) : null}
      {data.attributes ? (
        <YStack gap={2}>
          <StyledText color="$baseTextMedEmphasis">
            {t("attributes")}
          </StyledText>
          <_CollectibleAttributes attributes={data.attributes} />
        </YStack>
      ) : null}
    </YStack>
  );
}

type _CollectibleAttributesProps = {
  attributes: NonNullable<ResponseCollectible["attributes"]>;
};

const _CollectibleAttributes = ({
  attributes,
}: _CollectibleAttributesProps) => (
  <XStack flex={1} gap={8} flexWrap="wrap" width="100%">
    {attributes.map((attr) => (
      <YStack
        key={attr.trait}
        backgroundColor="$baseBackgroundL1"
        borderRadius={8}
        overflow="hidden"
        paddingVertical={4}
        paddingHorizontal={8}
        maxWidth="100%"
      >
        <StyledText
          color="$baseTextMedEmphasis"
          ellipsizeMode="tail"
          fontSize="$sm"
          numberOfLines={1}
          overflow="hidden"
          whiteSpace="nowrap"
        >
          {attr.trait}
        </StyledText>
        <StyledText
          ellipsizeMode="tail"
          numberOfLines={1}
          overflow="hidden"
          whiteSpace="nowrap"
        >
          {attr.value}
        </StyledText>
      </YStack>
    ))}
  </XStack>
);

type _CollectibleApplicationProps = {
  collectionAddress?: string;
  compressed?: boolean;
  mint: string;
};

function _CollectibleApplication({
  collectionAddress,
  compressed,
  mint,
}: _CollectibleApplicationProps) {
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
    <YStack marginTop={8} position="relative">
      <StyledText color="$baseTextMedEmphasis" marginBottom={4}>
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
