import React, { type CSSProperties, useEffect, useState } from "react";
import type { Nft } from "@coral-xyz/common";
import {
  AVATAR_BASE_URL,
  BACKEND_API_URL,
  Blockchain,
  confirmTransaction,
  explorerNftUrl,
  getLogger,
  isMadLads,
  NAV_COMPONENT_MESSAGE_GROUP_CHAT,
  Solana,
  TAB_MESSAGES,
  toTitleCase,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
  UI_RPC_METHOD_NAVIGATION_TO_ROOT,
} from "@coral-xyz/common";
import { LocalImageManager, refreshGroups } from "@coral-xyz/db";
import {
  NegativeButton,
  PrimaryButton,
  ProxyImage,
  SecondaryButton,
  TextInput,
} from "@coral-xyz/react-common";
import {
  appStoreMetaTags,
  chatByNftId,
  collectibleXnft,
  newAvatarAtom,
  nftById,
  useActiveWallet,
  useAnchorContext,
  useBackgroundClient,
  useDecodedSearchParams,
  useEthereumCtx,
  useEthereumExplorer,
  useNavigation,
  useOpenPlugin,
  useSolanaCtx,
  useSolanaExplorer,
  useUser,
} from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { Whatshot } from "@mui/icons-material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Button, IconButton, Typography } from "@mui/material";
import { PublicKey } from "@solana/web3.js";
import { BigNumber } from "ethers";
import {
  useRecoilValue,
  useRecoilValueLoadable,
  useSetRecoilState,
} from "recoil";

import { ApproveTransactionDrawer } from "../../common/ApproveTransactionDrawer";
import { CopyablePublicKey } from "../../common/CopyablePublicKey";
import {
  CloseButton,
  useDrawerContext,
  WithDrawer,
} from "../../common/Layout/Drawer";
import {
  NavStackEphemeral,
  NavStackScreen,
  useNavigation as useNavigationEphemeral,
} from "../../common/Layout/NavStack";
import PopoverMenu from "../../common/PopoverMenu";
import type { SendData } from "../Balances/TokensWidget/AddressSelector";
import { AddressSelector } from "../Balances/TokensWidget/AddressSelector";
import { SendEthereumConfirmationCard } from "../Balances/TokensWidget/Ethereum";
import {
  Error as ErrorConfirmation,
  Sending,
  useIsValidAddress,
} from "../Balances/TokensWidget/Send";
import { SendSolanaConfirmationCard } from "../Balances/TokensWidget/Solana";

const logger = getLogger("app-extension/nft-detail");

