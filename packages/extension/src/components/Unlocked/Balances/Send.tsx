import { useState, useEffect } from "react";
import { makeStyles, useTheme, Typography } from "@material-ui/core";
import { SystemProgram, PublicKey } from "@solana/web3.js";
import { useAnchorContext, useSolanaCtx } from "@200ms/recoil";
import { Solana, SOL_NATIVE_MINT } from "@200ms/common";
import {
  TextField,
  TextFieldLabel,
  walletAddressDisplay,
  OnboardButton,
} from "../../common";
import { WithHeaderButton } from "./Token";
import { WithMiniDrawer } from "../../Layout/Drawer";

const useStyles = makeStyles((theme: any) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  topHalf: {
    paddingTop: "24px",
    flex: 1,
  },
  buttonContainer: {
    display: "flex",
    paddingLeft: "12px",
    paddingRight: "12px",
    paddingBottom: "24px",
    paddingTop: "25px",
    justifyContent: "space-between",
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
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
  },
  sendConfirmationTopHalf: {
    background: theme.custom.colors.drawerGradient,
  },
  confirmRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  confirmRowLabelLeft: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 500,
    color: theme.custom.colors.secondary,
  },
  confirmRowLabelRight: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 500,
    color: theme.custom.colors.fontColor,
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
  const [_isFreshAccount, setIsFreshAccount] = useState<boolean>(false); // Not used for now.
  const [accountValidated, setAccountValidated] = useState<boolean>(false);
  const { provider } = useAnchorContext();

  // This effect validates the account address given.
  useEffect(() => {
    if (accountValidated) {
      setAccountValidated(false);
    }
    (async () => {
      let pubkey;
      try {
        pubkey = new PublicKey(address);
      } catch (err) {
        // Not valid address so don't bother validating it.
        return;
      }

      const account = await provider.connection.getAccountInfo(pubkey);

      // Null data means the account has no lamports. This is valid.
      if (!account) {
        setIsFreshAccount(true);
        setAccountValidated(true);
        return;
      }

      // Only allow system program accounts to be given. ATAs only!
      if (!account.owner.equals(SystemProgram.programId)) {
        setAddressError(true);
        return;
      }

      // The account data has been successfully validated.
      setAccountValidated(true);
    })();
  }, [address]);

  // On click handler.
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
    if (!accountValidated) {
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
      <div className={classes.buttonContainer}>
        <OnboardButton
          className={classes.button}
          onClick={onNext}
          label={"Send"}
        />
        <WithMiniDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
          <SendConfirmation
            token={token}
            address={address}
            amount={amount}
            close={() => onCancel()}
          />
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

function SendConfirmation({ token, address, amount, close }: any) {
  const classes = useStyles();
  const theme = useTheme() as any;
  const ctx = useSolanaCtx();
  const onConfirm = async () => {
    let txSig;
    if (token.mint === SOL_NATIVE_MINT.toString()) {
      txSig = await Solana.transferSol(ctx, {
        source: ctx.walletPublicKey,
        destination: new PublicKey(address),
        amount,
      });
    } else {
      txSig = await Solana.transferToken(ctx, {
        destination: new PublicKey(address),
        mint: new PublicKey(token.mint),
        amount,
      });
    }
    console.log("tx sig received", txSig);
    close();
  };
  return (
    <BottomCard onButtonClick={onConfirm} buttonLabel={"Confirm"}>
      <div style={{ padding: "24px" }}>
        <Typography
          style={{
            color: theme.custom.colors.fontColor,
            fontWeight: 500,
            fontSize: "18px",
            lineHeight: "24px",
          }}
        >
          Confirm Send
        </Typography>
        <div
          style={{
            marginTop: "18px",
          }}
        >
          <div className={classes.confirmRow}>
            <Typography className={classes.confirmRowLabelLeft}>
              Network
            </Typography>
            <Typography className={classes.confirmRowLabelRight}>
              Solana
            </Typography>
          </div>
          <div className={classes.confirmRow}>
            <Typography className={classes.confirmRowLabelLeft}>
              Network Fee
            </Typography>
            <Typography className={classes.confirmRowLabelRight}>
              - SOL
            </Typography>
          </div>
          <div className={classes.confirmRow}>
            <Typography className={classes.confirmRowLabelLeft}>
              Sending from
            </Typography>
            <Typography className={classes.confirmRowLabelRight}>
              {walletAddressDisplay(ctx.walletPublicKey)}
            </Typography>
          </div>
          <div className={classes.confirmRow}>
            <Typography className={classes.confirmRowLabelLeft}>
              Sending to
            </Typography>
            <Typography className={classes.confirmRowLabelRight}>
              {walletAddressDisplay(new PublicKey(address))}
            </Typography>
          </div>
        </div>
      </div>
    </BottomCard>
  );
}

export function BottomCard({
  onButtonClick,
  onReject,
  buttonLabel,
  buttonStyle,
  cancelButton,
  buttonLabelStyle,
  children,
}: any) {
  const classes = useStyles();
  const theme = useTheme() as any;
  return (
    <div className={classes.sendConfirmationContainer}>
      <div className={classes.sendConfirmationTopHalf} style={{ flex: 1 }}>
        {children}
      </div>
      <div
        style={{
          marginBottom: "24px",
          marginLeft: "12px",
          marginRight: "12px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {cancelButton && (
          <OnboardButton
            style={{
              marginRight: "8px",
              backgroundColor: theme.custom.colors.nav,
            }}
            buttonLabelStyle={{ color: theme.custom.colors.fontColor }}
            onClick={onReject}
            label={"Cancel"}
          />
        )}

        <OnboardButton
          style={buttonStyle}
          buttonLabelStyle={buttonLabelStyle}
          onClick={onButtonClick}
          label={buttonLabel}
        />
      </div>
    </div>
  );
}
