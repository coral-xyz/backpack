import { Suspense } from "react";
import { useTheme } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { NavEphemeralProvider, useEphemeralNav } from "@coral-xyz/recoil";
import { Scrollbar } from "./Scrollbar";
import { Loading } from "../common";
import {
  DummyButton,
  NAV_BAR_HEIGHT,
  _NavBackButton,
  __CenterDisplay,
} from "./Nav";

const useStyles = makeStyles((theme: any) => ({
  navBarContainer: {
    display: "flex",
    justifyContent: "space-between",
    paddingLeft: "16px",
    paddingRight: "16px",
    paddingTop: "10px",
    paddingBottom: "10px",
    backgroundColor: theme.custom.colors.background,
    height: `${NAV_BAR_HEIGHT}px`,
  },
  navContentContainer: {
    flex: 1,
    backgroundColor: theme.custom.colors.background,
  },
}));

export function WithEphemeralNav({ title, children, navbarStyle }: any) {
  return (
    <NavEphemeralProvider title={title} root={children}>
      <NavBar style={navbarStyle} />
      <NavContent />
    </NavEphemeralProvider>
  );
}

function NavBar({ style }: any) {
  const classes = useStyles();
  const theme = useTheme() as any;
  const navbarStyle = {
    borderBottom: `solid 1pt ${theme.custom.colors.border}`,
    ...(style ?? {}),
  };
  return (
    <div className={classes.navBarContainer} style={navbarStyle}>
      <LeftNavButton />
      <CenterDisplay />
      <RightNavButton />
    </div>
  );
}

function NavContent() {
  const classes = useStyles();
  return (
    <div className={classes.navContentContainer}>
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
