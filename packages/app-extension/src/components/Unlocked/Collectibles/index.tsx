import { type CSSProperties, useState } from "react";
import {
  LOCKABLE_COLLECTIONS,
  NAV_COMPONENT_NFT_COLLECTION,
  NAV_COMPONENT_NFT_DETAIL,
  UNKNOWN_NFT_ICON_SRC,
} from "@coral-xyz/common";
import {
  CollectibleDetails as _CollectibleDetails,
  type CollectibleGroup,
  CollectibleGroupView as _CollectibleGroupView,
  Collectibles as _Collectibles,
  LockCollectionToggle,
  type ProviderId,
  type ResponseCollectible,
} from "@coral-xyz/data-components";
import { useTranslation } from "@coral-xyz/i18n";
import { EmptyState, ImageIcon } from "@coral-xyz/react-common";
import {
  useActiveWallet,
  useBlockchainConnectionUrl,
  useNavigation,
} from "@coral-xyz/recoil";
import { useTheme, YStack } from "@coral-xyz/tamagui";
import { Skeleton } from "@mui/material";
import styled from "@mui/system/styled";

import { SendDrawer } from "./SendDrawer";
export { CollectibleOptionsButton } from "./Options";

export function Collectibles() {
  const activeWallet = useActiveWallet();
  const connectionUrl = useBlockchainConnectionUrl(activeWallet.blockchain);
  const { push } = useNavigation();
  const [nft, setNft] = useState<ResponseCollectible | undefined>(undefined);

  const convertedNft = nft
    ? {
        id: nft.id,
        blockchain: activeWallet.blockchain,
        collectionName: nft.collection?.name ?? "",
        compressed: nft.compressed,
        compressionData: nft.compressionData,
        description: nft.description ?? "",
        externalUrl: "",
        imageUrl: nft.image ?? UNKNOWN_NFT_ICON_SRC,
        mint: nft.address,
        name: nft.name ?? "Unnamed",
        token: nft.token,
      }
    : undefined;

  return (
    <SendDrawer nft={convertedNft}>
      {(openSendDrawer) => (
        <_Collectibles
          address={activeWallet.publicKey}
          providerId={activeWallet.blockchain.toUpperCase() as ProviderId}
          emptyStateComponent={<_NoCollectiblesLabel />}
          fetchPolicy="cache-and-network"
          loaderComponent={<_Loader />}
          onCardClick={async (group) => {
            if (group.data.length === 1) {
              await push({
                title: group.collection,
                componentId: NAV_COMPONENT_NFT_DETAIL,
                componentProps: {
                  data: group.data[0],
                  connectionUrl,
                },
              });
            } else {
              await push({
                title: group.collection,
                componentId: NAV_COMPONENT_NFT_COLLECTION,
                componentProps: {
                  data: group.data.reduce<CollectibleGroup[]>((acc, curr) => {
                    acc.push({
                      collection: curr.name || "Unknown",
                      data: [curr],
                    });
                    return acc;
                  }, []),
                  connectionUrl,
                },
              });
            }
          }}
          onOpenSendDrawer={(nft: ResponseCollectible) => {
            setNft(nft);
            openSendDrawer();
          }}
          onViewClick={async (nft) => {
            await push({
              title: nft.name ?? "Unnamed",
              componentId: NAV_COMPONENT_NFT_DETAIL,
              componentProps: {
                data: nft,
                connectionUrl,
              },
            });
          }}
        />
      )}
    </SendDrawer>
  );
}

export function CollectibleDetailsView({
  data,
}: {
  data: ResponseCollectible;
}) {
  const { blockchain } = useActiveWallet();

  if (!data) {
    return null;
  }

  const convertedNft = {
    id: data.id,
    blockchain,
    collectionName: data.collection?.name ?? "",
    compressed: data.compressed,
    compressionData: data.compressionData,
    description: data.description ?? "",
    externalUrl: "",
    imageUrl: data.image ?? UNKNOWN_NFT_ICON_SRC,
    mint: data.address,
    name: data.name ?? "Unnamed",
    token: data.token,
  };

  return (
    <SendDrawer nft={convertedNft}>
      {(open) => <_CollectibleDetails data={data} onSend={() => open()} />}
    </SendDrawer>
  );
}

