import { PluginRenderer } from "@coral-xyz/react-xnft-renderer";
import { useTablePlugins } from "@coral-xyz/recoil";
import { TransferWidget } from "./TransferWidget";
import { BalanceSummaryWidget } from "./BalanceSummaryWidget";
import { TokensWidget } from "./TokensWidget";
import { Blockchain } from "@coral-xyz/common";

export function Balances() {
  return (
    <div>
      <BalanceSummaryWidget blockchain={Blockchain.SOLANA} />
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
