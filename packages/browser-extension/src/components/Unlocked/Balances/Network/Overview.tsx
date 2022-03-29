import { BalancesHeader, BlockchainCard } from "../";

export function Overview({ blockchain }: { blockchain: string }) {
  return (
    <div>
      <BalancesHeader blockchain={blockchain} />
      <BlockchainCard blockchain={blockchain} title={"All Wallets"} />
    </div>
  );
}
