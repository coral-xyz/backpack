import React, { useState } from "react";
import {
  useLocation,
  useSearchParams,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { SIMULATOR_PORT } from "@coral-xyz/common";
import {
  useDecodedSearchParams,
  useBootstrap,
  useNavigation,
  useRedirectUrl,
} from "@coral-xyz/recoil";
import type { SearchParamsFor } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { IconButton } from "@mui/material";
import TransitEnterexitIcon from "@mui/icons-material/TransitEnterexit";
import { Balances } from "../Unlocked/Balances";
import { Token } from "../Unlocked/Balances/TokensWidget/Token";
import { Apps } from "../Unlocked/Apps";
import { PluginDisplay } from "../Unlocked/Apps/Plugin";
import { Simulator } from "../Unlocked/Apps/Simulator";
import { Nfts } from "../Unlocked/Nfts";
import { SettingsButton } from "../Settings";
import { WithNav, NavBackButton } from "./Nav";

export function NavStackRouter() {
  return (
    <NavStack initial={"home1"}>
      <NavStackScreen name="home1" component={Home1} />
      <NavStackScreen name="home2" component={Home2} />
    </NavStack>
  );
}

function NavStack({ initial, children }: any) {
  return (
    <AnimatePresence>
      <WithMotionInner></WithMotionInner>
    </AnimatePresence>
  );
}

function NavStackScreen({
  name,
  component,
}: {
  name: string;
  component: (props: any) => React.ReactNode;
}) {
  // todo
  return <></>;
}

export function Router2() {
  const [page, setPage] = useState(1);
  return (
    <AnimatePresence initial={false}>
      <WithMotionInner id={page} navAction={"push"}>
        {page === 1 && <Home1 onClick={() => setPage(2)} />}
        {page === 2 && <Home2 onClick={() => setPage(1)} />}
      </WithMotionInner>
    </AnimatePresence>
  );
}

export function Router() {
  const location = useLocation();

  // TODO: add initial=false prop to animate presence.
  return (
    <AnimatePresence>
      <Routes location={location} key={location.pathname}>
        <Route path="/balances" element={<BalancesPage />} />
        <Route path="/balances/token" element={<TokenPage />} />
        <Route path="/apps" element={<AppsPage />} />
        <Route path="/apps/plugins" element={<PluginPage />} />
        <Route path="/apps/simulator" element={<SimulatorPage />} />
        <Route path="/nfts" element={<NftsPage />} />
        <Route path="*" element={<Redirect />} />
      </Routes>
    </AnimatePresence>
  );
}

function Home1({ onClick, asdf }: any) {
  return (
    <div onClick={() => onClick()} style={{ color: "white" }}>
      Testing home 1
    </div>
  );
}

function Home2({ onClick, asdf }: any) {
  return (
    <div onClick={() => onClick()} style={{ color: "white" }}>
      Testing home 2
    </div>
  );
}

function Redirect() {
  const url = useRedirectUrl();
  return <Navigate to={url} replace />;
}

function BalancesPage() {
  return <NavScreen component={<Balances />} />;
}

function NftsPage() {
  return <NavScreen component={<Nfts />} />;
}

function AppsPage() {
  return <NavScreen component={<Apps />} />;
}

function TokenPage() {
  const { props } = useDecodedSearchParams<SearchParamsFor.Token>();
  return <NavScreen component={<Token {...props} />} />;
}

function PluginPage() {
  const { props } = useDecodedSearchParams<SearchParamsFor.Plugin>();
  return <NavScreen component={<PluginDisplay {...props} />} />;
}

function SimulatorPage() {
  return (
    <NavScreen
      component={<Simulator pluginUrl={`http://localhost:${SIMULATOR_PORT}`} />}
    />
  );
}

function ExitAppButton() {
  const theme = useCustomTheme();
  const nav = useNavigation();
  return (
    <IconButton
      style={{
        padding: 0,
      }}
      onClick={() => nav.pop()}
    >
      <TransitEnterexitIcon style={{ color: theme.custom.colors.secondary }} />
    </IconButton>
  );
}

function NavScreen({ component }: { component: React.ReactNode }) {
  const { title, isRoot, pop } = useNavigation();
  const { style, navButtonLeft, navButtonRight } = useNavBar();

  const _navButtonLeft = navButtonLeft ? (
    navButtonLeft
  ) : isRoot ? null : (
    <NavBackButton onClick={pop} />
  );

  return (
    <WithMotion>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <WithNav
          title={title}
          navButtonLeft={_navButtonLeft}
          navButtonRight={navButtonRight}
          navbarStyle={style}
        >
          <NavBootstrap>{component}</NavBootstrap>
        </WithNav>
      </div>
    </WithMotion>
  );
}

function WithMotion({ children, id }: { children: any; id?: string }) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  let navAction = searchParams.get("nav");
  return (
    <WithMotionInner id={location.pathname} navAction={navAction}>
      {children}
    </WithMotionInner>
  );
}

function WithMotionInner({ children, id, navAction }: any) {
  return (
    <motion.div
      key={id}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
      variants={MOTION_VARIANTS}
      initial={!navAction || navAction === "tab" ? {} : "initial"}
      animate={!navAction || navAction === "tab" ? {} : "animate"}
      exit={!navAction || navAction === "tab" ? {} : "exit"}
    >
      {children}
    </motion.div>
  );
}

const MOTION_VARIANTS = {
  initial: {
    opacity: 0,
  },
  animate: {
    translateX: 0,
    opacity: 1,
    transition: { delay: 0.09 },
  },
  exit: {
    translateX: window.innerWidth,
    transition: { delay: 0.09, duration: 0.1 },
    opacity: 0,
  },
};

function useNavBar() {
  const theme = useCustomTheme();
  let { isRoot } = useNavigation();
  const pathname = useLocation().pathname;

  let navButtonLeft = null as any;
  let navButtonRight = null as any;

  let navStyle = {
    fontSize: "18px",
    borderBottom: !isRoot
      ? `solid 1pt ${theme.custom.colors.border}`
      : undefined,
  } as React.CSSProperties;

  if (isRoot) {
    navButtonRight = <SettingsButton />;
  } else if (
    pathname === "/balances/token" ||
    pathname === "/apps/plugins" ||
    pathname === "/apps/simulator"
  ) {
    navButtonRight = null;
  }
  if (pathname === "/apps/plugins" || pathname === "/apps/simulator") {
    navButtonLeft = <ExitAppButton />;
    navStyle = {
      backgroundColor: theme.custom.colors.nav,
      height: "45px",
      borderBottom: "none",
      fontSize: "16px",
    };
  }

  return {
    navButtonRight,
    navButtonLeft,
    style: navStyle,
  };
}

function NavBootstrap({ children }: any) {
  useBootstrap();
  return <>{children}</>;
}
