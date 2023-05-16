import React, { useState } from "react";
import { Blockchain, explorerUrl } from "@coral-xyz/common";
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
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
  useSolanaCtx,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Typography } from "@mui/material";
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

  //doing the listing
  async function listOnTensor() {
    setCardType("sending");
    //
    setTensorTx(
      "21mVjw8mGjsUCeof65VsM7hvy5q7CU68X5qzQwWGd1KHMNGPCvTchWduAVBtYrr33Qb2oHJjm2pXfomFUsFRjXgp"
    );
    setTimeout(() => {
      setCardType("complete"); // ! SIMULATING SUCCESS
    }, 5000);
  }

  async function deList() {
    //
  }

  return (
    <div
      style={{
        padding: "0 16px 8px 16px",
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          margin: "60px 0 75px 0",
          textAlign: "center",
        }}
      >
        <div>
          <Typography
            style={{
              color: theme.custom.colors.secondary,
              fontSize: "15px",
              fontWeight: 500,
              marginTop: "10px",
            }}
          >
            Price
          </Typography>
        </div>
        <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
          <div style={{ margin: "auto 0" }}>
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
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              margin: "auto 0",
            }}
          >
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
          <Typography
            style={{
              color: theme.custom.colors.secondary,
              fontSize: "15px",
              fontWeight: 500,
            }}
          >
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

      <div
        style={{
          backgroundColor: theme.custom.colors.bg4, //bg2
          borderRadius: "8px",
          margin: "20px 0",
          padding: "15px",
        }}
      >
        {" "}
        {/* // ! infor container here */}
        <div style={{ display: "flex", gap: "15px" }}>
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
          <div style={{ margin: "auto 0" }}>
            <Typography
              style={{
                color: theme.custom.colors.fontColor,
                fontWeight: 500,
                fontSize: "18px",
                lineHeight: "24px",
              }}
            >
              {nft?.name}
            </Typography>
            <Typography
              style={{
                color: theme.custom.colors.secondary,
                fontSize: "14px",
                fontWeight: 500,
                marginTop: "10px",
              }}
            >
              {nft?.collectionName}
            </Typography>
          </div>
        </div>
        <hr
          style={{
            margin: "15px 0",
            borderColor: theme.custom.colors.secondary,
            borderWidth: "0.1px",
          }}
        />
        <div>
          <DangerButton
            style={{
              height: "40px",
            }}
            label="Remove Listing"
          />
        </div>
      </div>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          gap: "15px",
        }}
      >
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
            <ConfirmListScreen onConfirm={() => listOnTensor()} token={token} />
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
  const theme = useCustomTheme();
  return (
    <div
      style={{
        padding: "16px",
        height: "602px",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        paddingBottom: "24px",
      }}
    >
      <div>
        <Typography
          style={{
            color: theme.custom.colors.fontColor,
            fontWeight: 500,
            fontSize: "18px",
            lineHeight: "24px",
            textAlign: "center",
          }}
        >
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
  const explorer = useBlockchainExplorer(Blockchain.SOLANA); //listing on
  const connectionUrl = useBlockchainConnectionUrl(Blockchain.SOLANA); //listing on tensor

  //check whether the token is listed and the price is being updated for this
  const isListed = token.listPrice > 0 ? true : false;

  return (
    <div style={{ height: "450px" }}>
      <Typography
        style={{
          color: theme.custom.colors.fontColor,
          fontWeight: 500,
          fontSize: "18px",
          lineHeight: "24px",
          padding: "20px",
          textAlign: "center",
        }}
      >
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
        <div style={{ textAlign: "center" }}>
          <CheckIcon />
          <div style={{ display: "flex", gap: "15px", padding: "20px" }}>
            <SecondaryButton label="Close" onClick={closeDrawer} />
            <PrimaryButton
              label="view listing"
              onClick={() => console.log("opening tensor page")} // TODO open tensor page???
            />
          </div>
          <Typography
            sx={{
              color: theme.custom.colors.secondary,
              fontSize: "12px",
              fontWeight: 500,
              "&:hover": {
                cursor: "pointer",
              },
            }}
            onClick={() =>
              window.open(explorerUrl(explorer, signature, connectionUrl))
            }
          >
            View Transaction
          </Typography>
        </div>
      ) : (
        <div style={{ height: "20px", marginTop: "60px" }}>
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
            sx={{
              color: theme.custom.colors.secondary,
              fontSize: "12px",
              fontWeight: 500,
              textAlign: "center",
              marginTop: "50px",
              "&:hover": {
                cursor: "pointer",
              },
            }}
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
