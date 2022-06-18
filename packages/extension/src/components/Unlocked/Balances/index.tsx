import { PluginRenderer } from "@coral-xyz/anchor-ui-renderer";
import { useTablePlugins } from "@coral-xyz/recoil";
import { TransferWidget } from "./TransferWidget";
import { BalanceSummaryWidget } from "./BalanceSummaryWidget";
import { TokensWidget } from "./TokensWidget";

export function Balances() {
  return (
    <div>
      <BalanceSummaryWidget blockchain={"solana"} />
      <TransferWidget />
      <TokensWidget />
      <PluginTables />
    </div>
  );
}

function PluginTables() {
  const tablePlugins = useTablePlugins();
  return (
    <>
      {tablePlugins.map((plugin: any) => {
        return <PluginRenderer key={plugin.iframeUrl} plugin={plugin} />;
      })}
    </>
  );
}
