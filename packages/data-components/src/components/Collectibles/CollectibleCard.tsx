import { View } from "react-native";
import { externalResourceUri, UNKNOWN_NFT_ICON_SRC } from "@coral-xyz/common";
import { ProxyImage, StyledText, XStack, YStack } from "@coral-xyz/tamagui";

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
  return (
    <YStack
      flex={1}
      cursor="pointer"
      pointerEvents="box-only"
      onPress={onCardClick}
    >
      <_CollectibleImagePreview
        size={imageBoxSize}
        images={collectibles.data.map((d) =>
          d.image ? externalResourceUri(d.image) : UNKNOWN_NFT_ICON_SRC
        )}
      />
      <XStack marginTop={8}>
        <StyledText
          ellipsizeMode="tail"
          fontSize="$sm"
          maxWidth="90%"
          numberOfLines={1}
        >
          {collectibles.collection}
        </StyledText>
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
          style={{ borderRadius: 8, height: 80, width: 80 }}
          size={80}
          src={uri}
        />
      ))}
    </View>
  );
}
