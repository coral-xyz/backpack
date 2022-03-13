import { Suspense } from "react";
import { makeStyles, Typography } from "@material-ui/core";
import { KeyringStoreStateEnum } from "../../keyring/store";
import { useKeyringStoreState } from "../../context/KeyringStoreState";
import { SidebarButton } from "./Sidebar";

export const NAV_BAR_HEIGHT = 56;

const useStyles = makeStyles((theme: any) => ({
  navBarContainer: {
    height: `${NAV_BAR_HEIGHT}px`,
    borderBottom: `solid 1pt ${theme.custom.colors.border}`,
    display: "flex",
    justifyContent: "space-between",
    paddingLeft: "16px",
    paddingRight: "16px",
    paddingTop: "10px",
    paddingBottom: "10px",
    backgroundColor: theme.custom.colors.nav,
  },
  menuButtonContainer: {
    width: "38px",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    position: "relative",
  },
  connectedIcon: {
    width: "12px",
    height: "12px",
    borderRadius: "6px",
    backgroundColor: theme.custom.colors.connected,
    position: "absolute",
    right: 0,
  },
  disconnectedIcon: {
    width: "12px",
    height: "12px",
    borderRadius: "6px",
    backgroundColor: theme.custom.colors.disconnected,
    position: "absolute",
    right: 0,
  },
  centerDisplayContainer: {
    color: theme.custom.colors.fontColor,
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },
  connectionButton: {
    padding: 0,
  },
  connectionMenu: {
    backgroundColor: theme.custom.colors.offText,
    color: theme.custom.colors.fontColor,
  },
  overviewLabel: {
    fontSize: "18px",
    fontWeight: 500,
  },
}));

export function NavBar() {
  const classes = useStyles();
  return (
    <div className={classes.navBarContainer}>
      <SidebarButton />
      <CenterDisplay />
      <DummyButton />
    </div>
  );
}

function CenterDisplay() {
  const classes = useStyles();
  const keyringStoreState = useKeyringStoreState();
  const isLocked = keyringStoreState === KeyringStoreStateEnum.Locked;
  return (
    <div className={classes.centerDisplayContainer}>
      {isLocked ? <LockedCenterDisplay /> : <UnlockedCenterDisplay />}
    </div>
  );
}

function LockedCenterDisplay() {
  return (
    <div>
      <b>200ms</b>
    </div>
  );
}

function UnlockedCenterDisplay() {
  return (
    <Suspense fallback={<div></div>}>
      <_UnlockedCenterDisplay />
    </Suspense>
  );
}

function _UnlockedCenterDisplay() {
  const classes = useStyles();
  return <Typography className={classes.overviewLabel}>Balances</Typography>;
}

function DummyButton() {
  const classes = useStyles();
  return <div className={classes.menuButtonContainer}></div>;
}
