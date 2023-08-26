import type { MouseEvent } from "react";
import { useState } from "react";
import type * as anchor from "@coral-xyz/anchor";
import type { Nft } from "@coral-xyz/common";
import {
  NAV_COMPONENT_NFT_DETAIL,
  UNKNOWN_NFT_ICON_SRC,
} from "@coral-xyz/common";
import { AppsColorIcon, ProxyImage } from "@coral-xyz/react-common";
import {
  chatByCollectionId,
  chatByNftId,
  collectibleXnft,
  madLadGold,
  useActiveWallet,
  useBlockchainConnectionUrl,
  useNavigation,
  useOpenPlugin,
} from "@coral-xyz/recoil";
import { HOVER_OPACITY, styles, useCustomTheme } from "@coral-xyz/themes";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Button, IconButton, MenuItem, Typography } from "@mui/material";
import { useRecoilValue, useRecoilValueLoadable } from "recoil";

import { RightClickMenu } from "../../common/Layout/RightClickMenu";
import PopoverMenu from "../../common/PopoverMenu";

import { useOpenChat } from "./NftDetail";
import { SendDrawer } from "./SendDrawer";

const useStyles = styles((theme) => ({
  xnftIcon: {
    background: theme.custom.colors.nav,
    color: theme.custom.colors.fontColor,
    borderRadius: "24px",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    overflow: "hidden",
    width: "32px",
    flexWrap: "nowrap",
    transition: "width 100ms 200ms ease-out",
    "& .appIcon": {
      transition: "transform 300ms ease-out",
    },
  },
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

export function NFTCard({
  nft,
  subtitle,
  showCollectionChat,
}: {
  nft: Nft;
  subtitle?: {
    length: number;
    name: string;
  };
  showCollectionChat?: boolean;
}) {
  const activeWallet = useActiveWallet();
  const connectionUrl = useBlockchainConnectionUrl(activeWallet.blockchain);
  const { push } = useNavigation();
  const openPlugin = useOpenPlugin();
  const whitelistedNftChat = useRecoilValue(
    chatByNftId({
      publicKey: activeWallet.publicKey,
      nftId: nft.id,
      connectionUrl,
    })
  );
  const whitelistedCollectionChat = useRecoilValue(
    chatByCollectionId(nft.metadataCollectionId)
  );
  const openChat = useOpenChat();

  const { contents, state } = useRecoilValueLoadable(
    collectibleXnft(
      nft ? { collection: nft.metadataCollectionId, mint: nft.mint } : null
    )
  );

  if (!nft) {
    return null;
  }

  const chat =
    whitelistedNftChat ?? showCollectionChat ? whitelistedCollectionChat : null;

  const xnft = (state === "hasValue" && contents) || null;

  const onOpenXnft = (e: MouseEvent) => {
    e.stopPropagation();
    if (xnft) {
      openPlugin(xnft + "/" + nft.mint);
    }
  };

  const openDetails = async () => {
    await push({
      title: nft.name,
      componentId: NAV_COMPONENT_NFT_DETAIL,
      componentProps: {
        nftId: nft.id,
        publicKey: activeWallet.publicKey,
        connectionUrl,
      },
    });
  };

  const onOpenChat = async (e: any) => {
    await openChat(chat, nft.mint!);
    e.stopPropagation();
  };

  return (
    <SendDrawer nft={nft}>
      {(openDrawer) => (
        <RightClickMenu
          renderItems={(closeMenu) => (
            <NftRightClickActionMenu
              onOpenDetails={openDetails}
              onOpenChat={chat ? onOpenChat : undefined}
              onOpenXnft={xnft ? onOpenXnft : undefined}
              onOpenSend={openDrawer}
              closeMenu={closeMenu}
            />
          )}
        >
          <>
            <NftCardButton
              onClick={xnft ? onOpenXnft : openDetails}
              nft={nft}
              isXnft={!!xnft}
            />
            <NftCardFooter
              nft={nft}
              subtitle={subtitle}
              onOpenDetails={openDetails}
              onOpenChat={chat ? onOpenChat : undefined}
              onOpenXnft={xnft ? onOpenXnft : undefined}
              onOpenSend={openDrawer}
            />
          </>
        </RightClickMenu>
      )}
    </SendDrawer>
  );
}

function NftCardButton({
  nft,
  isXnft,
  onClick,
}: {
  nft: any;
  isXnft: boolean;
  onClick: (e: MouseEvent) => void;
}) {
  const classes = useStyles();
  const theme = useCustomTheme();
  return (
    <Button
      className={classes.button}
      onClick={onClick}
      disableRipple
      style={{
        textTransform: "none",
        padding: 0,
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
      <ProxyImage
        className="nftImage"
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
      {/*
          This is ok to because the gold query will just return error if it's a fake collection.
          Would still be nice to do this check in a more robust way.
        */}
      {nft.collectionName === "Mad Lads" ? <MadLadsGold nft={nft} /> : null}
      <div
        style={{
          width: "100%",
          position: "absolute",
          left: 0,
          bottom: 8,
          zIndex: 2,
          display: "flex",
          justifyContent: "flex-start",
          padding: "0 8px",
          gap: "6px",
        }}
      >
        {isXnft ? (
          <div className={`${classes.xnftIcon} xnftIcon`}>
            <AppsColorIcon
              className="appIcon"
              style={{
                width: "16px",
                height: "16px",
                margin: "8px",
                flexShrink: 0,
              }}
            />
            <Typography
              sx={{
                flexShrink: 0,
                width: "100px",
              }}
            >
              Open xNFT
            </Typography>
          </div>
        ) : null}
      </div>
    </Button>
  );
}

function MadLadsGold({ nft }: { nft: Nft }) {
  const { contents, state } = useRecoilValueLoadable(madLadGold(nft.mint!));
  if (state === "hasError") {
    return null;
  }
  return (
    <div
      style={{
        width: "100%",
        position: "absolute",
        left: 0,
        top: 8,
        zIndex: 2,
        display: "flex",
        justifyContent: "flex-start",
        padding: "0 8px",
        gap: "6px",
      }}
    >
      {state === "hasValue" && contents.isStaked ? (
        <>
          <Typography
            style={{
              color: "#000",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            STAKED
          </Typography>
          {/*<Gold balance={contents.goldPoints} />*/}
        </>
      ) : null}
    </div>
  );
}

/*
function Gold({ balance }: { balance: anchor.BN }) {
  // TODO: render gold nicely.
  return null;
}
*/

function NftCardFooter({
  nft,
  subtitle,
  onOpenDetails,
  onOpenChat,
  onOpenXnft,
  onOpenSend,
}: {
  nft: any;
  subtitle?: {
    length: number;
    name: string;
  };
  onOpenDetails: () => Promise<void>;
  onOpenChat?: (e: any) => Promise<void>;
  onOpenXnft?: (e: MouseEvent) => void;
  onOpenSend: () => void;
}) {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        padding: "0px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <Typography
        onClick={onOpenDetails}
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
          {subtitle?.name ?? nft.name}
        </div>
        {subtitle?.length ?? 0 > 1 ? (
          <span
            style={{
              marginLeft: "8px",
              color: theme.custom.colors.secondary,
            }}
          >
            {subtitle?.length ?? ""}
          </span>
        ) : null}
      </Typography>
      <NftMoreInfoActionMenu
        onOpenDetails={onOpenDetails}
        onOpenChat={onOpenChat}
        onOpenXnft={onOpenXnft}
        onOpenSend={onOpenSend}
      />
    </div>
  );
}

function NftRightClickActionMenu({
  onOpenChat,
  onOpenXnft,
  onOpenDetails,
  onOpenSend,
  closeMenu,
}: {
  onOpenChat?: (e: any) => Promise<void>;
  onOpenXnft?: (e: MouseEvent) => void;
  onOpenDetails: () => void;
  onOpenSend: () => void;
  closeMenu: () => void;
}) {
  return (
    <>
      {onOpenXnft ? <MenuItem onClick={onOpenXnft}>Open xNFT</MenuItem> : null}
      {onOpenChat ? (
        <MenuItem
          onClick={async (e) => {
            closeMenu();
            await onOpenChat(e);
          }}
        >
          Chat
        </MenuItem>
      ) : null}
      <MenuItem sx={{ width: "100px" }} onClick={onOpenDetails}>
        View
      </MenuItem>
      <MenuItem
        onClick={() => {
          closeMenu();
          onOpenSend();
        }}
      >
        Send
      </MenuItem>
    </>
  );
}

function NftMoreInfoActionMenu({
  onOpenChat,
  onOpenXnft,
  onOpenDetails,
  onOpenSend,
}: {
  onOpenDetails: () => Promise<void>;
  onOpenChat?: (e: any) => Promise<void>;
  onOpenXnft?: (e: MouseEvent) => void;
  onOpenSend: () => void;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const theme = useCustomTheme();

  return (
    <>
      <IconButton
        disableRipple
        sx={{
          padding: 0,
          height: "5px",
        }}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <MoreHorizIcon
          style={{
            color: theme.custom.colors.secondary,
          }}
        />
      </IconButton>
      <PopoverMenu.Root
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        <PopoverMenu.Group>
          {onOpenXnft ? (
            <PopoverMenu.Item onClick={onOpenXnft}>Open xNFT</PopoverMenu.Item>
          ) : null}
          <PopoverMenu.Item
            sx={{ width: "100px" }}
            onClick={async () => {
              await onOpenDetails();
              setAnchorEl(null);
            }}
          >
            View
          </PopoverMenu.Item>
          {onOpenChat ? (
            <PopoverMenu.Item
              onClick={async (e) => {
                setAnchorEl(null);
                await onOpenChat(e);
              }}
            >
              Chat
            </PopoverMenu.Item>
          ) : null}
          <PopoverMenu.Item
            onClick={() => {
              onOpenSend();
              setAnchorEl(null);
            }}
          >
            Send
          </PopoverMenu.Item>
        </PopoverMenu.Group>
      </PopoverMenu.Root>
    </>
  );
}
