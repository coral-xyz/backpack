import { Pressable, Text, View } from "react-native";

import { UNKNOWN_NFT_ICON_SRC } from "@coral-xyz/common";
import { nftById } from "@coral-xyz/recoil";
import { useRecoilValueLoadable } from "recoil";

import { ProxyImage } from "~components/index";
import { useTheme } from "~hooks/useTheme";

export function BaseCard({
  onPress,
  imageUrl,
  subtitle,
}: {
  onPress: () => void;
  imageUrl: string | null;
  subtitle?: { name: string; length: string };
}): JSX.Element {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: "50%",
        padding: 4,
        borderRadius: 8,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <ProxyImage
        style={{
          borderRadius: 8,
          backgroundColor: theme.custom.colors.borderFull,
          aspectRatio: 1,
          width: "100%",
        }}
        src={imageUrl ?? UNKNOWN_NFT_ICON_SRC}
      />
      {subtitle ? (
        <View
          style={{
            backgroundColor: theme.custom.colors.nav,
            position: "absolute",
            bottom: 8,
            left: 8,
            right: 8,
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 6,
            margin: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                justifyContent: "space-between",
                color: theme.custom.colors.fontColor,
              }}
            >
              {subtitle.name}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                marginLeft: 8,
                color: theme.custom.colors.secondary,
              }}
            >
              {subtitle.length}
            </Text>
          </View>
        </View>
      ) : null}
    </Pressable>
  );
}

export function NFTCard({
  nftId,
  publicKey,
  connectionUrl,
  onPress,
  subtitle,
}: {
  nftId: string;
  publicKey: string;
  connectionUrl: string;
  subtitle?: { name: string; length: string };
  onPress: (data: any) => object;
}): JSX.Element | null {
  const { contents, state } = useRecoilValueLoadable(
    nftById({
      publicKey,
      connectionUrl,
      nftId,
    })
  );

  const nft = (state === "hasValue" && contents) || null;

  if (!nft) {
    return null;
  }

  return (
    <BaseCard onPress={onPress} imageUrl={nft.imageUrl} subtitle={subtitle} />
  );
}
