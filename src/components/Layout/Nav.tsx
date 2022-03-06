import { makeStyles } from "@material-ui/core";
import { KeyringStoreStateEnum } from "../../keyring/store";
import { useKeyringStoreStateContext } from "../../context/KeyringStoreState";
import { SidebarButton } from "./Sidebar";

const useStyles = makeStyles((theme: any) => ({
  navBarContainer: {
    height: "46px",
    borderBottom: `solid 1pt ${theme.custom.colors.offText}`,
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

export function NavBar() {
  const classes = useStyles();
  return (
    <div className={classes.navBarContainer}>
      <SidebarButton />
      <CenterDisplay />
      <ConnectionIcon />
    </div>
  );
}

function CenterDisplay() {
  const classes = useStyles();
  const { keyringStoreState } = useKeyringStoreStateContext();
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
  const { keyringStoreState } = useKeyringStoreStateContext();
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
