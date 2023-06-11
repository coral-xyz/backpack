import type { Blockchain } from "@coral-xyz/common";

import { formatUsd } from "@coral-xyz/common";

export function coalesceWalletData(graphqlData, recoilWallets) {
  // TODO: this is a hack, we should be able to get the wallets from the query
  const wallets = graphqlData.user.wallets.edges.map((edge) => {
    const a = recoilWallets.find(
      (wallet) => wallet.publicKey === edge.node.address
    );

    return {
      ...edge.node,
      publicKey: edge.node.address,
      isPrimary: edge.node.isPrimary,
      blockchain: edge.node.provider.name.toLowerCase() as Blockchain,
      balance: formatUsd(edge.node.balances.aggregate.value),
      // TODO: this is a hack, we should be able to get the wallets from the query
      name: a?.name ?? "",
      type: a?.type ?? "",
    };
  });

  return wallets;
}
