import type { CSSProperties } from "react";
import {
  LOCKABLE_COLLECTIONS,
  UI_RPC_METHOD_TOGGLE_SHOW_ALL_COLLECTIBLES,
} from "@coral-xyz/common";
import {
  type CollectibleGroup,
  CollectibleGroupView as _CollectibleGroupView,
  Collectibles as _Collectibles,
  LockCollectionToggle,
  type ProviderId,
  type ResponseCollectible,
} from "@coral-xyz/data-components";
import { useTranslation } from "@coral-xyz/i18n";
import { EmptyState, ImageIcon } from "@coral-xyz/react-common";
import { useActiveWallet, useBackgroundClient } from "@coral-xyz/recoil";
import { useTheme, YStack } from "@coral-xyz/tamagui";
import { Skeleton } from "@mui/material";
import styled from "@mui/system/styled";
import { useNavigation } from "@react-navigation/native";

import { Routes as SendCollectibleRoutes } from "../../../refactor/navigation/SendCollectibleNavigator";
import { Routes } from "../../../refactor/navigation/WalletsNavigator";

export { CollectibleOptionsButton } from "./Options";

export function Collectibles() {
  const activeWallet = useActiveWallet();
  const navigation = useNavigation<any>();

  const onOpenSendDrawer = (_nft: ResponseCollectible) => {
    navigation.push(Routes.SendCollectibleNavigator, {
      screen: SendCollectibleRoutes.SendCollectibleAddressSelectScreen,
      params: { nftId: _nft.id },
    });
  };

  return (
    <_Collectibles
      address={activeWallet.publicKey}
      providerId={activeWallet.blockchain.toUpperCase() as ProviderId}
      EmptyStateComponent={_NoCollectiblesLabel}
      fetchPolicy="cache-and-network"
      loaderComponent={<_Loader />}
      onCardClick={async (group) => {
        if (group.data.length === 1) {
          navigation.push(Routes.CollectiblesDetailScreen, {
            title: group.collection,
            data: group.data[0],
          });
        } else {
          navigation.push(Routes.CollectiblesCollectionScreen, {
            title: group.collection,
            data: group.data.reduce<CollectibleGroup[]>((acc, curr) => {
              acc.push({
                collection: curr.name || "Unknown",
                data: [curr],
                whitelisted: curr.whitelisted,
              });
              return acc;
            }, []),
          });
        }
      }}
      onOpenSendDrawer={onOpenSendDrawer}
      onViewClick={async (data) => {
        navigation.push(Routes.CollectiblesDetailScreen, {
          title: data.name || "Unnamed",
          data,
        });
      }}
    />
  );
}

export function CollectibleGroupView({ data }: { data: CollectibleGroup[] }) {
  const navigation = useNavigation<any>();
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
          navigation.push(Routes.CollectiblesDetailScreen, {
            title: collection,
            data: data[0],
          });
        }}
        onViewClick={async (data: ResponseCollectible) => {
          navigation.push(Routes.CollectiblesDetailScreen, {
            title: data.name ?? "Unnamed",
            data,
          });
        }}
      />
    </YStack>
  );
}

function _NoCollectiblesLabel({ hasHiddenItems }: { hasHiddenItems: boolean }) {
  const { t } = useTranslation();
  const background = useBackgroundClient();

  return (
    <YStack padding="$4" flex={1} justifyContent="center" alignItems="center">
      <EmptyState
        verticallyCentered
        buttonText={hasHiddenItems ? t("collections_filter.show") : undefined}
        icon={(props: any) => <ImageIcon {...props} />}
        title={t("no_nfts.title")}
        subtitle={t("no_nfts.subtitle")}
        onClick={async () => {
          if (hasHiddenItems) {
            // ph101pp todo
            await background.request({
              method: UI_RPC_METHOD_TOGGLE_SHOW_ALL_COLLECTIBLES,
              params: [],
            });
          }
        }}
      />
    </YStack>
  );
}

const _Loader = () => (
  <YStack>
    <_LoadingRow
      style={{
        paddingTop: 12,
      }}
      containerStyle={{
        background: "none",
        border: "none",
      }}
      itemsPerRow={2}
    />
    <_LoadingRow
      style={{
        paddingTop: 12,
      }}
      containerStyle={{
        background: "none",
        border: "none",
      }}
      itemsPerRow={2}
    />
  </YStack>
);

function _LoadingRow({
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
          flex: 1,
          justifyContent: "space-between",
          marginTop: "4px",
          ...style,
        }}
      >
        {items.map((_, index) => {
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
              key={index}
            >
              <div
                style={{
                  width: `165px`,
                  height: `165px`,
                  position: "relative",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <Skeleton
                  style={{
                    backgroundColor: theme.baseBackgroundL1.val,
                    width: `165px`,
                    height: `165px`,
                    transform: "none",
                    transformOrigin: "none",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "4px",
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
                      width: "140px",
                      height: `14px`,
                      transform: "none",
                      transformOrigin: "none",
                      marginTop: "4px",
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
}

const CustomCard = styled("div")(
  () =>
    ({ top, bottom }: { top: boolean; bottom: boolean }) => ({
      position: "relative",
      backgroundColor: "inherit",
      marginLeft: "15px",
      marginRight: "15px",
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
