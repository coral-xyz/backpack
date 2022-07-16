import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { SIMULATOR_PORT } from "@coral-xyz/common";
import {
  useDecodedSearchParams,
  useBootstrap,
  useNavigation,
  useTab,
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

export function Router() {
  const theme = useCustomTheme();
  const {
    url,
    navButtonRight,
    setNavButtonRight,
    navButtonLeft,
    setNavButtonLeft,
    style: navStyle,
    setStyle,
  } = useNavigation();
  const { tab } = useTab();

  //
  // We set the nav button at the top level instead of the bottom so that
  // we can instantly render it, which makes for a nicer loading experience.
  // Otherwise, we'd have to wait for the content to load, which requires
  // the useBootstrap hook to finish.
  //
  useEffect(() => {
    const previous = navButtonRight;
    const previousLeft = navButtonLeft;
    const previousStyle = navStyle;
    const actions: any = [];
    if (
      url.startsWith("/balances") ||
      url.startsWith("/apps") ||
      url.startsWith("/nfts")
    ) {
      setNavButtonRight(<SettingsButton />);
      actions.push(() => {
        setNavButtonRight(previous);
      });
    }
    if (
      url.startsWith("/token") ||
      url.startsWith("/plugins") ||
      url.startsWith("/simulator")
    ) {
      setNavButtonRight(null);
      actions.push(() => {
        setNavButtonRight(previous);
      });
    }

    if (url.startsWith("/plugins") || url.startsWith("/simulator")) {
      setNavButtonLeft(<ExitAppButton />);
      setStyle({
        backgroundColor: theme.custom.colors.nav,
        height: "45px",
        borderBottom: "none",
        fontSize: "16px",
      });
      actions.push(() => {
        setNavButtonLeft(previousLeft);
        setStyle(previousStyle);
      });
    }

    return () => {
      actions.forEach((action: any) => action());
    };
  }, [url, tab]);
  return <_Router />;
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

function _Router() {
  useBootstrap();
  return (
    <Routes>
      <Route path="/balances" element={<BalancesPage />} />
      <Route path="/nfts" element={<NftsPage />} />
      <Route path="/apps" element={<AppsPage />} />
      <Route path="/token" element={<TokenPage />} />
      <Route path="/plugins" element={<PluginPage />} />
      <Route path="/simulator" element={<SimulatorPage />} />
      <Route path="*" element={<Redirect />} />
    </Routes>
  );
}

function Redirect() {
  const { url } = useNavigation();
  return <Navigate to={url} replace />;
}

function BalancesPage() {
  return <Balances />;
}

function NftsPage() {
  return <Nfts />;
}

function AppsPage() {
  return <Apps />;
}

function TokenPage() {
  const { props } = useDecodedSearchParams<SearchParamsFor.Token>();
  return <Token {...props} />;
}

function PluginPage() {
  const { props } = useDecodedSearchParams<SearchParamsFor.Plugin>();
  return <PluginDisplay {...props} />;
}

function SimulatorPage() {
  return <Simulator pluginUrl={`http://localhost:${SIMULATOR_PORT}`} />;
}
