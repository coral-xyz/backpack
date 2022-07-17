import React, { useEffect } from "react";
import { useLocation, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { TAB_SET, SIMULATOR_PORT } from "@coral-xyz/common";
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
import { TAB_HEIGHT } from "./Tab";

export function Router() {
  const location = useLocation();
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/balances" element={<BalancesPage />} />
      <Route path="/balances/token" element={<TokenPage />} />
      <Route path="/apps" element={<AppsPage />} />
      <Route path="/apps/plugins" element={<PluginPage />} />
      <Route path="/apps/simulator" element={<SimulatorPage />} />
      <Route path="/nfts" element={<NftsPage />} />
      <Route path="*" element={<Redirect />} />
    </Routes>
  );
}

function Redirect() {
  const url = useRedirectUrl();
  return <Navigate to={url} replace />;
}

function BalancesPage() {
  return <_WithNav component={<Balances />} />;
}

function NftsPage() {
  return <_WithNav component={<Nfts />} />;
}

function AppsPage() {
  return <_WithNav component={<Apps />} />;
}

function TokenPage() {
  const { props } = useDecodedSearchParams<SearchParamsFor.Token>();
  return <_WithNav component={<Token {...props} />} />;
}

function PluginPage() {
  const { props } = useDecodedSearchParams<SearchParamsFor.Plugin>();
  return <_WithNav component={<PluginDisplay {...props} />} />;
}

function SimulatorPage() {
  return (
    <_WithNav
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

function _WithNav({ component }: { component: React.ReactNode }) {
  const { title, isRoot, pop } = useNavigation();
  const { style, navButtonLeft, navButtonRight } = useNavBar();
  const _navButtonLeft = navButtonLeft ? (
    navButtonLeft
  ) : isRoot ? null : (
    <NavBackButton onClick={pop} />
  );

  return (
    <>
      <WithNav
        title={title}
        navButtonLeft={_navButtonLeft}
        navButtonRight={navButtonRight}
        navbarStyle={style}
      >
        <NavBootstrap>{component}</NavBootstrap>
      </WithNav>
    </>
  );
}

function useNavBar() {
  const theme = useCustomTheme();
  let { isRoot } = useNavigation();

  let navButtonLeft = null as any;
  let navButtonRight = null as any;

  const pathname = useLocation().pathname;
  let navStyle = {
    fontSize: "18px",
    borderBottom: !isRoot
      ? `solid 1pt ${theme.custom.colors.border}`
      : undefined,
  } as React.CSSProperties;

  if (TAB_SET.has(pathname.slice(1))) {
    navButtonRight = <SettingsButton />;
  }
  if (
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
