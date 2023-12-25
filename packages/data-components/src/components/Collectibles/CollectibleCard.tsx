import { useCallback, useEffect, useMemo, useState } from "react";
import { type GestureResponderEvent, Pressable, View } from "react-native";
import {
  externalResourceUri,
  proxyImageUrl,
  UNKNOWN_NFT_ICON_SRC,
} from "@coral-xyz/common";
import {
  madLadGold,
  useActiveWallet,
  useCollectibleXnftLoadable,
  useOpenPlugin,
} from "@coral-xyz/recoil";
import {
  Image,
  MoreHorizontalIcon,
  Popover,
  Stack,
  StyledText,
  temporarilyMakeStylesForBrowserExtension,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";
import { Platform } from "expo-modules-core";
import { useRecoilValueLoadable } from "recoil";

import { useCollectiblesContext } from "./context";
import type { CollectibleGroup, ResponseCollectible } from "./utils";

export type CollectibleCardProps = {
  collectibles: CollectibleGroup;
};

const useStyles = temporarilyMakeStylesForBrowserExtension((theme) => ({
  button: {
    "&:hover": {
      opacity: 0.8,
    },
    "&:hover .openXnft": {
      display: "flex",
    },
    "&:hover .xnftIcon": {
      width: "100%",
    },
    "&:hover .appIcon": {
      transform: "rotate(360deg)",
    },
  },
}));

export function CollectibleCard({ collectibles }: CollectibleCardProps) {
  const imageBoxSize = Platform.select({ native: 165, web: 165 });

  const openApp = useOpenPlugin();
  const classes = useStyles();
  const { onCardClick, showItemCount } = useCollectiblesContext();
  const { contents, state } = useCollectibleXnftLoadable({
    collection: collectibles.data[0].collection?.address,
    mint: collectibles.data[0].address,
  });

  const isMadLad =
    collectibles.data.length === 1
      ? collectibles.data[0].collection?.address ===
        "J1S9H3QjnRtBbbuD4HjPV6RpRhwuk4zKbxsnCHuTgh9w"
      : false;

  /**
   * Get the state of the loadable recoil atom and determine
   * whether the collectible group meets the criteria for being
   * able to be opened into an xNFT.
   */
  const xnft = (state === "hasValue" && contents) || null;
  const hasOpenablePlugin =
    collectibles.data.length === 1 &&
    !collectibles.data[0].compressed &&
    (xnft || undefined) !== undefined;

  /**
   * Memoized list of collectible image sources with unknown defaults.
   */
  const imageSources = useMemo(
    () =>
      collectibles.data.map((d) =>
        d.image && d.image !== ""
          ? externalResourceUri(d.image)
          : UNKNOWN_NFT_ICON_SRC
      ),
    [collectibles.data]
  );

  /**
   * Memoized callback function to handle the card click event and pass in
   * the data for the represented collectible group.
   *
   * If there is only one collectible in the group which is not a compressed NFT
   * and there was an xNFT address associated with it, then onClick should open
   * the xNFT application for the asset, otherwise use the props provided navigational
   * onClick handler.
   */
  const handleCardClick = useCallback(
    (e: GestureResponderEvent) => {
      e.stopPropagation();
      onCardClick(collectibles);
    },
    [collectibles, onCardClick]
  );

  /**
   * Memoized callback function to handle launching an xNFT associated with a collectible.
   */
  const openPlugin = useCallback(
    (e: GestureResponderEvent) => {
      e.stopPropagation();
      const mint = collectibles.data[0].address;
      const str = `${xnft}/${mint}`;
      openApp(str);
    },
    [collectibles, openApp, xnft]
  );

  return (
    <YStack
      cursor="pointer"
      flex={1}
      maxWidth={imageBoxSize}
      width={imageBoxSize}
    >
      <Stack className={classes.button}>
        <Pressable onPress={handleCardClick}>
          {isMadLad ? (
            <MadLadsGold
              nft={{
                mint: collectibles.data[0]!.address,
              }}
            />
          ) : null}
          <_CollectibleImagePreview size={imageBoxSize} images={imageSources} />
        </Pressable>
      </Stack>
      <XStack
        onPress={handleCardClick}
        alignItems="center"
        marginTop={8}
        width="100%"
      >
        <_CollectibleTitle
          amount={collectibles.data.length}
          showItemCount={showItemCount}
          title={collectibles.collection}
        />
        {collectibles.data.length === 1 ? (
          <_CollectibleMoreOptionsButton
            item={collectibles.data[0]}
            openPlugin={hasOpenablePlugin ? openPlugin : undefined}
          />
        ) : null}
      </XStack>
    </YStack>
  );
}

type _CollectibleMoreOptionsButtonProps = {
  item: ResponseCollectible;
  openPlugin?: (e: GestureResponderEvent) => void | Promise<void>;
};

function _CollectibleMoreOptionsButton({
  item,
  openPlugin,
}: _CollectibleMoreOptionsButtonProps) {
  const { blockchain } = useActiveWallet();
  const { onOpenSendDrawer, onViewClick } = useCollectiblesContext();
  const [iconOpacity, setIconOpacity] = useState(1);
  const preventScroll = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const preventScrollingIfOpen = useCallback((open: boolean) => {
    if (open) {
      document.addEventListener("wheel", preventScroll, { passive: false });
    } else {
      document.removeEventListener("wheel", preventScroll);
    }
  }, []);

  useEffect(() => {
    // Ensure that users can scroll when this component is unmounted
    return () => document.removeEventListener("wheel", preventScroll);
  }, []);

  return (
    <Popover
      onOpenChange={preventScrollingIfOpen}
      placement="top-end"
      size="$sm"
    >
      <Popover.Trigger asChild>
        <Pressable style={{ opacity: iconOpacity }}>
          <MoreHorizontalIcon
            onPointerEnter={() => setIconOpacity(0.7)}
            onPointerLeave={() => setIconOpacity(1)}
            color="$baseTextMedEmphasis"
          />
        </Pressable>
      </Popover.Trigger>
      <Popover.Content
        backgroundColor="$baseBackgroundL1"
        borderColor="$baseBorderMed"
        borderRadius={4}
        borderWidth={1}
        paddingHorizontal={14}
        paddingVertical={10}
      >
        <Popover.Arrow borderColor="$baseBorderLight" borderWidth={1} />
        <Popover.Close />
        <YStack gap={6}>
          {openPlugin ? (
            <XStack
              cursor="pointer"
              hoverStyle={{ opacity: 0.8 }}
              paddingHorizontal={6}
              paddingVertical={2}
              onPress={openPlugin}
            >
              <StyledText fontSize="$sm">Open</StyledText>
            </XStack>
          ) : null}
          <XStack
            cursor="pointer"
            hoverStyle={{ opacity: 0.8 }}
            paddingHorizontal={6}
            paddingVertical={2}
            onPress={(e) => {
              e.stopPropagation();
              onViewClick(item);
            }}
          >
            <StyledText fontSize="$sm">View</StyledText>
          </XStack>
          {onOpenSendDrawer && !item.compressed ? (
            <XStack
              cursor="pointer"
              hoverStyle={{ opacity: 0.8 }}
              paddingHorizontal={6}
              paddingVertical={2}
              onPress={(e) => {
                e.stopPropagation();
                onOpenSendDrawer(item);
              }}
            >
              <StyledText fontSize="$sm">Send</StyledText>
            </XStack>
          ) : null}
        </YStack>
      </Popover.Content>
    </Popover>
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
  return <_CollectibleImage size={size} src={images[0]} />;
  // if (images.length < 4) {
  //   return <_CollectibleImage size={size} src={images[0]} />;
  // }
  // return (
  //   <_CollectibleImagePreviewBox size={size} images={images.slice(0, 4)} />
  // );
}

function _CollectibleImagePreviewBox({
  images,
  size,
}: _CollectibleImagePreviewProps) {
  const innerSize = Math.floor(size / 2) - 2;
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
        <_CollectibleImage
          grouped
          key={`${idx}-${uri}`}
          size={innerSize}
          src={uri}
        />
      ))}
    </View>
  );
}

