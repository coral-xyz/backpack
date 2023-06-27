import { useMemo } from "react";
import { View } from "react-native";
import { externalResourceUri, UNKNOWN_NFT_ICON_SRC } from "@coral-xyz/common";
import { ProxyImage, StyledText, XStack, YStack } from "@coral-xyz/tamagui";

// import { MoreHorizontal } from "@tamagui/lucide-icons";
import type { CollectibleGroup } from "./utils";

export type CollectibleCardProps = {
  collectibles: CollectibleGroup;
  imageBoxSize: number;
  onCardClick: () => void;
};

export function CollectibleCard({
  collectibles,
  imageBoxSize,
  onCardClick,
}: CollectibleCardProps) {
  const imageSources = collectibles.data.map((d) =>
    d.image ? externalResourceUri(d.image) : UNKNOWN_NFT_ICON_SRC
  );

  return (
    <YStack
      flex={1}
      cursor="pointer"
      pointerEvents="box-only"
      onPress={onCardClick}
    >
      <_CollectibleImagePreview size={imageBoxSize} images={imageSources} />
      <XStack marginTop={8}>
        <StyledText
          ellipsizeMode="tail"
          fontSize="$sm"
          maxWidth="90%"
          numberOfLines={1}
        >
          {collectibles.collection}
        </StyledText>
        {/* {collectibles.data.length === 1 && (
          <MoreHorizontal color="$secondary" />
        )} */}
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