export function CollectibleGroupView({ data }: { data: CollectibleGroup[] }) {
  const { blockchain } = useActiveWallet();
  const connectionUrl = useBlockchainConnectionUrl(blockchain);
  const { push } = useNavigation();

  const collection = data[0]?.data?.[0]?.collection;

  return (
    <YStack>
      {collection && LOCKABLE_COLLECTIONS.includes(collection.address) ? (
        <LockCollectionToggle
          marginHorizontal="$4"
          collectionName={collection.name ?? ""}
          collectionAddress={collection.address}
        />
      ) : null}
      <_CollectibleGroupView
        data={data}
        loaderComponent={<_LoadingRow itemsPerRow={2} />}
        onCardClick={async ({ collection, data }: CollectibleGroup) => {
          await push({
            title: collection,
            componentId: NAV_COMPONENT_NFT_DETAIL,
            componentProps: {
              data: data[0],
              connectionUrl,
            },
          });
        }}
        onViewClick={async (nft: ResponseCollectible) => {
          await push({
            title: nft.name ?? "Unnamed",
            componentId: NAV_COMPONENT_NFT_DETAIL,
            componentProps: {
              data: nft,
              connectionUrl,
            },
          });
        }}
      />
    </YStack>
  );
}

const _NoCollectiblesLabel = () => {
  const { t } = useTranslation();
  return (
    <YStack padding="$4" flex={1} justifyContent="center" alignItems="center">
      <EmptyState
        verticallyCentered
        icon={(props: any) => <ImageIcon {...props} />}
        title={t("no_nfts.title")}
        subtitle={t("no_nfts.subtitle")}
      />
    </YStack>
  );
};

const _Loader = () => (
  <YStack>
    <_LoadingRow
      top
      bottom
      style={{
        paddingTop: 12,
        paddingBottom: 12,
      }}
      containerStyle={{
        background: "none",
        border: "none",
        marginTop: 16,
      }}
      itemsPerRow={2}
    />
    <_LoadingRow
      top
      bottom
      style={{
        paddingTop: 12,
        paddingBottom: 12,
      }}
      containerStyle={{
        background: "none",
        border: "none",
        marginTop: 16,
      }}
      itemsPerRow={2}
    />
  </YStack>
);

const _LoadingRow = function ({
  bottom,
  containerStyle,
  itemsPerRow,
  style,
  top,
}: {
  bottom?: boolean;
  containerStyle?: CSSProperties;
  itemsPerRow: number;
  style?: CSSProperties;
  top?: boolean;
}) {
  const theme = useTheme();
  const items = new Array(itemsPerRow).fill(null);

  return (
    <CustomCard
      style={containerStyle}
      top={top ?? false}
      bottom={bottom ?? false}
    >
      <div
        style={{
          display: "flex",
          height: "191.5px",
          justifyContent: "space-between",
          flex: "0 0 auto",
          paddingLeft: "12px",
          paddingRight: "12px",
          ...style,
        }}
      >
        {items.map(() => {
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                marginTop: "6px",
              }}
            >
              <div
                style={{
                  width: "153.5px",
                  height: `153.5px`,
                  position: "relative",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <Skeleton
                  style={{
                    backgroundColor: theme.baseBackgroundL1.val,
                    width: "153.5px",
                    height: `153.5px`,
                    transform: "none",
                    transformOrigin: "none",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    height: "26px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Skeleton
                    style={{
                      backgroundColor: theme.baseBackgroundL1.val,
                      width: "100px",
                      height: `10.5px`,
                      transform: "none",
                      transformOrigin: "none",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </CustomCard>
  );
};

const CustomCard = styled("div")(
  () =>
    ({ top, bottom }: { top: boolean; bottom: boolean }) => ({
      position: "relative",
      backgroundColor: "inherit",
      marginLeft: "12px",
      marginRight: "12px",
      overflow: "hidden",
      borderLeft: "hotpink",
      borderRight: "hotpink",
      background: "hotpink",
      ...(top
        ? {
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
            borderTop: "hotpink",
            minHeight: "12px",
          }
        : {}),
      ...(bottom
        ? {
            borderBottomLeftRadius: "12px",
            borderBottomRightRadius: "12px",
            borderBottom: "hotpink",
            marginBottom: "12px",
            minHeight: "12px",
          }
        : {}),
    })
);
