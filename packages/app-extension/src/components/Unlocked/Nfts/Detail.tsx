import { useState } from "react";
import { BigNumber } from "ethers";
import { Typography } from "@mui/material";
import { useCustomTheme, styles } from "@coral-xyz/themes";
import { useNftMetadata, useAnchorContext } from "@coral-xyz/recoil";
import { toTitleCase, Blockchain } from "@coral-xyz/common";
import { PrimaryButton, SecondaryButton, TextField } from "../../common";
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
import { useIsValidAddress } from "../Balances/TokensWidget/Send";
import { ApproveTransactionDrawer } from "../../common/ApproveTransactionDrawer";

const useStyles = styles((theme) => ({
  textRoot: {
    marginTop: "12px !important",
    marginBottom: "0 !important",
    "& .MuiOutlinedInput-root": {
      backgroundColor: `${theme.custom.colors.nav} !important`,
    },
  },
}));

export function NftsDetail({ nftId }: { nftId: string }) {
  const nfts = useNftMetadata();
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
      }}
    >
      <img
        style={{
          width: "100%",
          minHeight: "343px",
          borderRadius: "8px",
        }}
        src={nft.imageUrl}
        onError={(event) => (event.currentTarget.style.display = "none")}
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
  const theme = useCustomTheme();
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
        <div
          style={{ height: "100%", background: theme.custom.colors.background }}
        >
          <NavStackEphemeral
            initialRoute={{ name: "send" }}
            options={() => ({
              title: `${nft.name} / Send`,
            })}
            navButtonRight={
              <CloseButton onClick={() => setOpenDrawer(false)} />
            }
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
  const classes = useStyles();
  const { close } = useDrawerContext();
  const { provider: solanaProvider } = useAnchorContext();
  const [destinationAddress, setDestinationAddress] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const {
    isValidAddress,
    isErrorAddress,
    isFreshAddress: _,
  } = useIsValidAddress(
    nft.blockchain,
    destinationAddress,
    solanaProvider.connection
  );

  const onReject = () => {
    close();
  };
  const onSend = () => {
    setOpenConfirm(true);
  };

  return (
    <>
      <div
        style={{
          paddingLeft: "16px",
          paddingRight: "16px",
          paddingBottom: "24px",
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
            <TextField
              autoFocus
              rootClass={classes.textRoot}
              placeholder={`Recipient's ${toTitleCase(nft.blockchain)} Address`}
              value={destinationAddress}
              setValue={setDestinationAddress}
              isError={isErrorAddress}
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
              paddingBottom: "12px",
            }}
          >
            <SecondaryButton
              style={{
                marginRight: "8px",
              }}
              onClick={onReject}
              label={"Cancel"}
            />
            <PrimaryButton
              disabled={!isValidAddress}
              onClick={onSend}
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
            close={() => close()}
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
            to={destinationAddress}
            amount={BigNumber.from(1)}
            close={() => close()}
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
