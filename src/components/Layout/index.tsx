import { useState } from "react";
import { makeStyles, IconButton } from "@material-ui/core";
import { Menu } from "@material-ui/icons";
import { EXTENSION_WIDTH, EXTENSION_HEIGHT } from "../../common";
import { useKeyringStoreStateContext } from "../../context/KeyringStoreState";
import { KeyringStoreStateEnum } from "../../keyring/store";

const useStyles = makeStyles((theme: any) => ({
  layoutContainer: {
    width: `${EXTENSION_WIDTH}px`,
    height: `${EXTENSION_HEIGHT}px`,
    backgroundColor: theme.custom.colors.background,
    display: "flex",
    flexDirection: "column",
  },
  navBarContainer: {
    height: "46px",
    borderBottom: `solid 1pt ${theme.custom.colors.border}`,
    display: "flex",
    justifyContent: "space-between",
    paddingLeft: "16px",
    paddingRight: "16px",
    paddingTop: "10px",
    paddingBottom: "10px",
  },
  menuButtonContainer: {
    width: "38px",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    position: "relative",
  },
  menuButton: {
    position: "absolute",
    left: 0,
    padding: 0,
  },
  menuButtonIcon: {
    color: theme.custom.colors.offText,
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
}));

export function Layout(props: any) {
  const classes = useStyles();
  const { keyringStoreState } = useKeyringStoreStateContext();
  return (
    <div className={classes.layoutContainer}>
      <NavBar />
      {props.children}
      {keyringStoreState === KeyringStoreStateEnum.Unlocked && <TabBarNav />}
    </div>
  );
}

function NavBar() {
  const classes = useStyles();
  return (
    <div className={classes.navBarContainer}>
      <MenuButton />
      <CenterDisplay />
      <ConnectionIcon />
    </div>
  );
}

function MenuButton() {
  const classes = useStyles();
  return (
    <div className={classes.menuButtonContainer}>
      <IconButton disableRipple className={classes.menuButton}>
        <Menu className={classes.menuButtonIcon} />
      </IconButton>
    </div>
  );
}

function CenterDisplay() {
  const classes = useStyles();
  const { keyringStoreState } = useKeyringStoreStateContext();
  const isLocked = keyringStoreState == KeyringStoreStateEnum.Locked;
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
  // todo
  return <div>Unlocked display TODO</div>;
}

function ConnectionIcon() {
  const classes = useStyles();
  const isConnected = false;
  return (
    <div className={classes.menuButtonContainer}>
      <div
        className={
          isConnected ? classes.connectedIcon : classes.disconnectedIcon
        }
      ></div>
    </div>
  );
}

function TabBarNav() {
  return <div>THIS IS A TAB BAR YAY</div>;
}
