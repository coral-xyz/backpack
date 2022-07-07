import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  useDecodedSearchParams,
  useBootstrap,
  useNavigation,
  useTab,
} from "@coral-xyz/recoil";
import type { SearchParamsFor } from "@coral-xyz/recoil";
import { Balances } from "../Unlocked/Balances";
import { Token } from "../Unlocked/Balances/TokensWidget/Token";
import {
  PluginDisplay,
  Apps,
  PluginTableDetailDisplay,
} from "../Unlocked/Apps";
import { Nfts } from "../Unlocked/Nfts";
import { SettingsButton } from "../Settings";
import { PriceButton } from "../Unlocked/Prices";

export function Router() {
  const { url } = useNavigation();
  const { navButtonRight, navButtonLeft, setNavButtonRight, setNavButtonLeft } =
    useNavigation();
  const { tab } = useTab();

  //
  // We set the nav button at the top level instead of the bottom so that
  // we can instantly render it, which makes for a nicer loading experience.
  // Otherwise, we'd have to wait for the content to load, which requires
  // the useBootstrap hook to finish.
  //
  useEffect(() => {
    console.log("armani url here", url);
    const previous = navButtonRight;
    const previousLeft = navButtonLeft;
    if (
      url.startsWith("/balances") ||
      url.startsWith("/apps") ||
      url.startsWith("/nfts")
    ) {
      setNavButtonRight(<SettingsButton />);
      setNavButtonLeft(<PriceButton />);
      return () => {
        setNavButtonRight(previous);
        setNavButtonLeft(previousLeft);
      };
    }
    if (url.startsWith("/token") || url.startsWith("/plugins")) {
      setNavButtonRight(null);
      setNavButtonLeft(null);
      return () => {
        setNavButtonRight(previous);
        setNavButtonLeft(previousLeft);
      };
    }
  }, [url, tab]);
  return <_Router />;
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
      <Route path="/plugin-table-detail" element={<PluginTableDetailPage />} />
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

function PluginTableDetailPage() {
  const { props } = useDecodedSearchParams<SearchParamsFor.Plugin>();
  return <PluginTableDetailDisplay {...props} />;
}
