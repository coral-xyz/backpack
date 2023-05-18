import React, { useEffect, useState } from "react";
import {
  associatedTokenAddress,
  Blockchain,
  explorerUrl,
  SolanaProvider,
  UI_RPC_METHOD_NAVIGATION_TO_ROOT,
} from "@coral-xyz/common";
import {
  CheckIcon,
  DangerButton,
  Loading,
  PrimaryButton,
  ProxyImage,
  SecondaryButton,
  useStyles,
  UseValueLabel,
} from "@coral-xyz/react-common";
import {
  useActiveWallet,
  useAnchorContext,
  useBackgroundClient,
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
  useSolanaCtx,
} from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { Typography } from "@mui/material";
import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import { TensorSwapSDK } from "@tensor-hq/tensorswap-sdk";
import { BigNumber } from "ethers";

import { ApproveTransactionDrawer } from "../../common/ApproveTransactionDrawer";
import { CopyablePublicKey } from "../../common/CopyablePublicKey";
import { CloseButton, WithDrawer } from "../../common/Layout/Drawer";
import {
  NavStackEphemeral,
  NavStackScreen,
} from "../../common/Layout/NavStack";
import { SettingsList } from "../../common/Settings/List";
import { TokenAmountHeader } from "../../common/TokenAmountHeader";
import { Error } from "../Balances/TokensWidget/Send";

const useLocalStyles = styles((theme) => ({
  listScreenContainer: {
    padding: "0 16px 8px 16px",
  },
  inputInfoContainer: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    margin: "60px 0 75px 0",
    textAlign: "center",
  },
  priceTitleText: {
    color: theme.custom.colors.secondary,
    fontSize: "15px",
    fontWeight: 500,
    marginTop: "10px",
  },
  logoSolContainer: {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
  },
  logoSolImageContainer: {
    margin: "auto 0",
  },
  logoSolInputContainer: {
    display: "flex",
    justifyContent: "center",
    margin: "auto 0",
  },
  priceAmtText: {
    color: theme.custom.colors.secondary,
    fontSize: "15px",
    fontWeight: 500,
  },
  metadataContainer: {
    backgroundColor: theme.custom.colors.bg4, //bg2
    borderRadius: "8px",
    margin: "20px 0",
    padding: "15px",
  },
  metadataInnerContainer: {
    display: "flex",
    gap: "15px",
  },
  metadataTextContainer: {
    margin: "auto 0",
  },
  metadataNameText: {
    color: theme.custom.colors.fontColor,
    fontWeight: 500,
    fontSize: "18px",
    lineHeight: "24px",
  },
  metadataCollectionText: {
    color: theme.custom.colors.secondary,
    fontSize: "14px",
    fontWeight: 500,
    marginTop: "10px",
  },
  metadataLineDivider: {
    margin: "15px 0",
    borderColor: theme.custom.colors.secondary,
    borderWidth: "0.1px",
  },
  listScreenFooterBtnsContainer: {
    alignItems: "center",
    display: "flex",
    gap: "15px",
  },

  //confirm drawer
  confirmDrawerContainer: {
    padding: "16px",
    height: "602px",
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "column",
    paddingBottom: "24px",
  },
  confirmDrawerTitle: {
    color: theme.custom.colors.fontColor,
    fontWeight: 500,
    fontSize: "18px",
    lineHeight: "24px",
    textAlign: "center",
  },

  //sending drawer
  sendingDrawerContainer: {
    height: "450px",
  },
  sendingDrawerTitle: {
    color: theme.custom.colors.fontColor,
    fontWeight: 500,
    fontSize: "18px",
    lineHeight: "24px",
    padding: "20px",
    textAlign: "center",
  },
  SendingDrawerFooterContainer: {
    textAlign: "center",
  },
  SendingDrawerCloseOptionsContainer: {
    display: "flex",
    gap: "15px",
    padding: "20px",
  },
  ViewTxSuccessText: {
    color: theme.custom.colors.secondary,
    fontSize: "12px",
    fontWeight: 500,
    "&:hover": {
      cursor: "pointer",
    },
  },
  sendingDrawerLoadingContainer: {
    height: "20px",
    marginTop: "60px",
  },
  ViewTxLoadingText: {
    color: theme.custom.colors.secondary,
    fontSize: "12px",
    fontWeight: 500,
    textAlign: "center",
    marginTop: "50px",
    "&:hover": {
      cursor: "pointer",
    },
  },
}));

