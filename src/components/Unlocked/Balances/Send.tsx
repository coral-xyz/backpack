import { useState } from "react";
import { makeStyles, useTheme, Button, Typography } from "@material-ui/core";
import { PublicKey } from "@solana/web3.js";
import { TextField, TextFieldLabel } from "../../common";
import { WithHeaderButton } from "./Token";
import { useEphemeralNav } from "../../../context/NavEphemeral";
import { useSolanaWalletCtx } from "../../../hooks/useWallet";
import { OnboardButton } from "../../common";
import { WithMiniDrawer } from "../../Layout/Drawer";

const useStyles = makeStyles((theme: any) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  headerButton: {
    borderRadius: "12px",
    width: "100px",
    height: "40px",
    backgroundColor: theme.custom.colors.nav,
    "&:hover": {
      backgroundColor: theme.custom.colors.nav,
    },
  },
  headerButtonLabel: {
    color: theme.custom.colors.fontColor,
    fontSize: "14px",
    lineHeight: "24px",
    fontWeight: 500,
    textTransform: "none",
  },
  topHalf: {
    paddingTop: "24px",
    height: "249px",
  },
  bottomHalf: {
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
    background: theme.custom.colors.sendGradient,
    height: "194px",
  },
  buttonContainer: {
    flex: 1,
    display: "flex",
    paddingLeft: "12px",
    paddingRight: "12px",
    paddingBottom: "24px",
    paddingTop: "25px",
    justifyContent: "space-between",
  },
  buttonLabel: {
    color: theme.custom.colors.fontColor,
    textTransform: "none",
    fontWeight: 500,
    fontSize: "16px",
    lineHeight: "24px",
  },
  button: {
    background: "transparent",
    width: "100%",
    height: "48px",
  },
  textRoot: {
    marginTop: "0 !important",
    marginBottom: "0 !important",
    "& .MuiOutlinedInput-root": {
      backgroundColor: `${theme.custom.colors.nav} !important`,
    },
  },
  bottomHalfLabel: {
    fontWeight: 500,
    color: theme.custom.colors.secondary,
    fontSize: "12px",
    lineHeight: "16px",
  },
  sendConfirmationContainer: {
    height: "100%",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    background: theme.custom.colors.background,
    borderRadius: "12px",
  },
  sendConfirmationTopHalf: {
    background: theme.custom.colors.drawerGradient,
  },
}));

export function SendButton({ token }: any) {
  return (
    <WithHeaderButton
      label={"Send"}
      dialogTitle={`${token.ticker} / Send`}
      dialog={(setOpenDrawer: any) => (
        <Send token={token} onCancel={() => setOpenDrawer(false)} />
      )}
    />
  );
}

function Send({ onCancel, token }: any) {
  const classes = useStyles() as any;
  const [openDrawer, setOpenDrawer] = useState(false);
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState(0);
  const [addressError, setAddressError] = useState<boolean>(false);
  const [amountError, setAmountError] = useState<boolean>(false);
  const { push } = useEphemeralNav();
  const onNext = () => {
    let didAmountError = false;
    if (amount <= 0) {
      didAmountError = true;
    }

    let didAddressError = false;
    try {
      new PublicKey(address);
    } catch (_err) {
      didAddressError = true;
    }

    // Do this below the above so that we can set the proper error states
    // on all the fields.
    if (didAmountError || didAddressError) {
      setAmountError(didAmountError);
      setAddressError(didAddressError);
      return;
    }
    setOpenDrawer(true);
  };
  return (
    <div className={classes.container}>
      <div className={classes.topHalf}>
        <div style={{ marginBottom: "40px" }}>
          <TextFieldLabel leftLabel={"Send to"} rightLabel={"Address Book"} />
          <TextField
            rootClass={classes.textRoot}
            placeholder={"SOL Address"}
            value={address}
            setValue={setAddress}
            isError={addressError}
          />
        </div>
        <div>
          <TextFieldLabel
            leftLabel={"Amount"}
            rightLabel={`${token.nativeBalance} ${token.ticker}`}
          />
          <TextField
            rootClass={classes.textRoot}
            type={"number"}
            placeholder={"Amount"}
            value={amount}
            setValue={setAmount}
            isError={amountError}
          />
        </div>
      </div>
      <div className={classes.bottomHalf}>
        <NetworkFeeInfo />
      </div>
      <div className={classes.buttonContainer}>
        <OnboardButton
          className={classes.button}
          onClick={onNext}
          label={"Send"}
        />
        <WithMiniDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
          <SendConfirmation token={token} address={address} amount={amount} />
        </WithMiniDrawer>
      </div>
    </div>
  );
}

export function NetworkFeeInfo() {
  const classes = useStyles();
  const networkFee = "-"; // TODO
  return (
    <div
      style={{
        marginLeft: "24px",
        marginRight: "24px",
        marginTop: "28px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography className={classes.bottomHalfLabel}>Network</Typography>
        <Typography className={classes.bottomHalfLabel}>Solana</Typography>
      </div>
      <div
        style={{
          marginTop: "10px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography className={classes.bottomHalfLabel}>Network Fee</Typography>
        <Typography className={classes.bottomHalfLabel}>
          {networkFee}
        </Typography>
      </div>
      <div
        style={{
          marginTop: "10px",
          display: "flex",
          justifyContent: "space-between",
        }}
      ></div>
    </div>
  );
}

function SendConfirmation({ token, address, amount }: any) {
  const classes = useStyles();
  const theme = useTheme() as any;
  const ctx = useSolanaWalletCtx();
  const wallet = ctx.wallet;
  const onConfirm = async () => {
    const txSig = await wallet.transferToken(ctx, {
      destination: new PublicKey(address),
      mint: new PublicKey(token.mint),
      amount,
    });
    console.log("tx sig received", txSig);
  };
  return (
    <div className={classes.sendConfirmationContainer}>
      <div className={classes.sendConfirmationTopHalf} style={{ flex: 1 }}>
        <Typography style={{ color: theme.custom.colors.fontColor }}>
          THIS IS AN UNSTYLED UI
        </Typography>
        <Typography style={{ color: theme.custom.colors.fontColor }}>
          Confirm send {token.ticker} to {address}
        </Typography>
        <Typography style={{ color: theme.custom.colors.fontColor }}>
          Amount: {amount}
        </Typography>
      </div>
      <div
        style={{
          marginBottom: "24px",
          marginTop: "24px",
          marginLeft: "12px",
          marginRight: "12px",
        }}
      >
        <OnboardButton onClick={onConfirm} label={"Confirm"} />
      </div>
    </div>
  );
}