type _CollectibleImageProps = {
  grouped?: boolean;
  size: number;
  src: string;
};

function _CollectibleImage({ grouped, size, src }: _CollectibleImageProps) {
  const [source, setSource] = useState(proxyImageUrl(src));
  return (
    <Image
      onError={(_err) => {
        setSource((prev) => (prev === src ? UNKNOWN_NFT_ICON_SRC : src));
      }}
      backgroundColor="$baseBackgroundL1"
      borderRadius={grouped ? 8 : 12}
      height={size}
      width={size}
      source={{ uri: source }}
    />
  );
}

type _CollectibleTitleProps = {
  amount: number;
  showItemCount?: boolean;
  title: string;
};

const _CollectibleTitle = ({
  amount,
  showItemCount,
  title,
}: _CollectibleTitleProps) => (
  <XStack flex={1} maxWidth="100%" overflow="hidden">
    <StyledText
      ellipsizeMode="tail"
      fontSize="$sm"
      numberOfLines={1}
      overflow="hidden"
      whiteSpace="nowrap"
    >
      {title}
    </StyledText>
    {showItemCount ? (
      <StyledText
        fontSize="$sm"
        color="$baseTextMedEmphasis"
        marginHorizontal={6}
      >
        {amount}
      </StyledText>
    ) : null}
  </XStack>
);

function MadLadsGold({ nft }: { nft: { mint: string } }) {
  const { contents, state } = useRecoilValueLoadable(madLadGold(nft.mint!));
  if (state === "hasError") {
    return null;
  }
  return (
    <View
      style={{
        position: "absolute",
        left: 8,
        top: 8,
        zIndex: 20,
        display: "flex",
        justifyContent: "flex-start",
        padding: "0 8px",
      }}
    >
      {state === "hasValue" && contents.isStaked ? (
        <StyledText
          color="$invertedBaseTextHighEmphasis"
          fontSize={14}
          fontWeight="600"
        >
          STAKED
        </StyledText>
      ) : null}
    </View>
  );
}