export function ListDrawer({
  children,
  nft,
  title,
}: {
  children: (openDrawer: () => void) => React.ReactElement;
  nft: any;
  title: string;
}) {
  const [openDrawer, setOpenDrawer] = useState(false);
  console.log("the nft", nft); //!REMOVE LATER
  const list = () => {
    setOpenDrawer(true);
  };
  return (
    <>
      {children(list)}
      <WithDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
        <div style={{ height: "100%" }}>
          <NavStackEphemeral
            initialRoute={{ name: "list-nft" }}
            options={() => ({
              title: title,
            })}
            navButtonLeft={<CloseButton onClick={() => setOpenDrawer(false)} />}
          >
            <NavStackScreen
              name="list-nft"
              component={(props) => (
                <ListScreen
                  {...props}
                  nft={nft}
                  closePageDrawer={() => setOpenDrawer(false)}
                />
              )}
            />
          </NavStackEphemeral>
        </div>
      </WithDrawer>
    </>
  );
}

export function ListScreen({
  nft,
  closePageDrawer,
}: {
  nft: any;
  closePageDrawer: () => void;
}) {
  const theme = useCustomTheme();
  const classes = useLocalStyles();
  const activeWallet = useActiveWallet();
  const solanaCtx = useSolanaCtx();
  const provider = useAnchorContext();
  const background = useBackgroundClient();

  const swapSdk = new TensorSwapSDK({ provider });
  const activeWalletPubKey = new web3.PublicKey(activeWallet.publicKey);

  const token = {
    address: nft?.publicKey,
    logo: nft?.imageUrl,
    decimals: 0, // Are there any NFTs that don't use decimals 0?
    mint: nft?.mint,
    name: nft?.name,
    listPrice: 500, // ! REMOVE. PLACEHOLDER
  };

  const initialListingAmtStr = "500"; /// ! DUMMY DATAS
  const listed = false; // ! DUMMY DATA

  const [openListDrawer, setOpenListDrawer] = useState(false);
  const [tensorTx, setTensorTx] = useState("");
  const [listingAmt, setListingAmt] = useState(initialListingAmtStr); //todo make sure string aren't allowed
  const [cardType, setCardType] = useState("confirm");
  const [wasListed, setWasListed] = useState(false);

  // async function simulateListingOnTensor() {
  //   setCardType("sending");
  //   //
  //   setTensorTx(
  //     "21mVjw8mGjsUCeof65VsM7hvy5q7CU68X5qzQwWGd1KHMNGPCvTchWduAVBtYrr33Qb2oHJjm2pXfomFUsFRjXgp"
  //   );
  //   setTimeout(() => {
  //     setCardType("complete"); // ! SIMULATING SUCCESS
  //   }, 5000);
  // }

  async function listOnTensor() {
    setCardType("sending");
    const nftMint = new web3.PublicKey(nft.mint);
    let tokenAcc = associatedTokenAddress(nftMint, activeWalletPubKey);
    const data = await swapSdk.list({
      owner: activeWalletPubKey,
      nftMint,
      nftSource: tokenAcc,
      // Create listing to sell for 0.1 SOL.
      price: new anchor.BN(Number(listingAmt) * web3.LAMPORTS_PER_SOL),
    });
    const txToSend = new web3.Transaction().add(...data.tx.ixs);
    // setTensorTx(txToSend.signature);
    let txSig = await SolanaProvider.signAndSendTransaction(
      solanaCtx,
      txToSend
    );
    setTensorTx(txSig);
    setCardType("complete"); // ! WHAT IF TX FAILS
  }

  async function removeListing() {
    setCardType("sending");
    const nftMint = new web3.PublicKey(nft.mint);
    let tokenAcc = associatedTokenAddress(nftMint, activeWalletPubKey);

    const data = await swapSdk.delist({
      owner: activeWalletPubKey,
      nftMint,
      //the token account for the nft
      nftDest: tokenAcc,
    });
    const txToSend = new web3.Transaction().add(...data.tx.ixs);
    let txSig = await SolanaProvider.signAndSendTransaction(
      solanaCtx,
      txToSend
    );
    setTensorTx(txSig);
    setCardType("complete"); // ! WHAT IF TX FAILS
  }

  async function editListing() {
    setCardType("sending");
    const nftMint = new web3.PublicKey(nft.mint);
    const data = await swapSdk.editSingleListing({
      owner: activeWalletPubKey,
      nftMint,
      // Change listing to 0.5 SOL.
      price: new anchor.BN(Number(listingAmt) * web3.LAMPORTS_PER_SOL),
    });
    const txToSend = new web3.Transaction().add(...data.tx.ixs);
    let txSig = await SolanaProvider.signAndSendTransaction(
      solanaCtx,
      txToSend
    );
    setTensorTx(txSig);
    setCardType("complete"); // ! WHAT IF TX FAILS
  }

  useEffect(() => {
    (async () => {
      // navigate back to the nav root because the list screen is no longer
      //  wallet no longer possesses the NFT.
      if (cardType === "complete" && !openListDrawer) {
        await background.request({
          method: UI_RPC_METHOD_NAVIGATION_TO_ROOT,
          params: [],
        });
      }
      // TODO force a hard reload
    })();
  }, [cardType, background, openListDrawer]);

  return (
    <div className={classes.listScreenContainer}>
      <div className={classes.inputInfoContainer}>
        <div>
          <Typography className={classes.priceTitleText}>Price</Typography>
        </div>
        <div className={classes.logoSolContainer}>
          <div className={classes.logoSolImageContainer}>
            <ProxyImage
              src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png" //SOLANA ONLY
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
              }}
              removeOnError
            />
          </div>
          <div className={classes.logoSolInputContainer}>
            <input
              placeholder="0"
              autoFocus
              type="text"
              style={{
                outline: "none",
                background: "transparent",
                border: "none",
                fontWeight: 600,
                fontSize: 48,
                height: 48,
                color: theme.custom.colors.fontColor,
                width: `${listingAmt?.length * 20 + 80}px`,
                // @ts-ignore
                fontFamily: theme.typography.fontFamily,
              }}
              value={listingAmt}
              onChange={({
                target: { value },
              }: React.ChangeEvent<HTMLInputElement>) => {
                try {
                  const parsedVal =
                    value.length === 1 && value[0] === "." ? "0." : value;
                  setListingAmt(parsedVal);
                } catch (err) {
                  // Do nothing.
                }
              }}
            />
          </div>
        </div>
        <div>
          <Typography className={classes.priceAmtText}>
            $10,100 {/* //! REMOVE UPDATE LATER, IS THERE AN API FOR THIS */}
          </Typography>
        </div>
        <UseValueLabel
          amount={BigNumber.from("490")}
          onSetAmount={() => setListingAmt("490")} //!REMOVE UPDATE AND GET
          decimals={token.decimals}
          labelProperty="Use floor price"
        />
      </div>

      <div className={classes.metadataContainer}>
        {" "}
        {/* // ! infor container here */}
        <div className={classes.metadataInnerContainer}>
          <div>
            <ProxyImage
              src={nft?.imageUrl}
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "8px",
              }}
              removeOnError
            />
          </div>
          <div className={classes.metadataTextContainer}>
            <Typography className={classes.metadataNameText}>
              {nft?.name}
            </Typography>
            <Typography className={classes.metadataCollectionText}>
              {nft?.collectionName}
            </Typography>
          </div>
        </div>
        <hr className={classes.metadataLineDivider} />
        <div>
          <DangerButton
            style={{
              height: "40px",
            }}
            onClick={() => removeListing()}
            label="Remove Listing"
          />
        </div>
      </div>
      <div className={classes.listScreenFooterBtnsContainer}>
        <SecondaryButton label="Cancel" onClick={closePageDrawer} />
        <PrimaryButton
          label={`${listed ? "Edit" : "save"}`} // ! CHANGE DEPENDING ON PAGE REQ CAME FROM
          onClick={() => setOpenListDrawer(true)}
          disabled={listingAmt === initialListingAmtStr}
        />
      </div>

      <div>
        <ApproveTransactionDrawer
          openDrawer={openListDrawer}
          setOpenDrawer={setOpenListDrawer}
        >
          {cardType === "confirm" ? (
            <ConfirmListScreen
              onConfirm={
                (/*  simulateListingOnTensor() */) =>
                  listed ? editListing() : listOnTensor()
              }
              token={token}
            />
          ) : cardType === "sending" ? (
            <SendingNft isComplete={false} token={token} signature={tensorTx} />
          ) : cardType === "complete" ? (
            <SendingNft
              isComplete
              token={token}
              closeDrawer={() => setOpenListDrawer(false)}
              signature={tensorTx}
            />
          ) : (
            <Error
              blockchain={Blockchain.SOLANA}
              signature="tx signature goes here"
              onRetry={listOnTensor}
              error="error msg goes here"
            />
          )}
        </ApproveTransactionDrawer>
      </div>
    </div>
  );
}

