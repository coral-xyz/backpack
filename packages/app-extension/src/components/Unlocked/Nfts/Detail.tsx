import { useState } from "react";
import { Typography } from "@mui/material";
import { PublicKey } from "@solana/web3.js";
import { useCustomTheme, styles } from "@coral-xyz/themes";
import { useNftMetadata } from "@coral-xyz/recoil";
import { PrimaryButton, SecondaryButton } from "../../common";
import {
  useDrawerContext,
  WithDrawer,
  WithMiniDrawer,
  CloseButton,
} from "../../Layout/Drawer";
import { NavStackEphemeral, NavStackScreen } from "../../Layout/NavStack";
import { TextField } from "../../common";
import { SendConfirmationCard } from "../Balances/TokensWidget/Send";

const useStyles = styles((theme) => ({
  textRoot: {
    marginTop: "12px !important",
    marginBottom: "0 !important",
    "& .MuiOutlinedInput-root": {
      backgroundColor: `${theme.custom.colors.nav} !important`,
    },
  },
}));

export function NftsDetail({ publicKey }: { publicKey: string }) {
  const nfts = useNftMetadata();
  const nft = nfts.get(publicKey);

  // Hack: needed because this is undefined due to framer-motion animation.
  if (!publicKey) {
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
      <Attributes nft={nft} />
    </div>
  );
}

function Image({ nft }: { nft: any }) {
  return (
    <img
      style={{
        width: "100%",
        minHeight: "343px",
        borderRadius: "8px",
      }}
      src={nft.tokenMetaUriData.image}
    />
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
        {nft.tokenMetaUriData.description}
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
            options={(args) => ({
              title: `${nft.tokenMetaUriData.name} / Send`,
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
  const [address, setAddress] = useState("");
  const [addressError, setAddressError] = useState<boolean>(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  const onReject = () => {
    close();
  };
  const onSend = () => {
    let didAddressError = false;
    try {
      new PublicKey(address);
    } catch (_err) {
      didAddressError = true;
    }
    if (didAddressError) {
      setAddressError(true);
      return;
    }

    setAddressError(false);
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
              rootClass={classes.textRoot}
              placeholder={"Recipient's SOL Address"}
              value={address}
              setValue={setAddress}
              isError={addressError}
              inputProps={{
                name: "to",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <SecondaryButton
              style={{
                marginRight: "8px",
              }}
              onClick={onReject}
              label={"Cancel"}
            />
            <PrimaryButton onClick={onSend} label={"Next"} />
          </div>
        </div>
      </div>
      <WithMiniDrawer openDrawer={openConfirm} setOpenDrawer={setOpenConfirm}>
        <SendConfirmationCard
          token={{
            mint: nft.metadata.mint,
            decimals: 0, // Are there any NFTs that don't use decimals 1?
          }}
          address={address}
          amount={1.0}
          close={() => close()}
        />
      </WithMiniDrawer>
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
          {nft.tokenMetaUriData.attributes.map((attr: any) => {
            return (
              <div
                key={attr.trait_type}
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
                    {attr.trait_type}
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
