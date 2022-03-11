import { Card, List, ListItem } from "@material-ui/core";
import {
  useBlockchains,
  useBlockchainTokens,
  useBlockchainBalance,
} from "../../hooks/useBlockchainBalances";

export function Balances() {
  const blockchains = useBlockchains();
  return (
    <div>
      {blockchains.map((b) => (
        <BlockchainCard blockchain={b} />
      ))}
    </div>
  );
}

function BlockchainCard({ blockchain }: { blockchain: string }) {
  const tokens = useBlockchainTokens(blockchain);
  return (
    <Card>
      <List>
        {tokens.map((t) => (
          <TokenListItem blockchain={blockchain} tokenAddress={t} />
        ))}
      </List>
    </Card>
  );
}

function TokenListItem({
  blockchain,
  tokenAddress,
}: {
  blockchain: string;
  tokenAddress: string;
}) {
  const token = useBlockchainBalance(blockchain, tokenAddress);
  console.log("token", token);
  return <div>{tokenAddress}</div>;
}