function ConfirmListScreen({
  token,
  onConfirm,
}: {
  token: any;
  onConfirm: () => void;
}) {
  const classes = useLocalStyles();
  return (
    <div className={classes.confirmDrawerContainer}>
      <div>
        <Typography className={classes.confirmDrawerTitle}>
          Review List for Sale
        </Typography>
        <TokenAmountHeader
          style={{
            margin: "35px 0",
          }}
          amount={BigNumber.from(1)}
          token={token}
        />
        <ListNftTable listFee="200" />
      </div>
      <PrimaryButton onClick={() => onConfirm()} label="List for Sale" />
    </div>
  );
}

const ListNftTable = ({ listFee }: { listFee: string }) => {
  const theme = useCustomTheme();
  const classes = useStyles();
  const solanaCtx = useSolanaCtx();

  console.log("the solana context", solanaCtx);

  const menuItems = {
    From: {
      onClick: () => {},
      detail: (
        <div style={{ display: "flex", alignItems: "center" }}>
          <CopyablePublicKey publicKey={solanaCtx.walletPublicKey} />
        </div>
      ),
      classes: { root: classes.confirmTableListItem },
      button: false,
    },
    "Listing Fee": {
      onClick: () => {},
      detail: (
        <div style={{ display: "flex", alignItems: "center" }}>
          FREE {/* //! REMOVE UPDATE LATER */}
        </div>
      ),
      classes: { root: classes.confirmTableListItem },
      button: false,
    },
    "Artist Royalties": {
      onClick: () => {},
      detail: (
        <div style={{ display: "flex", alignItems: "center" }}>
          5% {/* //! REMOVE UPDATE LATER. NOT IN THE NFT OBJECT */}
        </div>
      ),
      classes: { root: classes.confirmTableListItem },
      button: false,
    },
    "Network fee": {
      onClick: () => {},
      detail: (
        <Typography>
          0.000005 {/* // ! UPDATE LATER, SHOW PRICE IN DOLLARS */}
          <span style={{ color: theme.custom.colors.secondary }}>SOL</span>
        </Typography>
      ),
      classes: { root: classes.confirmTableListItem },
      button: false,
    },
  } satisfies React.ComponentProps<typeof SettingsList>["menuItems"];

  return (
    <SettingsList
      borderColor={theme.custom.colors.approveTransactionTableBackground}
      menuItems={menuItems}
      style={{
        margin: 0,
      }}
      textStyle={{
        color: theme.custom.colors.secondary,
      }}
    />
  );
};

