import { useState, useEffect } from "react";
import { BigNumber } from "ethers";
import { PublicKey } from "@solana/web3.js";
import { Typography, IconButton, Popover } from "@mui/material";
import { Whatshot, CallMade } from "@mui/icons-material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useCustomTheme } from "@coral-xyz/themes";
import {
  nftMetadata,
  useBackgroundClient,
  useDecodedSearchParams,
  useAnchorContext,
  useLoader,
  useEthereumConnectionUrl,
  useEthereumExplorer,
  useSolanaCtx,
  useEthereumCtx,
  useSolanaConnectionUrl,
  useSolanaExplorer,
} from "@coral-xyz/recoil";
import {
  explorerNftUrl,
  toTitleCase,
  Blockchain,
  Solana,
  confirmTransaction,
  getLogger,
  UI_RPC_METHOD_NAVIGATION_TO_ROOT,
} from "@coral-xyz/common";
import { PrimaryButton, SecondaryButton, NegativeButton } from "../../common";
import {
  useDrawerContext,
  WithDrawer,
  CloseButton,
} from "../../common/Layout/Drawer";
import {
  NavStackEphemeral,
  NavStackScreen,
} from "../../common/Layout/NavStack";
import { SendSolanaConfirmationCard } from "../Balances/TokensWidget/Solana";
import { SendEthereumConfirmationCard } from "../Balances/TokensWidget/Ethereum";
import {
  useIsValidAddress,
  Sending,
  Error as ErrorConfirmation,
} from "../Balances/TokensWidget/Send";
import { ApproveTransactionDrawer } from "../../common/ApproveTransactionDrawer";
import { List, ListItem } from "../../common/List";
import { ProxyImage } from "../../common/ProxyImage";
import { TextInput } from "../../common/Inputs";

const logger = getLogger("app-extension/nft-detail");

export function NftsDetail({ nftId }: { nftId: string }) {
  const [nfts] = useLoader(nftMetadata, new Map());
  const nft = nfts.get(nftId);

  // Hack: needed because this is undefined due to framer-motion animation.
  if (!nftId) {
    return <></>;
  }

  // TODO: this is hit when the NFT has been transferred out and
  //       the user re-opens the app to the old url which is no longer
  //       valid.
  //
  //       Should probably just pop the stack here or redirect.
  if (!nft) {
    return <></>;
  }

  return (
    <div
      style={{
        paddingLeft: "16px",
        paddingRight: "16px",
      }}
    >
      <Image nft={nft} />
      <Description nft={nft} />
      <SendButton nft={nft} />
      {nft.attributes && <Attributes nft={nft} />}
    </div>
  );
}

function Image({ nft }: { nft: any }) {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "343px",
        display: "flex",
        alignItems: "center",
      }}
    >
      <ProxyImage
        style={{
          width: "100%",
          borderRadius: "8px",
        }}
        src={nft.imageUrl}
        onError={(event: any) => (event.currentTarget.style.display = "none")}
      />
    </div>
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

function SendButton({ nft }: { nft: any }) {
  const [openDrawer, setOpenDrawer] = useState(false);
  const send = () => {
    setOpenDrawer(true);
  };
  return (
    <>
      <PrimaryButton
        style={{
          marginBottom: "24px",
          marginTop: "24px",
        }}
        onClick={() => send()}
        label={"Send"}
      />
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
  const {
    isValidAddress,
    isErrorAddress,
    isFreshAddress: _,
  } = useIsValidAddress(
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
    <div>
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
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const searchParams = useDecodedSearchParams();
  const [nfts] = useLoader(nftMetadata, new Map());
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
  const nft: any = nfts.get(searchParams.props.nftId);

  const isEthereum = nft && nft.contractAddress;

  const explorer = isEthereum ? useEthereumExplorer() : useSolanaExplorer();

  const connectionUrl = isEthereum
    ? useEthereumConnectionUrl()
    : useSolanaConnectionUrl();

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
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        PaperProps={{
          style: {
            background: theme.custom.colors.nav,
          },
        }}
      >
        <div
          style={{
            padding: "4px",
          }}
        >
          <List
            style={{
              margin: 0,
            }}
          >
            <ListItem
              style={{
                width: "100%",
                height: "30px",
              }}
              isFirst={true}
              isLast={isEthereum}
              onClick={() => {
                const url = explorerNftUrl(explorer, nft, connectionUrl);
                window.open(url, "_blank");
              }}
            >
              <Typography
                style={{
                  fontSize: "14px",
                }}
              >
                View on Explorer
              </Typography>
              <CallMade
                style={{
                  color: theme.custom.colors.secondary,
                }}
              />
            </ListItem>
            {!isEthereum && (
              <ListItem
                style={{
                  width: "100%",
                  height: "30px",
                }}
                isLast={true}
                onClick={() => onBurn()}
              >
                <Typography
                  style={{
                    fontSize: "14px",
                    color: theme.custom.colors.negative,
                  }}
                >
                  Burn Token
                </Typography>
              </ListItem>
            )}
          </List>
        </div>
      </Popover>
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
    address: nft.publicKey,
    logo: nft.imageUrl,
    mint: nft.mint,
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
