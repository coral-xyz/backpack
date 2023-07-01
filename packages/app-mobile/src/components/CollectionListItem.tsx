import { Pressable, StyleSheet } from "react-native";

import { UNKNOWN_NFT_ICON_SRC } from "@coral-xyz/common";
import { ProxyImage, XStack, StyledText } from "@coral-xyz/tamagui";

import { WINDOW_WIDTH } from "~src/lib";

const ITEM_WIDTH = Math.floor((WINDOW_WIDTH - 32 - 16) / 2);
const IMAGE_WIDTH = Math.floor((ITEM_WIDTH - 8) / 2);
export const ITEM_HEIGHT = ITEM_WIDTH + 25;

export function BaseListItem({ onPress, item }: any): JSX.Element {
  return (
    <Pressable
      onPress={() => onPress(item)}
      style={baseListItemStyle.container}
    >
      <CollectionImage images={item.images} />
      <XStack mt={8} space={4}>
        <StyledText
          fontSize="$sm"
          numberOfLines={1}
          ellipsizeMode="tail"
          color="$baseTextHighEmphasis"
          maxWidth="90%"
        >
          {item.name}
        </StyledText>
        <StyledText
          fontSize="$sm"
          numberOfLines={1}
          ellipsizeMode="tail"
          color="$baseTextMedEmphasis"
        >
          {item.images.length}
        </StyledText>
      </XStack>
    </Pressable>
  );
}

const baseListItemStyle = StyleSheet.create({
  container: {
    flex: 1,
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
  },
});

function ImageBox({ images }: { images: string[] }): JSX.Element {
  return (
    <XStack flexWrap="wrap" gap={8} alignItems="center">
      {images.map((uri: string, index: number) => {
        return (
          <ProxyNFTImage
            key={`${index}${uri}`} // eslint-disable-line
            src={uri}
            size={IMAGE_WIDTH}
            style={{ borderRadius: 8 }}
          />
        );
      })}
    </XStack>
  );
}

function CollectionImage({ images }: { images: string[] }): JSX.Element {
  if (images.length === 1) {
    return (
      <ProxyNFTImage
        size={ITEM_WIDTH}
        src={images[0]}
        style={{ borderRadius: 12 }}
      />
    );
  }

  return <ImageBox images={images.slice(0, 4)} />;
}

export function ProxyNFTImage({
  size,
  src,
  style,
}: {
  size: number;
  src: string | null | undefined;
  style: any;
}): JSX.Element {
  const uri = src ?? UNKNOWN_NFT_ICON_SRC;
  return (
    <ProxyImage
      size={size}
      src={uri}
      style={[style, { backgroundColor: "white" }]}
    />
  );
}
