import { Suspense } from "react";
import { useNavigation } from "@200ms/recoil";
import { useTheme, Typography, IconButton } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { ArrowBack } from "@mui/icons-material";
import { Scrollbar } from "./Scrollbar";
import { Loading } from "../common";
import { WithTabs } from "./Tab";
import { Router } from "./Router";
import { ApproveTransactionRequest } from "../Unlocked/ApproveTransactionRequest";

export const NAV_BAR_HEIGHT = 56;
export const NAV_BUTTON_WIDTH = 38;

const useStyles = makeStyles((theme: any) => ({
  withNavContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  navBarContainer: {
    display: "flex",
    justifyContent: "space-between",
    paddingLeft: "16px",
    paddingRight: "16px",
    paddingTop: "10px",
    paddingBottom: "10px",
  },
  menuButtonContainer: {
    width: `${NAV_BUTTON_WIDTH}px`,
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    position: "relative",
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

// The main nav persistent stack.
export function TabNavStack() {
  const classes = useStyles();
  return (
    <WithTabs>
      <div className={classes.withNavContainer}>
        <NavBar />
        <NavContent />
        <ApproveTransactionRequest />
      </div>
    </WithTabs>
  );
}

function NavBar() {
  return (
    <Suspense fallback={<div></div>}>
      <_NavBar />
    </Suspense>
  );
}

function _NavBar() {
  const classes = useStyles();
  const theme = useTheme() as any;
  const { isRoot } = useNavigation();
  return (
    <div
      style={{
        borderBottom: !isRoot
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
  const { isRoot } = useNavigation();
  return isRoot ? <DummyButton /> : <NavBackButton />;
}

function RightNavButton() {
  const { navButtonRight } = useNavigation();
  return navButtonRight ? navButtonRight : <DummyButton />;
}

export function NavBackButton() {
  const { pop } = useNavigation();
  return <_NavBackButton pop={pop} />;
}

export function _NavBackButton({ pop }: any) {
  const classes = useStyles();
  const theme = useTheme() as any;
  return (
    <div style={{ display: "flex", width: `${NAV_BUTTON_WIDTH}px` }}>
      <IconButton
        disableRipple
        onClick={() => pop()}
        className={classes.backButton}
        size="large"
        data-testid="back-button"
      >
        <ArrowBack style={{ color: theme.custom.colors.secondary }} />
      </IconButton>
    </div>
  );
}

function NavContent() {
  return (
    <div style={{ flex: 1 }}>
      <Scrollbar>
        <Suspense fallback={<Loading />}>
          <Router />
        </Suspense>
      </Scrollbar>
    </div>
  );
}

function CenterDisplay() {
  return (
    <Suspense fallback={<div></div>}>
      <_CenterDisplay />
    </Suspense>
  );
}

function _CenterDisplay() {
  const { title, isRoot } = useNavigation();
  return <__CenterDisplay title={title} isRoot={isRoot} />;
}

export function __CenterDisplay({ title, isRoot }: any) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        visibility: isRoot ? "hidden" : undefined,
      }}
    >
      <NavTitleLabel title={title} />
    </div>
  );
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

export function DummyButton() {
  const classes = useStyles();
  return <div className={classes.menuButtonContainer}></div>;
}
