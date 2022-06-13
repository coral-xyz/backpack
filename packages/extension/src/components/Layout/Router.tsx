import { useSearchParams, Routes, Route, Navigate } from "react-router-dom";
import { useBootstrap, useNavigation } from "@200ms/recoil";
import { Balances } from "../Unlocked/Balances";
import { Token } from "../Unlocked/Balances/TokensWidget/Token";
import { PluginDisplay, PluginTableDetailDisplay } from "../Unlocked/Apps";
import { Nfts } from "../Unlocked/Nfts";
import { Apps } from "../Unlocked/Apps";

export function Router() {
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
  const [searchParams] = useSearchParams() as any;
  const { blockchain, address } = JSON.parse(searchParams.get("props"));
  return <Token blockchain={blockchain} address={address} />;
}

function PluginPage() {
  const [searchParams] = useSearchParams() as any;
  const { pluginUrl } = JSON.parse(searchParams.get("props"));
  return <PluginDisplay pluginUrl={pluginUrl} />;
}

function PluginTableDetailPage() {
  const [searchParams] = useSearchParams() as any;
  const { pluginUrl } = JSON.parse(searchParams.get("props"));
  return <PluginTableDetailDisplay pluginUrl={pluginUrl} />;
}
