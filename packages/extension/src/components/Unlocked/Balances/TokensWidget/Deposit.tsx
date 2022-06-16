import { useState } from "react";
import { useTheme, Button, Tooltip, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { useActiveWallet } from "@coral-xyz/recoil";
import { WithHeaderButton } from "./Token";
import { BottomCard } from "./Send";
import {
  TextField,
  TextFieldLabel,
  walletAddressDisplay,
} from "../../../common";

const useStyles = makeStyles((theme: any) => ({
  subtext: {
    width: "264px",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "35px",
    color: theme.custom.colors.secondary,
    lineHeight: "16px",
    size: "12px",
    fontWeight: 500,
    fontSize: "12px",
    textAlign: "center",
  },
  depositTextFieldRoot: {
    margin: 0,
  },
  copyButton: {
    background: "transparent",
    padding: 0,
  },
  copyButtonLabel: {
    color: theme.custom.colors.activeNavButton,
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "24px",
    textTransform: "none",
  },
}));

export function DepositButton({ token }: any) {
  return (
    <WithHeaderButton
      label={"Deposit"}
      dialogTitle={`${token.ticker} / Deposit`}
      dialog={(setOpenDrawer: any) => (
        <Deposit close={() => setOpenDrawer(false)} />
      )}
    />
  );
}

export function Deposit({ close }: any) {
  const classes = useStyles();
  const theme = useTheme() as any;
  const activeWallet = useActiveWallet();
  const copy = () => {
    navigator.clipboard.writeText(activeWallet.publicKey.toString());
  };
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flex: 1,
        }}
      ></div>
      <div
        style={{
          height: "439px",
        }}
      >
        <BottomCard
          buttonLabel={"Close"}
          onButtonClick={close}
          buttonStyle={{
            backgroundColor: `${theme.custom.colors.nav}`,
          }}
          buttonLabelStyle={{
            color: theme.custom.colors.fontColor,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 48,
              left: 0,
              right: 0,
              marginLeft: "auto",
              marginRight: "auto",
              width: "168px",
            }}
          >
            <QrCode />
          </div>
          <div style={{ marginTop: "163px" }}>
            <div>
              <TextFieldLabel leftLabel={"Deposit to"} />
              <div style={{ display: "flex", justifyContent: "center" }}>
                <TextField
                  value={`${activeWallet.name} (${walletAddressDisplay(
                    activeWallet.publicKey
                  )})`}
                  rootClass={classes.depositTextFieldRoot}
                  endAdornment={<CopyButton onClick={copy} />}
                  inputProps={{
                    readOnly: true,
                  }}
                />
              </div>
            </div>
            <div>
              <Typography className={classes.subtext}>
                This address can only receive SOL and SPL tokens on Solana. Any
                other asset not currently supported.
              </Typography>
            </div>
          </div>
        </BottomCard>
      </div>
    </div>
  );
}

export function QrCode() {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "8px",
        height: "168px",
        width: "168px",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <Typography style={{ textAlign: "center" }}>QR Code</Typography>
    </div>
  );
}

function CopyButton({ onClick }: any) {
  const classes = useStyles();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  return (
    <Tooltip
      title={"Address copied"}
      open={tooltipOpen}
      disableFocusListener
      disableHoverListener
    >
      <Button
        className={classes.copyButton}
        onClick={(e) => {
          setTooltipOpen(true);
          setTimeout(() => setTooltipOpen(false), 1000);
          onClick(e);
        }}
      >
        <Typography className={classes.copyButtonLabel}>Copy</Typography>
      </Button>
    </Tooltip>
  );
}
