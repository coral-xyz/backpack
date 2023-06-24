import { Image, View } from "react-native";
import { externalResourceUri,UNKNOWN_NFT_ICON_SRC } from "@coral-xyz/common";
import { ProxyImage, StyledText, XStack, YStack } from "@coral-xyz/tamagui";

import type { CollectibleGroup } from "./utils";

export type CollectibleCardProps = {
  collectibles: CollectibleGroup;
  onCardClick: () => void;
};

export function CollectibleCard({
  collectibles,
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
};

function _CollectibleImagePreview({ images }: _CollectibleImagePreviewProps) {
  if (images.length === 1) {
    return (
      <ProxyImage
        style={{ borderRadius: 12, height: 164, width: 164 }}
        size={164}
        src={images[0]}
      />
    );
  }
  return <_CollectibleImagePreviewBox images={images.slice(0, 4)} />;
}

function _CollectibleImagePreviewBox({
  images,
}: _CollectibleImagePreviewProps) {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-evenly",
        alignItems: "center",
        gap: 12,
        borderRadius: 12,
        height: 164,
        padding: 12,
      }}
    >
      {images.map((uri, idx) => (
        <ProxyImage
          key={`${idx}-${uri}`}
          style={{ borderRadius: 8, height: 64, width: 64 }}
          size={64}
          src={uri}
        />
      ))}
    </View>
  );
}
