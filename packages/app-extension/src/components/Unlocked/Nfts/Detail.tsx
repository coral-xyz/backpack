import { type CSSProperties, useEffect, useState } from "react";
import type { Nft } from "@coral-xyz/common";
import {
  AVATAR_BASE_URL,
  BACKEND_API_URL,
  Blockchain,
  confirmTransaction,
  explorerNftUrl,
  getLogger,
  isMadLads,
  Solana,
  TAB_MESSAGES,
  toTitleCase,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
  UI_RPC_METHOD_NAVIGATION_TO_ROOT,
  WHITELISTED_CHAT_COLLECTIONS,
} from "@coral-xyz/common";
import { storeImageInLocalStorage } from "@coral-xyz/db";
import {
  NegativeButton,
  PrimaryButton,
  ProxyImage,
  SecondaryButton,
  TextInput,
} from "@coral-xyz/react-common";
import {
  appStoreMetaTags,
  collectibleXnft,
  isOneLive,
  newAvatarAtom,
  nftById,
  useAnchorContext,
  useBackgroundClient,
  useDecodedSearchParams,
  useEthereumCtx,
  useEthereumExplorer,
  useOpenPlugin,
  useSolanaCtx,
  useSolanaExplorer,
  useUser,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
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
import {
  CloseButton,
  useDrawerContext,
  WithDrawer,
} from "../../common/Layout/Drawer";
import {
  NavStackEphemeral,
  NavStackScreen,
} from "../../common/Layout/NavStack";
import PopoverMenu from "../../common/PopoverMenu";
import { SendEthereumConfirmationCard } from "../Balances/TokensWidget/Ethereum";
import {
  Error as ErrorConfirmation,
  Sending,
  useIsValidAddress,
} from "../Balances/TokensWidget/Send";
import { SendSolanaConfirmationCard } from "../Balances/TokensWidget/Solana";

const logger = getLogger("app-extension/nft-detail");

export async function updateLocalNftPfp(nft: Nft) {
  //
  // Only show mad lads on the lock screen in full screen view.
  //
  let lockScreenImageUrl;
  if (isMadLads(nft)) {
    window.localStorage.setItem(
      "lock-screen-nft",
      JSON.stringify({
        nft,
      })
    );
    lockScreenImageUrl = nft.lockScreenImageUrl!;
  } else {
    window.localStorage.removeItem("lock-screen-nft");
    lockScreenImageUrl = nft.imageUrl;
  }
  // Note: this is probably a duplicate and we likely can just use whatever
  //       the contact storage already has instead of storing this extra
  //       image.
  await storeImageInLocalStorage(
    lockScreenImageUrl,
    "lock-screen-nft-image",
    true
  );
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
  const background = useBackgroundClient();
  const onLive = useRecoilValue(isOneLive);
  const WHITELISTED_CHAT_COLLECTIONS_WITH_OVERRIDE =
    onLive.wlCollection &&
    onLive.wlCollection !== "3PMczHyeW2ds7ZWDZbDSF3d21HBqG6yR4tGs7vP6qczfj"
      ? [
          ...WHITELISTED_CHAT_COLLECTIONS,
          {
            id: onLive.wlCollection,
            name: "Mad Lads WL",
            image: "https://mad-lads-web.vercel.app/mad_lads_logo.svg",
            collectionId: onLive.wlCollection,
            attributeMapping: {} as any,
          },
        ]
      : WHITELISTED_CHAT_COLLECTIONS;

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
  //@ts-ignore
  const whitelistedChatCollection =
    WHITELISTED_CHAT_COLLECTIONS_WITH_OVERRIDE.find(
      (x) => x.collectionId === nft?.metadataCollectionId
    );
  const [chatJoined, setChatJoined] = useState(false);
  const [joiningChat, setJoiningChat] = useState(false);

  let whitelistedChatCollectionId = whitelistedChatCollection?.collectionId;

  if (whitelistedChatCollection) {
    Object.keys(whitelistedChatCollection?.attributeMapping || {}).forEach(
      (attrName) => {
        if (
          !nft?.attributes?.find(
            (x) =>
              x.traitType === attrName &&
              x.value ===
                whitelistedChatCollection?.attributeMapping?.[attrName]
          )
        ) {
          whitelistedChatCollectionId = "";
        }
      }
    );
  }

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
        {whitelistedChatCollectionId && (
          <PrimaryButton
            disabled={chatJoined || joiningChat}
            label={
              joiningChat ? "Joining" : chatJoined ? "Joined" : "Join chat"
            }
            onClick={async () => {
              setJoiningChat(true);
              await fetch(`${BACKEND_API_URL}/nft/bulk`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  publicKey: publicKey,
                  nfts: [
                    {
                      collectionId: whitelistedChatCollection?.collectionId,
                      nftId: nft?.mint,
                      centralizedGroup: whitelistedChatCollection?.id,
                    },
                  ],
                }),
              });
              setJoiningChat(false);
              background.request({
                method: UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
                params: [TAB_MESSAGES],
              });
              setChatJoined(true);
            }}
          />
        )}
        <SendButton
          style={
            whitelistedChatCollectionId
              ? {
                  backgroundColor: theme.custom.colors.secondaryButton,
                  color: theme.custom.colors.secondaryButtonTextColor,
                }
              : undefined
          }
          nft={nft}
        />
      </div>
      {xnft && <ApplicationButton xnft={xnft} mintAddress={nft.mint} />}
      <Description nft={nft} />
      {nft.attributes && nft.attributes.length > 0 && <Attributes nft={nft} />}
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
        removeOnError={true}
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

