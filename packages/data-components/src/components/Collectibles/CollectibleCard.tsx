import { useMemo } from "react";
import { Pressable, View } from "react-native";
import { externalResourceUri, UNKNOWN_NFT_ICON_SRC } from "@coral-xyz/common";
import {
  MoreHorizontalIcon,
  ProxyImage,
  StyledText,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";

import type { CollectibleGroup } from "./utils";

export type CollectibleCardProps = {
  collectibles: CollectibleGroup;
  imageBoxSize: number;
  onCardClick: () => void;
  onOptionsClick: () => void;
};

export function CollectibleCard({
  collectibles,
  imageBoxSize,
  onCardClick,
  onOptionsClick,
}: CollectibleCardProps) {
  const imageSources = collectibles.data.map((d) =>
    d.image ? externalResourceUri(d.image) : UNKNOWN_NFT_ICON_SRC
  );

  return (
    <YStack
      flex={1}
      maxWidth={imageBoxSize}
      width={imageBoxSize}
      cursor="pointer"
    >
      <Pressable onPress={onCardClick}>
        <_CollectibleImagePreview size={imageBoxSize} images={imageSources} />
      </Pressable>
      <XStack alignItems="center" marginTop={8} width="100%">
        <_CollectibleTitle
          amount={collectibles.data.length}
          onClick={onCardClick}
          title={collectibles.collection}
        />
        {collectibles.data.length === 1 ? (
          <Pressable
            onPress={onOptionsClick}
            style={{ display: "flex", flexGrow: 1, alignItems: "flex-end" }}
          >
            <MoreHorizontalIcon color="$secondary" />
          </Pressable>
        ) : null}
      </XStack>
    </YStack>
  );
}

type _CollectibleImagePreviewProps = {
  images: string[];
  size: number;
};

function _CollectibleImagePreview({
  images,
  size,
}: _CollectibleImagePreviewProps) {
  if (images.length === 1) {
    return (
      <ProxyImage
        style={{ borderRadius: 12, height: size, width: size }}
        size={size}
        src={images[0]}
      />
    );
  }
  return (
    <_CollectibleImagePreviewBox size={size} images={images.slice(0, 4)} />
  );
}

function _CollectibleImagePreviewBox({
  images,
  size,
}: _CollectibleImagePreviewProps) {
  const innerSize = useMemo(() => Math.floor(size / 2) - 2, [size]);
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
        borderRadius: 12,
        height: size,
        width: size,
      }}
    >
      {images.map((uri, idx) => (
        <ProxyImage
          key={`${idx}-${uri}`}
          style={{ borderRadius: 8, height: innerSize, width: innerSize }}
          size={innerSize}
          src={uri}
        />
      ))}
    </View>
  );
}

type _CollectibleTitleProps = {
  amount: number;
  onClick: () => void;
  title: string;
};

const _CollectibleTitle = ({
  amount,
  onClick,
  title,
}: _CollectibleTitleProps) => (
  <XStack flex={1} maxWidth="80%" overflow="hidden">
    <StyledText
      numberOfLines={1}
      overflow="hidden"
      whiteSpace="nowrap"
      ellipsizeMode="tail"
      fontSize="$sm"
      onPress={onClick}
    >
      {title}
    </StyledText>
    <StyledText fontSize="$sm" color="$secondary" marginLeft={8}>
      {amount}
    </StyledText>
  </XStack>
);
