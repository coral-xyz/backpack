import React, { useState, useContext } from "react";
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
import { useNavStack, WithMotion, NavStack, NavStackScreen } from "./NavStack";

export function Router3() {
  return (
    <NavStack initialRoute={{ name: "home1" }} options={routeOptions}>
      <NavStackScreen name={"home1"} component={NavHome1} />
      <NavStackScreen name={"home2"} component={NavHome2} />
    </NavStack>
  );
}

function routeOptions({ route }: { route: { name: string; props?: any } }) {
  switch (route.name) {
    case "home1":
      return {
        title: "Home Title 1",
      };
    case "home2":
      return {
        title: "Test 2",
      };
    default:
      console.log(route);
      throw new Error("unknown route");
  }
}

export function Router2() {
  const [page, setPage] = useState(1);
  return (
    <AnimatePresence initial={false}>
      <WithMotion id={page} navAction={"push"}>
        {page === 1 && <Home1 onClick={() => setPage(2)} />}
        {page === 2 && <Home2 onClick={() => setPage(1)} />}
      </WithMotion>
    </AnimatePresence>
  );
}

export function Router() {
  const location = useLocation();

  return (
    <AnimatePresence initial={false}>
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

function NavHome1() {
  const { push, pop } = useNavStack();
  return (
    <div>
      <div
        onClick={() => push("home2", { title: "armani" })}
        style={{ color: "white" }}
      >
        Push home 1
      </div>
      <div onClick={() => pop()} style={{ color: "white" }}>
        Pop home 1
      </div>
    </div>
  );
}

function NavHome2({ title }: any) {
  const { push, pop } = useNavStack();
  return (
    <div>
      <div onClick={() => push("home1")} style={{ color: "white" }}>
        Push home 2
      </div>
      <div onClick={() => pop()} style={{ color: "white" }}>
        {title}
      </div>
    </div>
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
    <WithMotionWrapper>
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
    </WithMotionWrapper>
  );
}

function WithMotionWrapper({ children }: { children: any }) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navAction = searchParams.get("nav");
  return (
    <WithMotion id={location.pathname} navAction={navAction}>
      {children}
    </WithMotion>
  );
}

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
