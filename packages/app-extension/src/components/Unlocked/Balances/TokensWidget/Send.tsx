import { useState, useEffect } from "react";
import { Typography, Link } from "@mui/material";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { SystemProgram, PublicKey } from "@solana/web3.js";
import {
  useAnchorContext,
  useSolanaCtx,
  useBlockchainTokenAccount,
} from "@coral-xyz/recoil";
import {
  Blockchain,
  confirmTransaction,
  getLogger,
  explorerUrl,
  Solana,
  SOL_NATIVE_MINT,
} from "@coral-xyz/common";
import { WithHeaderButton } from "./Token";
import {
  TextField,
  TextFieldLabel,
  walletAddressDisplay,
  PrimaryButton,
  Loading,
  SecondaryButton,
} from "../../../common";
import { useDrawerContext, WithMiniDrawer } from "../../../Layout/Drawer";

const logger = getLogger("send-component");

const useStyles = styles((theme) => ({
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
    borderRadius: "12px",
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

export function SendButton({
  blockchain,
  address,
}: {
  blockchain: Blockchain;
  address: string;
}) {
  const token = useBlockchainTokenAccount(blockchain, address);
  return (
    <WithHeaderButton
      label={"Send"}
      routes={[
        {
          name: "send",
          component: (props: any) => <Send {...props} />,
          title: `${token.ticker} / Send`,
          props: {
            blockchain,
            tokenAddress: address,
          },
        },
      ]}
    />
  );
}

export function Send({
  blockchain,
  tokenAddress,
}: {
  blockchain: Blockchain;
  tokenAddress: string;
}) {
  const classes = useStyles() as any;
  const theme = useCustomTheme();
  const { close } = useDrawerContext();
  const token = useBlockchainTokenAccount(blockchain, tokenAddress);
  const { provider } = useAnchorContext();

  const [openDrawer, setOpenDrawer] = useState(false);
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState<number>(0.0);
  const [addressError, setAddressError] = useState<boolean>(false);
  const [amountError, setAmountError] = useState<boolean>(false);
  const [_isFreshAccount, setIsFreshAccount] = useState<boolean>(false); // Not used for now.
  const [accountValidated, setAccountValidated] = useState<boolean>(false);

  const amountFloat = parseFloat(amount.toString());

  //
  // When sending SOL, account for the tx fee.
  //
  let lamportsOffset = 0.0;
  if (token.mint === SOL_NATIVE_MINT) {
    lamportsOffset = 0.000005;
  }

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
    if (amountFloat <= 0) {
      didAmountError = true;
    }

    if (token.nativeBalance < amountFloat + lamportsOffset) {
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

    setAddressError(false);
    setAmountError(false);
    setOpenDrawer(true);
  };

  return (
    <form
      className={classes.container}
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
    >
      <div className={classes.topHalf}>
        <div style={{ marginBottom: "40px" }}>
          <TextFieldLabel
            leftLabel={"Send to"}
            rightLabel={"Address Book"}
            style={{ marginLeft: "24px", marginRight: "24px" }}
          />
          <div style={{ margin: "0 12px" }}>
            <TextField
              rootClass={classes.textRoot}
              placeholder={"SOL Address"}
              value={address}
              setValue={setAddress}
              isError={addressError}
              inputProps={{
                name: "to",
              }}
            />
          </div>
        </div>
        <div>
          <TextFieldLabel
            leftLabel={"Amount"}
            rightLabel={`${token.nativeBalance} ${token.ticker}`}
            style={{ marginLeft: "24px", marginRight: "24px" }}
          />
          <div style={{ margin: "0 12px" }}>
            <TextField
              rootClass={classes.textRoot}
              type={"number"}
              placeholder={"Amount"}
              value={amount}
              setValue={setAmount}
              isError={amountError}
              inputProps={{
                name: "amount",
              }}
              endAdornment={
                <SecondaryButton
                  label="Max"
                  onClick={() =>
                    setAmount(token.nativeBalance - lamportsOffset)
                  }
                  style={{
                    width: "auto",
                    height: "auto",
                    backgroundColor: theme.custom.colors.background,
                    borderRadius: "24px",
                  }}
                />
              }
            />
          </div>
        </div>
      </div>
      <div className={classes.buttonContainer}>
        <PrimaryButton
          className={classes.button}
          label="Send"
          type="submit"
          data-testid="Send"
        />
        <WithMiniDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
          <SendConfirmationCard
            token={token}
            address={address}
            amount={amountFloat}
            close={() => close()}
          />
        </WithMiniDrawer>
      </div>
    </form>
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

function SendConfirmationCard({ token, address, amount, close }: any) {
  const ctx = useSolanaCtx();
  const [cardType, setCardType] = useState<
    "confirm" | "sending" | "complete" | "error"
  >("confirm");
  const [txSignature, setTxSignature] = useState<string | null>(null);

  const onConfirm = async () => {
    setCardType("sending");

    //
    // Send the tx.
    //
    let txSig;
    try {
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
    } catch (err) {
      logger.error("unable to send transaction", err);
      setCardType("error");
      return;
    }
    setTxSignature(txSig);

    //
    // Confirm the tx.
    //
    try {
      await confirmTransaction(
        ctx.connection,
        txSig,
        ctx.commitment !== "confirmed" && ctx.commitment !== "finalized"
          ? "confirmed"
          : ctx.commitment
      );
      setCardType("complete");
    } catch (err) {
      logger.error("unable to confirm", err);
      setCardType("error");
    }
  };

  return (
    <BottomCard
      onButtonClick={cardType === "confirm" ? onConfirm : close}
      buttonLabel={cardType === "confirm" ? "Confirm" : "Close"}
    >
      <div style={{ padding: "24px", height: "100%" }}>
        {cardType === "confirm" ? (
          <ConfirmSend address={address} />
        ) : cardType === "sending" ? (
          <Sending signature={txSignature!} />
        ) : cardType === "complete" ? (
          <Complete signature={txSignature!} address={address} />
        ) : (
          <Error signature={txSignature!} />
        )}
      </div>
    </BottomCard>
  );
}

function ConfirmSend({ address }: { address: string }) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const ctx = useSolanaCtx();
  return (
    <div>
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
            0.000005 SOL
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
  );
}

function Sending({ signature }: { signature: string }) {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <div style={{ height: "40px" }}>
        <Loading />
      </div>
      <Typography
        style={{ textAlign: "center", color: theme.custom.colors.secondary }}
      >
        Sending...
      </Typography>
      <Link
        href={explorerUrl(signature)}
        target="_blank"
        style={{ textAlign: "center" }}
      >
        View Transaction
      </Link>
    </div>
  );
}

function Complete({
  signature,
  address,
}: {
  signature: string;
  address: string;
}) {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <Typography
        style={{ textAlign: "center", color: theme.custom.colors.secondary }}
      >
        Sent!
      </Typography>
      <Typography
        style={{ textAlign: "center", color: theme.custom.colors.secondary }}
      >
        Your tokens were successfully sent to{" "}
        {walletAddressDisplay(new PublicKey(address))}
      </Typography>
      <Link
        href={explorerUrl(signature)}
        target="_blank"
        style={{ textAlign: "center" }}
      >
        View Transaction
      </Link>
    </div>
  );
}

function Error({ signature }: { signature: string }) {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <Typography
        style={{ textAlign: "center", color: theme.custom.colors.secondary }}
      >
        There was a problem confirming the transaction.
      </Typography>
      <Link
        href={explorerUrl(signature)}
        target="_blank"
        style={{ textAlign: "center" }}
      >
        View Transaction
      </Link>
    </div>
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
  const theme = useCustomTheme();
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
          <PrimaryButton
            style={{
              marginRight: "8px",
              backgroundColor: theme.custom.colors.nav,
            }}
            buttonLabelStyle={{ color: theme.custom.colors.fontColor }}
            onClick={onReject}
            label={"Cancel"}
          />
        )}

        <PrimaryButton
          style={buttonStyle}
          buttonLabelStyle={buttonLabelStyle}
          onClick={onButtonClick}
          label={buttonLabel}
        />
      </div>
    </div>
  );
}
