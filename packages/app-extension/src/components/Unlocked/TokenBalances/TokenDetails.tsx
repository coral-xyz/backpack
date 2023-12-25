import { Blockchain } from "@coral-xyz/common";
import {
  BalanceDetails,
  type BalanceDetailsProps,
} from "@coral-xyz/data-components";
import { useActiveWallet, useIsDevnet } from "@coral-xyz/recoil";

import { TransferWidget } from "../Balances/TransferWidget";
import { NoRecentActivityLabel, TransactionsLoader } from "../Transactions";

export type TokenDetailsProps = {
  id: string;
  balance: BalanceDetailsProps["balance"];
  displayAmount: string;
  symbol: string;
  token: string;
  tokenAddress: string;
};

export function TokenDetails({
  id,
  balance,
  displayAmount,
  symbol,
  token,
  tokenAddress,
}: TokenDetailsProps) {
  const { blockchain, publicKey } = useActiveWallet();
  const isDevnet = useIsDevnet();
  const swapEnabled = blockchain === Blockchain.SOLANA && !isDevnet;

  return (
    <BalanceDetails
      amount={displayAmount}
      balance={balance}
      emptyTransactionsComponent={
        <NoRecentActivityLabel
          hideButton
          style={{ marginLeft: 16, marginRight: 16 }}
          minimize={false}
        />
      }
      loaderComponent={<TransactionsLoader />}
      symbol={symbol}
      token={token}
      widgets={
        <div>
          <TransferWidget
            rampEnabled
            assetId={id}
            address={blockchain === Blockchain.SOLANA ? tokenAddress : token}
            blockchain={blockchain}
            publicKey={publicKey}
            swapEnabled={swapEnabled}
          />
        </div>
      }
    />
  );
}
