import { View, Pressable } from "react-native";

import { UNKNOWN_NFT_ICON_SRC } from "@coral-xyz/common";
import { ProxyImage, XStack, StyledText } from "@coral-xyz/tamagui";

export function BaseListItem({ onPress, item }: any): JSX.Element {
  return (
    <Pressable style={{ flex: 1 }} onPress={() => onPress(item)}>
      <CollectionImage images={item.images} />
      <XStack mt={8}>
        <StyledText
          fontSize="$base"
          numberOfLines={1}
          ellipsizeMode="tail"
          maxWidth="90%"
        >
          {item.name}
        </StyledText>
      </XStack>
    </Pressable>
  );
}

function ImageBox({ images }: { images: string[] }): JSX.Element {
  return (
    <View
      style={{
        height: 164,
        borderRadius: 12,
        backgroundColor: "white",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        padding: 12,
        justifyContent: "space-evenly",
        alignItems: "center",
      }}
    >
      {images.map((uri: string, index: number) => {
        return (
          <ProxyNFTImage
            key={`${index}${uri}`} // eslint-disable-line
            src={uri}
            size={64}
            style={{ borderRadius: 8 }}
          />
        );
      })}
    </View>
  );
}

function CollectionImage({ images }: { images: string[] }): JSX.Element {
  if (images.length === 1) {
    return (
      <ProxyNFTImage size={164} src={images[0]} style={{ borderRadius: 12 }} />
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
