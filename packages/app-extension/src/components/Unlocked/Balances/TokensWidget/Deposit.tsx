import { useState } from "react";
import { Button, Tooltip, Typography } from "@mui/material";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { useActiveWallet } from "@coral-xyz/recoil";
import { WithHeaderButton } from "./Token";
import { BottomCard } from "./Send";
import {
  TextField,
  TextFieldLabel,
  walletAddressDisplay,
} from "../../../common";
import { useDrawerContext } from "../../../Layout/Drawer";

const useStyles = styles((theme) => ({
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
      routes={[
        {
          component: Deposit,
          title: `${token.ticker} / Deposit`,
          name: "deposit",
        },
      ]}
    />
  );
}

export function Deposit() {
  const classes = useStyles();
  const theme = useCustomTheme();
  const { close } = useDrawerContext();
  const activeWallet = useActiveWallet();

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
            <QrCode data={activeWallet.publicKey.toString()} />
          </div>
          <div style={{ marginTop: "163px" }}>
            <div>
              <TextFieldLabel
                leftLabel={"Deposit to"}
                style={{ marginLeft: "24px", marginRight: "24px" }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  margin: "0 12px",
                }}
              >
                <TextField
                  value={`${activeWallet.name} (${walletAddressDisplay(
                    activeWallet.publicKey
                  )})`}
                  rootClass={classes.depositTextFieldRoot}
                  endAdornment={
                    <CopyButton publicKey={activeWallet.publicKey.toString()} />
                  }
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

export function QrCode({ data }: { data: string }) {
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
        padding: "8px",
      }}
    >
      <img src={`https://qr.warp.workers.dev/qz=0?${data}`} alt={data} />
    </div>
  );
}

function CopyButton({ publicKey }: { publicKey: string }) {
  const classes = useStyles();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const onCopy = () => {
    setTooltipOpen(true);
    setTimeout(() => setTooltipOpen(false), 1000);
    navigator.clipboard.writeText(publicKey);
  };
  return (
    <Tooltip
      title={"Copied"}
      open={tooltipOpen}
      disableFocusListener
      disableHoverListener
      disableTouchListener
    >
      <Button className={classes.copyButton} onClick={onCopy}>
        <Typography className={classes.copyButtonLabel}>Copy</Typography>
      </Button>
    </Tooltip>
  );
}
