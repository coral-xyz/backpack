import type { NftCollection } from "@coral-xyz/common";
import {
  NAV_COMPONENT_NFT_COLLECTION,
  UNKNOWN_NFT_ICON_SRC,
} from "@coral-xyz/common";
import { ProxyImage } from "@coral-xyz/react-common";
import {
  nftsByIds,
  useActiveWallet,
  useBlockchainConnectionUrl,
  useNavigation,
} from "@coral-xyz/recoil";
import { HOVER_OPACITY, styles, useCustomTheme } from "@coral-xyz/themes";
import { Button, MenuItem, Typography } from "@mui/material";
import { useRecoilValue } from "recoil";

import { RightClickMenu } from "../../common/Layout/RightClickMenu";

const useStyles = styles(() => ({
  button: {
    "&:hover": {
      opacity: HOVER_OPACITY,
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

export function CollectionCard({ collection }: { collection: NftCollection }) {
  const activeWallet = useActiveWallet();
  const connectionUrl = useBlockchainConnectionUrl(activeWallet.blockchain);
  const classes = useStyles();
  const { push } = useNavigation();
  const theme = useCustomTheme();
  const collectionDisplayNftIds: {
    publicKey: string;
    nftId: string;
  }[] = collection.itemIds.map((nftId) => ({
    publicKey: activeWallet.publicKey,
    nftId,
  }));

  collectionDisplayNftIds.length = Math.min(collectionDisplayNftIds.length, 4);

  const collectionDisplayNfts = useRecoilValue(
    nftsByIds({
      nftIds: collectionDisplayNftIds,
      blockchain: activeWallet.blockchain,
    })
  );

  const paddedCollectionDisplayNfts = [
    ...collectionDisplayNfts,
    null,
    null,
    null,
    null,
  ];
  paddedCollectionDisplayNfts.length = 4;

  if (!collectionDisplayNfts) {
    return null;
  }

  const nft = collectionDisplayNfts[0];

  const openCollection = () => {
    push({
      title: nft.collectionName,
      componentId: NAV_COMPONENT_NFT_COLLECTION,
      componentProps: {
        id: collection.id,
        publicKey: activeWallet.publicKey,
        connectionUrl,
      },
    });
  };

  return (
    <RightClickMenu
      renderItems={(_close) => (
        <MenuItem onClick={openCollection}>View Items</MenuItem>
      )}
    >
      <>
        <Button
          className={classes.button}
          onClick={openCollection}
          disableRipple
          style={{
            textTransform: "none",
            padding: "4px",
            borderRadius: "8px",
            position: "relative",
            overflow: "hidden",
            minWidth: "153.5px",
            minHeight: "153.5px",
            height: "100%",
            width: "100%",
            aspectRatio: "1",
            display: "flex",
            flexDirection: "column",
            background: theme.custom.colors.background,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              height: "100%",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            {paddedCollectionDisplayNfts.map((nft, i) => {
              return (
                <div
                  key={nft?.id ?? i}
                  style={{
                    position: "relative",
                    width: "50%",
                    height: "50%",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "3px",
                      right: "3px",
                      bottom: "3px",
                      left: "3px",
                      overflow: "hidden",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {nft ? (
                        <ProxyImage
                          style={{
                            width: "100%",
                          }}
                          loadingStyles={{
                            height: "100%",
                          }}
                          removeOnError
                          src={nft.imageUrl}
                          onError={(e) => {
                            e.currentTarget.src = UNKNOWN_NFT_ICON_SRC;
                          }}
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Typography
            onClick={openCollection}
            component="div"
            style={{
              display: "flex",
              justifyContent: "flex-start",
              fontSize: "14px",
              color: theme.custom.colors.fontColor,
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              cursor: "pointer",
              padding: "8px 8px 8px 0px",
              flexGrow: 1,
            }}
          >
            <div
              style={{
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              {nft.collectionName}
            </div>
            {collection.itemIds.length > 0 ? (
              <span
                style={{
                  marginLeft: "8px",
                  color: theme.custom.colors.secondary,
                }}
              >
                {collection.itemIds.length}
              </span>
            ) : null}
          </Typography>
        </div>
      </>
    </RightClickMenu>
  );
}