const SendingNft = ({
  isComplete,
  token,
  signature,
  closeDrawer,
}: {
  token: any;
  signature: string;
  isComplete: boolean;
  closeDrawer?: () => void;
}) => {
  const theme = useCustomTheme();
  const classes = useLocalStyles();
  const explorer = useBlockchainExplorer(Blockchain.SOLANA); //listing on
  const connectionUrl = useBlockchainConnectionUrl(Blockchain.SOLANA); //listing on tensor

  //check whether the token is listed and the price is being updated for this
  const isListed = token.listPrice > 0 ? true : false;

  return (
    <div className={classes.sendingDrawerContainer}>
      <Typography className={classes.sendingDrawerTitle}>
        {isComplete && isListed
          ? "Updated!"
          : !isComplete && isListed
          ? "Updating Listing"
          : isComplete && !isListed
          ? "Listed on Tensor"
          : !isComplete && !isListed
          ? "Listing on Tensor..."
          : ""}
      </Typography>
      <TokenAmountHeader
        style={{
          marginBottom: "20px",
        }}
        amount={BigNumber.from(1)}
        token={token}
      />
      {isComplete ? (
        <div className={classes.SendingDrawerFooterContainer}>
          <CheckIcon />
          <div className={classes.SendingDrawerCloseOptionsContainer}>
            <SecondaryButton label="Close" onClick={closeDrawer} />
            <PrimaryButton
              label="view listing"
              onClick={() => console.log("opening tensor page")} // TODO open tensor page???
            />
          </div>
          <Typography
            className={classes.ViewTxSuccessText}
            onClick={() =>
              window.open(explorerUrl(explorer, signature, connectionUrl))
            }
          >
            View Transaction
          </Typography>
        </div>
      ) : (
        <div className={classes.sendingDrawerLoadingContainer}>
          <Loading
            size={48}
            iconStyle={{
              color: theme.custom.colors.primaryButton,
              display: "flex",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />
          <Typography
            className={classes.ViewTxLoadingText}
            onClick={() =>
              window.open(explorerUrl(explorer, signature, connectionUrl))
            }
          >
            View Transaction
          </Typography>
        </div>
      )}
    </div>
  );
};
