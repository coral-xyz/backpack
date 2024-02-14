import { lazy, Suspense } from "react";
import { Blockchain } from "@coral-xyz/common";
import { BalanceDetails } from "@coral-xyz/data-components";
import { useActiveWallet, useIsDevnet, useSolanaCtx } from "@coral-xyz/recoil";
import { SOL_NATIVE_MINT } from "@coral-xyz/secure-clients/legacyCommon";
import { StakeButtonComponent } from "@coral-xyz/staking/src/StakeButtonComponent";
import { View } from "@coral-xyz/tamagui";
import { useNavigation } from "@react-navigation/native";

import { Routes } from "../../../refactor/navigation/WalletsNavigator";
import { TransferWidget } from "../Balances/TransferWidget";
import { TransactionsLoader } from "../Transactions";

const StakeButtonWithData = lazy(() => import("../Stake/StakeButton"));

export type TokenDetailsProps = {
  id: string;
  displayAmount: string;
  symbol: string;
  token: string;
  tokenAddress: string;
};

export function TokenDetails({
  id,
  displayAmount,
  symbol,
  token,
  tokenAddress,
}: TokenDetailsProps) {
  const { blockchain, publicKey } = useActiveWallet();
  const { connectionCluster } = useSolanaCtx();
  const isDevnet = useIsDevnet();
  const navigation = useNavigation<any>();
  const swapEnabled = blockchain === Blockchain.SOLANA && !isDevnet;

  const isSolanaNativeToken =
    token === SOL_NATIVE_MINT && blockchain === Blockchain.SOLANA;

  const stakingEnabled =
    isSolanaNativeToken &&
    Number(displayAmount) > 0 &&
    connectionCluster !== "devnet";

  return (
    <BalanceDetails
      loaderComponent={<TransactionsLoader />}
      onLinkClick={window.open}
      onTransactionItemClick={(transaction, explorer, details) => {
        if (!details) {
          window.open(explorer);
        } else {
          navigation.push(Routes.ActivityDetailScreen, {
            transaction,
          });
        }
      }}
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

          {stakingEnabled ? (
            <View marginHorizontal="$4" marginTop="$4">
              <Suspense fallback={<StakeButtonComponent />}>
                <StakeButtonWithData />
              </Suspense>
            </View>
          ) : null}
        </div>
      }
    />
  );
}
