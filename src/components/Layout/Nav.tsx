import { Suspense, useMemo } from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import {
  makeStyles,
  Typography,
  IconButton,
  useTheme,
} from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import { KeyringStoreStateEnum } from "../../keyring/store";
import { useKeyringStoreState } from "../../context/KeyringStoreState";
import { SidebarButton } from "./Sidebar";
import { Scrollbar } from "./Scrollbar";
import {
  NavigationProvider,
  useNavigationContext,
  //  NavigationContent,
} from "../../context/Navigation";

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

export function WithNav(props: any) {
  return (
    <NavigationProvider
      title={props.title}
      name={props.name}
      root={props.children}
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <NavBar />
        <NavContent />
      </div>
    </NavigationProvider>
  );
}

function NavBar() {
  const classes = useStyles();
  const { stack } = useNavigationContext();
  return (
    <div className={classes.navBarContainer}>
      {stack.components.length === 1 ? <SidebarButton /> : <NavBackButton />}
      <CenterDisplay />
      <DummyButton />
    </div>
  );
}

function NavBackButton() {
  const theme = useTheme() as any;
  const { pop } = useNavigationContext();
  return (
    <div style={{ display: "flex", width: "38px" }}>
      <IconButton disableRipple onClick={() => pop()} style={{ padding: 0 }}>
        <ArrowBack style={{ color: theme.custom.colors.secondary }} />
      </IconButton>
    </div>
  );
}

function NavContent() {
  const { stack } = useNavigationContext();
  const render = stack.components[stack.components.length - 1];
  return (
    <div style={{ flex: 1 }}>
      <Scrollbar>{render}</Scrollbar>
    </div>
  );
}

function CenterDisplay() {
  const classes = useStyles();
  const { title } = useNavigationContext();
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
  const { title } = useNavigationContext();
  return <Typography className={classes.overviewLabel}>{title}</Typography>;
}

function DummyButton() {
  const classes = useStyles();
  return <div className={classes.menuButtonContainer}></div>;
}
