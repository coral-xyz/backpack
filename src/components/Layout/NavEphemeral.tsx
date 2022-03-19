import { Suspense } from "react";
import { makeStyles } from "@material-ui/core";
import { Scrollbar } from "./Scrollbar";
import { Loading } from "../common";
import {
  NavEphemeralProvider,
  useEphemeralNav,
} from "../../context/NavEphemeral";
import { DummyButton, _NavBackButton, __CenterDisplay } from "./Nav";

export const NAV_BAR_HEIGHT = 56;

const useStyles = makeStyles((theme: any) => ({
  withNavContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  navBarSuspense: {},
  navBarContainer: {
    display: "flex",
    justifyContent: "space-between",
    paddingLeft: "16px",
    paddingRight: "16px",
    paddingTop: "10px",
    paddingBottom: "10px",
    backgroundColor: theme.custom.colors.nav,
    //
    borderBottom: `solid 1pt ${theme.custom.colors.border}`,
    height: `${NAV_BAR_HEIGHT}px`,
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

export function WithEphemeralNav({ title, children }: any) {
  return (
    <NavEphemeralProvider title={title} root={children}>
      <NavBar />
      <NavContent />
    </NavEphemeralProvider>
  );
}

function NavBar() {
  const classes = useStyles();
  return (
    <div className={classes.navBarContainer}>
      <LeftNavButton />
      <CenterDisplay />
      <RightNavButton />
    </div>
  );
}

function NavContent() {
  return (
    <div style={{ flex: 1 }}>
      <Scrollbar>
        <Suspense fallback={<Loading />}>
          <_NavContent />
        </Suspense>
      </Scrollbar>
    </div>
  );
}

function _NavContent() {
  const { renderComponent } = useEphemeralNav();
  return renderComponent;
}

function LeftNavButton() {
  const { isRoot, pop } = useEphemeralNav();
  return isRoot ? <DummyButton /> : <_NavBackButton pop={pop} />;
}

function CenterDisplay() {
  const { title } = useEphemeralNav();
  return <__CenterDisplay title={title} />;
}

function RightNavButton() {
  const { navButtonRight } = useEphemeralNav();
  return navButtonRight ? navButtonRight : <DummyButton />;
}
