import { useEffect, useState } from "react";
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

export function Router() {
  const { url } = useNavigation();
  const { navButtonRight, setNavButtonRight } = useNavigation();
  const { tab } = useTab();

  //
  // We set the nav button at the top level instead of the bottom so that
  // we can instantly render it, which makes for a nicer loading experience.
  // Otherwise, we'd have to wait for the content to load, which requires
  // the useBootstrap hook to finish.
  //
  useEffect(() => {
    const previous = navButtonRight;
    if (
      url.startsWith("/balances") ||
      url.startsWith("/apps") ||
      url.startsWith("/nfts")
    ) {
      setNavButtonRight(<SettingsButton />);
      return () => {
        setNavButtonRight(previous);
      };
    }
    if (url.startsWith("/token") || url.startsWith("/plugins")) {
      setNavButtonRight(null);
      return () => {
        setNavButtonRight(previous);
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
      <Route path="/simulator" element={<SimulatorPage />} />
      <Route path="*" element={<Redirect />} />
    </Routes>
  );
}

// The refresh code is a big hack. :)
function SimulatorPage() {
  const [refresh, setRefresh] = useState(0);
  const props = { pluginUrl: "http://localhost:9990" };

  useEffect(() => {
    let previous: any = null;
    const i = setInterval(() => {
      (async () => {
        const js = await (await fetch(props.pluginUrl)).text();
        if (previous !== null && previous !== js) {
          setRefresh((r) => r + 1);
        }
        previous = js;
      })();
    }, 900);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (refresh % 2 === 1) {
      setTimeout(() => {
        setRefresh((r) => r + 1);
      }, 10);
    }
  }, [refresh]);

  return refresh % 2 === 1 ? <div></div> : <PluginDisplay {...props} />;
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