function SendButton({ nft, style }: { nft: any; style?: CSSProperties }) {
  const [openDrawer, setOpenDrawer] = useState(false);
  const send = () => {
    setOpenDrawer(true);
  };
  return (
    <>
      <PrimaryButton style={style} onClick={() => send()} label={"Send"} />
      <WithDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
        <div style={{ height: "100%" }}>
          <NavStackEphemeral
            initialRoute={{ name: "send" }}
            options={() => ({
              title: nft.name ? `${nft.name} / Send` : "Send",
            })}
            navButtonLeft={<CloseButton onClick={() => setOpenDrawer(false)} />}
          >
            <NavStackScreen
              name={"send"}
              component={() => <SendScreen nft={nft} />}
            />
          </NavStackEphemeral>
        </div>
      </WithDrawer>
    </>
  );
}

function SendScreen({ nft }: { nft: any }) {
  const background = useBackgroundClient();
  const { close } = useDrawerContext();
  const { provider: solanaProvider } = useAnchorContext();
  const ethereumCtx = useEthereumCtx();
  const [destinationAddress, setDestinationAddress] = useState("");
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
            <TextInput
              autoFocus
              placeholder={`Recipient's ${toTitleCase(nft.blockchain)} Address`}
              value={destinationAddress}
              setValue={(e) => setDestinationAddress(e.target.value)}
              error={isErrorAddress}
              inputProps={{
                name: "to",
              }}
            />
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
              label={"Cancel"}
            />
            <PrimaryButton
              disabled={!isValidAddress}
              onClick={() => setOpenConfirm(true)}
              label={"Next"}
            />
          </div>
        </div>
      </div>
      <ApproveTransactionDrawer
        openDrawer={openConfirm}
        setOpenDrawer={setOpenConfirm}
      >
        {nft.blockchain === Blockchain.SOLANA && (
          <SendSolanaConfirmationCard
            token={{
              address: nft.publicKey,
              logo: nft.imageUrl,
              decimals: 0, // Are there any NFTs that don't use decimals 0?
              mint: nft.mint,
            }}
            destinationAddress={destinationAddress}
            amount={BigNumber.from(1)}
            onComplete={() => setWasSent(true)}
          />
        )}
        {nft.blockchain === Blockchain.ETHEREUM && (
          <SendEthereumConfirmationCard
            token={{
              logo: nft.imageUrl,
              decimals: 0, // Are there any NFTs that don't use decimals 0?
              address: nft.contractAddress,
              tokenId: nft.tokenId,
            }}
            destinationAddress={destinationAddress}
            amount={BigNumber.from(1)}
            onComplete={() => setWasSent(true)}
          />
        )}
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
  const { username } = useUser();
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

  const explorer = isEthereum ? useEthereumExplorer() : useSolanaExplorer();

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
      await updateLocalNftPfp(nft);
      setNewAvatar({ id, url: nft.imageUrl });

      //
      // Cleanup component state.
      //
      setAnchorEl(null);
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
      const _signature = await Solana.burnAndCloseNft(solanaCtx, {
        solDestination: solanaCtx.walletPublicKey,
        mint: new PublicKey(nft.mint.toString()),
        amount,
      });
      setSignature(_signature);
      setState("sending");

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
      titleOverride={"Burning"}
    />
  ) : state === "confirmed" ? (
    <Sending
      blockchain={Blockchain.SOLANA}
      isComplete={true}
      amount={BigNumber.from(1)}
      token={token}
      signature={signature!}
      titleOverride={"Burnt"}
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
