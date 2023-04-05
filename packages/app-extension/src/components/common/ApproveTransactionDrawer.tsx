import { useState } from "react";
import { useActiveWallet } from "@coral-xyz/recoil";
import { styles as makeStyles, useCustomTheme } from "@coral-xyz/themes";
import { Close } from "@mui/icons-material";
import { IconButton, Typography } from "@mui/material";

import { WithMiniDrawer } from "./Layout/Drawer";
import { CheckIcon,LedgerIcon } from "./Icon";

const useStyles = makeStyles((theme) => ({
  paperAnchorBottom: {
    boxShadow: "none",
  },
  closeConfirmButton: {
    width: "38px",
    height: "38px",
    marginLeft: "auto",
    marginRight: "auto",
    border: "none !important",
    background: theme.custom.colors.nav,
  },
  approveTransactionCloseContainer: {
    backgroundColor: theme.custom.colors.approveTransactionCloseBackground,
    width: "44px",
    height: "44px",
    zIndex: 2,
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    borderRadius: "22px",
  },
  closeIcon: {
    color: theme.custom.colors.icon,
  },
}));

export const ApproveTransactionDrawer: React.FC<{
  openDrawer: boolean;
  setOpenDrawer: (b: boolean) => void;
  children: React.ReactNode;
}> = ({ openDrawer, setOpenDrawer, children }) => {
  const classes = useStyles();
  const theme = useCustomTheme();
  const { type: walletType } = useActiveWallet();

  return (
    <WithMiniDrawer
      openDrawer={openDrawer}
      setOpenDrawer={setOpenDrawer}
      backdropProps={{
        style: {
          opacity: 0.8,
          background: "#18181b",
        },
      }}
      paperAnchorBottom={classes.paperAnchorBottom}
    >
      <div
        onClick={() => setOpenDrawer(false)}
        style={{
          height: "50px",
          zIndex: 1,
          backgroundColor: "transparent",
        }}
      >
        <CloseButton
          onClick={() => setOpenDrawer(false)}
          style={{
            marginTop: "28px",
            marginLeft: "24px",
            zIndex: 1,
          }}
        />
      </div>
      <div
        style={{
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
          height: "100%",
          background: theme.custom.colors.background,
        }}
      >
        <div
          style={{
            height: "100%",
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
            background: theme.custom.colors.drawerGradient,
          }}
        >
          {walletType === "hardware" ? <HardwareApproval /> : children}
        </div>
      </div>
    </WithMiniDrawer>
  );
};

function HardwareApproval() {
  const theme = useCustomTheme();
  const [state, setState] = useState<
    "approve" | "sending" | "confirmed" | "error" | "connectionFailure"
  >("approve");

  const icon =
    state === "approve" || state === "sending" ? (
      <div
        style={{
          width: 56,
          height: 56,
          background: "black",
          borderRadius: "50%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <LedgerIcon style={{ width: 32 }} />
      </div>
    ) : state === "confirmed" ? (
      <CheckIcon style={{ height: 48 }} />
    ) : null;

  const title =
    state === "approve"
      ? "Continue with your Ledger"
      : state === "sending"
      ? "Sending"
      : state === "confirmed"
      ? "Confirmed!"
      : state === "connectionFailure"
      ? "Unable to Connect"
      : "Error :(";

  const subtext =
    state === "approve" || state === "sending"
      ? "You need to approve the transaction on your Ledger. Unlock it, open the blockchain's app, and make sure blind transaction signing is enabled."
      : state === "connectionFailure"
      ? "Check that your Ledger is connected and unlocked, and your browser permissions are approved."
      : null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 24,
        height: 350,
        gap: 24,
      }}
    >
      {icon}
      <div style={{ textAlign: "center", padding: "0 38px" }}>
        <Typography
          mb="8px"
          color={theme.custom.colors.fontColor}
          fontSize="18px"
        >
          {title}
        </Typography>
        <Typography color={theme.custom.colors.fontColor3} fontSize="16px">
          {subtext}
        </Typography>
      </div>
    </div>
  );
}

export function CloseButton({
  onClick,
  style,
}: {
  onClick: () => void;
  style?: React.CSSProperties;
}) {
  const classes = useStyles();
  return (
    <div className={classes.approveTransactionCloseContainer} style={style}>
      <IconButton
        disableRipple
        className={`${classes.closeConfirmButton}`}
        onClick={onClick}
      >
        <Close className={classes.closeIcon} />
      </IconButton>
    </div>
  );
}