export function useOpenChat() {
  const { uuid } = useUser();
  const activeWallet = useActiveWallet();
  const background = useBackgroundClient();
  const { push } = useNavigation();

  return async (whitelistedChatCollection: any, mint: string) => {
    await fetch(`${BACKEND_API_URL}/nft/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publicKey: activeWallet.publicKey,
        nfts: [
          {
            collectionId: whitelistedChatCollection?.collectionId,
            nftId: mint,
            centralizedGroup: whitelistedChatCollection?.id,
          },
        ],
      }),
    });
    await refreshGroups(uuid);

    await background.request({
      method: UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
      params: [TAB_MESSAGES],
    });
    push({
      title: whitelistedChatCollection?.name,
      componentId: NAV_COMPONENT_MESSAGE_GROUP_CHAT,
      componentProps: {
        fromInbox: true,
        id: whitelistedChatCollection?.id,
        title: whitelistedChatCollection?.name,
      },
    });
  };
}

export function NftsDetail({
  publicKey,
  connectionUrl,
  nftId,
}: {
  publicKey: string;
  connectionUrl: string;
  nftId: string;
}) {
  const theme = useCustomTheme();
  const whitelistedChatCollection = useRecoilValue(
    chatByNftId({ publicKey, connectionUrl, nftId })
  );
  const openChat = useOpenChat();

  const { contents, state } = useRecoilValueLoadable(
    nftById({ publicKey, connectionUrl, nftId })
  );
  const nft = (state === "hasValue" && contents) || null;
  const { contents: xnftContents, state: xnftState } = useRecoilValueLoadable(
    collectibleXnft(
      nft ? { collection: nft.metadataCollectionId, mint: nft.mint } : null
    )
  );
  const xnft = (xnftState === "hasValue" && xnftContents) || null;
  const [chatJoined, setChatJoined] = useState(false);
  const [joiningChat, setJoiningChat] = useState(false);

  const whitelistedChatCollectionId = whitelistedChatCollection?.collectionId;

  // Hack: needed because this is undefined due to framer-motion animation.
  if (!nftId) {
    return null;
  }

  // TODO: this is hit when the NFT has been transferred out and
  //       the user re-opens the app to the old url which is no longer
  //       valid.
  //
  //       Should probably just pop the stack here or redirect.
  if (!nft) {
    return null;
  }

  return (
    <div
      style={{
        paddingLeft: "16px",
        paddingRight: "16px",
        paddingBottom: "8px",
      }}
    >
      <Image nft={nft} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          marginTop: "16px",
        }}
      >
        {whitelistedChatCollectionId ? (
          <PrimaryButton
            disabled={chatJoined || joiningChat}
            label={
              joiningChat ? "Joining" : chatJoined ? "Joined" : "Join chat"
            }
            onClick={async () => {
              setJoiningChat(true);
              await openChat(whitelistedChatCollection, nft.mint!);
              setChatJoined(true);
            }}
          />
        ) : null}
        <SendButton
          invert={whitelistedChatCollectionId !== undefined}
          // style={
          //   whitelistedChatCollectionId
          //     ? {
          //         backgroundColor: theme.custom.colors.secondaryButton,
          //         color: theme.custom.colors.secondaryButtonTextColor,
          //       }
          //     : undefined
          // }
          nft={nft}
        />
      </div>
      {xnft ? <ApplicationButton xnft={xnft} mintAddress={nft.mint} /> : null}
      <Description nft={nft} />
      {nft.attributes && nft.attributes.length > 0 ? (
        <Attributes nft={nft} />
      ) : null}
    </div>
  );
}

function Image({ nft }: { nft: any }) {
  const src = isMadLads(nft) ? nft.lockScreenImageUrl : nft.imageUrl;
  return (
    <div
      style={{
        width: "100%",
        minHeight: "343px",
        display: "flex",
        position: "relative",
        alignItems: "center",
      }}
    >
      <ProxyImage
        style={{
          width: "100%",
          borderRadius: "8px",
        }}
        loadingStyles={{
          minHeight: "343px",
        }}
        src={src}
        removeOnError
      />
    </div>
  );
}

function ApplicationButton({
  xnft,
  mintAddress,
}: {
  xnft: string;
  mintAddress?: string;
}) {
  const theme = useCustomTheme();
  const openPlugin = useOpenPlugin();
  const { contents, state } = useRecoilValueLoadable(appStoreMetaTags(xnft));

  const data = (state === "hasValue" && contents) || null;

  const handleClick = () => {
    openPlugin(xnft + "/" + mintAddress);
  };

  return (
    data && (
      <div
        style={{
          marginTop: "20px",
          position: "relative",
        }}
      >
        <Typography
          style={{
            color: theme.custom.colors.secondary,
            fontWeight: 500,
            fontSize: "16px",
            lineHeight: "24px",
            marginBottom: "4px",
          }}
        >
          Application
        </Typography>
        <div
          style={{
            position: "relative",
            width: "100%",
            borderRadius: "12px",
            background: theme.custom.colors.nav,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px",
          }}
        >
          <img src={data.image} height={64} width={64} />
          <div
            style={{
              flexGrow: 1,
              whiteSpace: "nowrap",
              overflowX: "hidden",
            }}
          >
            <Typography sx={{ color: theme.custom.colors.fontColor }}>
              {data.name}
            </Typography>
            <Typography
              sx={{
                color: theme.custom.colors.fontColor3,
                fontSize: "14px",
                lineHeight: "20px",
                overflowX: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {data.description}
            </Typography>
          </div>
          <Button
            disableRipple
            sx={{
              color: theme.custom.colors.fontColor,
              background: theme.custom.colors.bg2,
              borderRadius: "12px",
            }}
            onClick={handleClick}
          >
            Open
          </Button>
        </div>
      </div>
    )
  );
}

function Description({ nft }: { nft: any }) {
  const theme = useCustomTheme();

  return (
    <div
      style={{
        marginTop: "20px",
      }}
    >
      <Typography
        style={{
          color: theme.custom.colors.secondary,
          fontWeight: 500,
          fontSize: "16px",
          lineHeight: "24px",
          marginBottom: "4px",
        }}
      >
        Description
      </Typography>
      <Typography
        style={{
          color: theme.custom.colors.fontColor,
          fontWeight: 500,
          fontSize: "16px",
        }}
      >
        {nft.description}
      </Typography>
    </div>
  );
}

function SendButton({
  invert,
  nft,
  style,
}: {
  invert: boolean;
  nft: any;
  style?: CSSProperties;
}) {
  const [openDrawer, setOpenDrawer] = useState(false);
  const send = () => {
    setOpenDrawer(true);
  };
  return (
    <>
      <PrimaryButton
        invert={invert}
        style={style}
        onClick={() => send()}
        label="Send"
      />
      <WithDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
        <div style={{ height: "100%" }}>
          <NavStackEphemeral
            initialRoute={{ name: "select-address" }}
            options={() => ({
              title: nft.name ? `${nft.name} / Send` : "Send",
            })}
            navButtonLeft={<CloseButton onClick={() => setOpenDrawer(false)} />}
          >
            <NavStackScreen
              name="send"
              component={(props) => <SendScreen {...props} nft={nft} />}
            />

            <NavStackScreen
              name="select-address"
              component={() => <NftAddressSelector nft={nft} />}
            />
          </NavStackEphemeral>
        </div>
      </WithDrawer>
    </>
  );
}

function NftAddressSelector({ nft }: { nft: any }) {
  const { push } = useNavigationEphemeral();

  return (
    <div>
      <AddressSelector
        onSelect={(sendData: SendData) => {
          push("send", {
            to: sendData,
          });
        }}
        blockchain={nft.blockchain}
        name={nft.name}
      />
    </div>
  );
}

const useStyles = styles((theme) => ({
  horizontalCenter: {
    display: "flex",
    justifyContent: "center",
  },
}));

function SendScreen({ nft, to }: { nft: any; to: SendData }) {
  const background = useBackgroundClient();
  const { close } = useDrawerContext();
  const { provider: solanaProvider } = useAnchorContext();
  const classes = useStyles();
  const ethereumCtx = useEthereumCtx();
  const destinationAddress = to.address;
  const [openConfirm, setOpenConfirm] = useState(false);
  const [wasSent, setWasSent] = useState(false);
  const { isValidAddress, isErrorAddress } = useIsValidAddress(
    nft.blockchain,
    destinationAddress,
    solanaProvider.connection,
    ethereumCtx.provider
  );

  useEffect(() => {
    (async () => {
      // If the modal is being closed and the NFT has been sent elsewhere then
      // navigate back to the nav root because the send screen is no longer
      // valid as the wallet no longer possesses the NFT.
      if (!openConfirm && wasSent) {
        await background.request({
          method: UI_RPC_METHOD_NAVIGATION_TO_ROOT,
          params: [],
        });
      }
    })();
  }, [openConfirm, wasSent, background]);

  return (
    <>
      <div
        style={{
          paddingLeft: "16px",
          paddingRight: "16px",
          height: "100%",
        }}
      >
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <Image nft={nft} />
            <div className={classes.horizontalCenter} style={{ marginTop: 4 }}>
              Sending to
            </div>
            <div className={classes.horizontalCenter} style={{ marginTop: 4 }}>
              <CopyablePublicKey publicKey={to?.address} />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: "18px",
              paddingBottom: "16px",
            }}
          >
            <SecondaryButton
              style={{
                marginRight: "8px",
              }}
              onClick={close}
              label="Cancel"
            />
            <PrimaryButton
              disabled={!isValidAddress}
              onClick={() => setOpenConfirm(true)}
              label="Next"
            />
          </div>
        </div>
      </div>
      <ApproveTransactionDrawer
        openDrawer={openConfirm}
        setOpenDrawer={setOpenConfirm}
      >
        {nft.blockchain === Blockchain.SOLANA ? (
          <SendSolanaConfirmationCard
            token={{
              address: nft.publicKey,
              logo: nft.imageUrl,
              decimals: 0, // Are there any NFTs that don't use decimals 0?
              mint: nft.mint,
            }}
            destinationUser={
              (to && to.uuid && to.username && to.image
                ? to
                : undefined) as React.ComponentProps<
                typeof SendSolanaConfirmationCard
              >["destinationUser"]
            }
            destinationAddress={destinationAddress}
            amount={BigNumber.from(1)}
            onComplete={() => setWasSent(true)}
          />
        ) : null}
        {nft.blockchain === Blockchain.ETHEREUM ? (
          <SendEthereumConfirmationCard
            token={{
              logo: nft.imageUrl,
              decimals: 0, // Are there any NFTs that don't use decimals 0?
              address: nft.contractAddress,
              tokenId: nft.tokenId,
            }}
            destinationUser={
              (to && to.uuid && to.username && to.image
                ? to
                : undefined) as React.ComponentProps<
                typeof SendEthereumConfirmationCard
              >["destinationUser"]
            }
            destinationAddress={destinationAddress}
            amount={BigNumber.from(1)}
            onComplete={() => setWasSent(true)}
          />
        ) : null}
      </ApproveTransactionDrawer>
    </>
  );
}

function Attributes({ nft }: { nft: any }) {
  const theme = useCustomTheme();

  return (
    <div
      style={{
        marginTop: 24,
      }}
    >
      <Typography style={{ color: theme.custom.colors.secondary }}>
        Attributes
      </Typography>
      <div
        style={{
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            marginTop: "4px",
            marginLeft: "-4px",
            marginRight: "-4px",
          }}
        >
          {nft.attributes.map((attr: { traitType: string; value: string }) => {
            return (
              <div
                key={attr.traitType}
                style={{
                  padding: "4px",
                }}
              >
                <div
                  style={{
                    borderRadius: "8px",
                    backgroundColor: theme.custom.colors.nav,
                    paddingTop: "4px",
                    paddingBottom: "4px",
                    paddingLeft: "8px",
                    paddingRight: "8px",
                  }}
                >
                  <Typography
                    style={{
                      color: theme.custom.colors.secondary,
                      fontSize: "14px",
                    }}
                  >
                    {toTitleCase(attr.traitType)}
                  </Typography>
                  <Typography
                    style={{
                      color: theme.custom.colors.fontColor,
                      fontSize: "16px",
                    }}
                  >
                    {attr.value}
                  </Typography>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function NftOptionsButton() {
  const theme = useCustomTheme();
  const background = useBackgroundClient();
  const { uuid, username } = useUser();
  const setNewAvatar = useSetRecoilState(newAvatarAtom(username));
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const searchParams = useDecodedSearchParams();
  const [wasBurnt, setWasBurnt] = useState(false);

  useEffect(() => {
    (async () => {
      // If the modal is being closed and the NFT has been burnt then navigate
      // back to the nav root because the send screen is no longer valid as the
      // wallet no longer possesses the NFT.
      if (!openDrawer && wasBurnt) {
        await background.request({
          method: UI_RPC_METHOD_NAVIGATION_TO_ROOT,
          params: [],
        });
      }
    })();
  }, [openDrawer, wasBurnt, background]);

  // @ts-ignore
  const nftId: string = searchParams.props.nftId;
  // @ts-ignore
  const publicKey: string = searchParams.props.publicKey;
  // @ts-ignore
  const connectionUrl: string = searchParams.props.connectionUrl;

  const { contents, state } = useRecoilValueLoadable(
    nftById({ publicKey, connectionUrl, nftId })
  );
  const nft = (state === "hasValue" && contents) || null;

  // @ts-ignore
  const isEthereum: boolean = nft && nft.contractAddress;

  const ethExpl = useEthereumExplorer();
  const solExpl = useSolanaExplorer();
  const explorer = isEthereum ? ethExpl : solExpl;

  const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const onClose = () => {
    setAnchorEl(null);
  };

  const onBurn = () => {
    onClose();
    setOpenDrawer(true);
  };

  const onSetPfp = async () => {
    if (nft) {
      //
      // Cleanup component state.
      //
      setAnchorEl(null);

      //
      // Store on server.
      //
      const id = `${nft.blockchain}/${
        nft.blockchain === "solana" ? nft.mint : nft.id
      }`;

      await fetch(BACKEND_API_URL + "/users/avatar", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ avatar: id }),
      });
      await fetch(`${AVATAR_BASE_URL}/${username}?bust_cache=1`);

      //
      // Store locally.
      //
      await updateLocalNftPfp(uuid, username, nft);
      setNewAvatar({ id, url: nft.imageUrl });
    }
  };

  return (
    <>
      <IconButton
        disableRipple
        style={{
          padding: 0,
        }}
        onClick={(e) => onClick(e)}
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
        onClose={onClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <PopoverMenu.Group>
          <PopoverMenu.Item
            onClick={() => {
              const url = explorerNftUrl(explorer, nft, connectionUrl);
              window.open(url, "_blank");
            }}
          >
            View on Explorer
          </PopoverMenu.Item>
          <PopoverMenu.Item onClick={onSetPfp}>Set as PFP</PopoverMenu.Item>
        </PopoverMenu.Group>
        <PopoverMenu.Group>
          <PopoverMenu.Item
            sx={{ color: `${theme.custom.colors.negative} !important` }}
            onClick={onBurn}
          >
            Burn Token
          </PopoverMenu.Item>
        </PopoverMenu.Group>
      </PopoverMenu.Root>
      <ApproveTransactionDrawer
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
      >
        <BurnConfirmationCard nft={nft} onComplete={() => setWasBurnt(true)} />
      </ApproveTransactionDrawer>
    </>
  );
}

function BurnConfirmationCard({
  nft,
  onComplete,
}: {
  nft: any;
  onComplete?: () => void;
}) {
  const [state, setState] = useState<
    "confirm" | "sending" | "confirmed" | "error"
  >("confirm");
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const solanaCtx = useSolanaCtx();
  const blockchain = Blockchain.SOLANA;

  const token = {
    logo: nft ? nft.imageUrl : "",
    mint: nft ? nft.mint : "",
    decimals: 0,
  };

  const onConfirm = async () => {
    try {
      // TODO: should use recoil for this to avoid the extra, unnecessary request.
      const amount = parseInt(
        (
          await solanaCtx.connection.getTokenAccountBalance(
            new PublicKey(nft.publicKey)
          )
        ).value.amount
      );
      setState("sending");

      const _signature = await Solana.burnAndCloseNft(solanaCtx, {
        solDestination: solanaCtx.walletPublicKey,
        mint: new PublicKey(nft.mint.toString()),
        amount,
      });
      setSignature(_signature);

      //
      // Confirm the tx.
      //
      try {
        await confirmTransaction(
          solanaCtx.connection,
          _signature,
          solanaCtx.commitment !== "confirmed" &&
            solanaCtx.commitment !== "finalized"
            ? "confirmed"
            : solanaCtx.commitment
        );
        setState("confirmed");
        if (onComplete) onComplete();
      } catch (err: any) {
        logger.error("unable to confirm NFT burn", err);
        setError(err.toString());
        setState("error");
      }
    } catch (err: any) {
      console.log("error burning NFT", err);
      setError(err);
      setState("error");
    }
  };

  return state === "confirm" ? (
    <BurnConfirmation onConfirm={onConfirm} />
  ) : state === "sending" ? (
    <Sending
      blockchain={Blockchain.SOLANA}
      isComplete={false}
      amount={BigNumber.from(1)}
      token={token}
      signature={signature!}
      titleOverride="Burning"
    />
  ) : state === "confirmed" ? (
    <Sending
      blockchain={Blockchain.SOLANA}
      isComplete
      amount={BigNumber.from(1)}
      token={token}
      signature={signature!}
      titleOverride="Burnt"
    />
  ) : (
    <ErrorConfirmation
      blockchain={blockchain}
      signature={signature!}
      error={error!.toString()}
      onRetry={() => onConfirm()}
    />
  );
}

function BurnConfirmation({ onConfirm }: { onConfirm: () => void }) {
  const theme = useCustomTheme();

  return (
    <div
      style={{
        height: "400px",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        padding: "16px",
      }}
    >
      <div
        style={{
          flex: 1,
        }}
      >
        <Whatshot
          style={{
            color: theme.custom.colors.negative,
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
            fontSize: "60px",
            marginTop: "24px",
            marginBottom: "24px",
          }}
        />
        <Typography
          style={{
            backgroundColor:
              theme.custom.colors.approveTransactionTableBackground,
            border: theme.custom.colors.borderFull,
            padding: "16px",
            color: theme.custom.colors.fontColor,
            fontSize: "20px",
            textAlign: "center",
            borderRadius: "8px",
          }}
        >
          Are you sure you want to burn this token? This action can't be undone.
        </Typography>
      </div>
      <div>
        <NegativeButton label="Confirm" onClick={() => onConfirm()} />
      </div>
    </div>
  );
}

export async function updateLocalNftPfp(
  uuid: string,
  username: string,
  nft: Nft
) {
  //
  // Only show mad lads on the lock screen in full screen view.
  //
  let lockScreenImageUrl;
  if (isMadLads(nft)) {
    window.localStorage.setItem(
      lockScreenKey(uuid),
      JSON.stringify({
        uuid,
        nft,
      })
    );
    lockScreenImageUrl = nft.lockScreenImageUrl!;
  } else {
    window.localStorage.removeItem(lockScreenKey(uuid));
    lockScreenImageUrl = nft.imageUrl;
  }
  await LocalImageManager.getInstance().storeImageInLocalStorage(
    lockScreenKeyImage(username),
    true,
    lockScreenImageUrl
  );
}

export function lockScreenKey(uuid: string) {
  return `${uuid}:lock-screen-nft:1`;
}

export function lockScreenKeyImage(username: string) {
  return `https://swr.xnfts.dev/avatars/${username}`;
}
