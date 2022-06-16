import { Routes, Route, Navigate } from "react-router-dom";
import {
  useDecodedSearchParams,
  useBootstrap,
  useNavigation,
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
  const { props } = useDecodedSearchParams<SearchParamsFor.Token>();
  return <Token {...props} />;
}

function PluginPage() {
  const { props } = useDecodedSearchParams<SearchParamsFor.Plugin>();
  console.log({ props });
  return <PluginDisplay {...props} />;
}

function PluginTableDetailPage() {
  const { props } = useDecodedSearchParams<SearchParamsFor.Plugin>();
  return <PluginTableDetailDisplay {...props} />;
}
