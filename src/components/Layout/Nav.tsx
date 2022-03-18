import { Suspense } from "react";
import {
  makeStyles,
  Typography,
  IconButton,
  useTheme,
} from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import { KeyringStoreStateEnum } from "../../keyring/store";
import { useKeyringStoreState } from "../../hooks/useKeyringStoreState";
import { SidebarButton } from "./Sidebar";
import { Scrollbar } from "./Scrollbar";
import {
  NavigationStackProvider,
  useNavigationContext,
  useNavigationRender,
} from "../../context/Navigation";
import { UnlockedLoading } from "../Unlocked";

export const NAV_BAR_HEIGHT = 56;

const useStyles = makeStyles((theme: any) => ({
  navBarContainer: {
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
    lineHeight: "24px",
    color: theme.custom.colors.fontColor,
  },
  overviewLabelPrefix: {
    color: theme.custom.colors.secondary,
  },
  backButton: {
    padding: 0,
    "&:hover": {
      background: "transparent",
    },
  },
}));

export function WithNav(props: any) {
  return (
    <Suspense fallback={<div></div>}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <NavBar />
        {props.children}
      </div>
    </Suspense>
  );
}

export function WithNavContext(props: any) {
  return (
    <NavigationStackProvider root={props.children}>
      <NavContent />
    </NavigationStackProvider>
  );
}

function NavBar() {
  const classes = useStyles();
  const theme = useTheme() as any;
  const { navBorderBottom } = useNavigationContext();
  return (
    <div
      style={{
        borderBottom: navBorderBottom
          ? `solid 1pt ${theme.custom.colors.border}`
          : undefined,
        height: `${NAV_BAR_HEIGHT}px`,
      }}
      className={classes.navBarContainer}
    >
      <LeftNavButton />
      <CenterDisplay />
      <RightNavButton />
    </div>
  );
}

function LeftNavButton() {
  const { isRoot } = useNavigationContext();
  return isRoot ? <SidebarButton /> : <NavBackButton />;
}

function RightNavButton() {
  const { navButtonRight } = useNavigationContext();
  return navButtonRight ? navButtonRight : <DummyButton />;
}

function NavBackButton() {
  const classes = useStyles();
  const theme = useTheme() as any;
  const { pop } = useNavigationContext();
  return (
    <div style={{ display: "flex", width: "38px" }}>
      <IconButton
        disableRipple
        onClick={() => pop()}
        className={classes.backButton}
      >
        <ArrowBack style={{ color: theme.custom.colors.secondary }} />
      </IconButton>
    </div>
  );
}

function NavContent() {
  const render = useNavigationRender();
  return (
    <div style={{ flex: 1 }}>
      <Scrollbar>
        <Suspense fallback={<UnlockedLoading />}>{render()}</Suspense>
      </Scrollbar>
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
  const { title } = useNavigationContext();
  return <NavTitleLabel title={title} />;
}

export function NavTitleLabel({ title }: any) {
  const classes = useStyles();
  const titleComponents = title.split("/");
  return titleComponents.length === 2 ? (
    <Typography className={classes.overviewLabel}>
      <span className={classes.overviewLabelPrefix}>
        {titleComponents[0]} /
      </span>
      {titleComponents[1]}
    </Typography>
  ) : (
    <Typography className={classes.overviewLabel}>{title}</Typography>
  );
}

function DummyButton() {
  const classes = useStyles();
  return <div className={classes.menuButtonContainer}></div>;
}
