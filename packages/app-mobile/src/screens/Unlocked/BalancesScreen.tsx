import { Screen } from "@components";
import { TransferWidget } from "@components/Unlocked/Balances/TransferWidget";
import type { Blockchain } from "@coral-xyz/common";
import {
  ETH_NATIVE_MINT,
  NAV_COMPONENT_TOKEN,
  SOL_NATIVE_MINT,
  toTitleCase,
  walletAddressDisplay,
} from "@coral-xyz/common";
import type { useBlockchainTokensSorted } from "@coral-xyz/recoil";
import {
  blockchainBalancesSorted,
  useActiveWallets,
  useBlockchainConnectionUrl,
  useBlockchainLogo,
  useEnabledBlockchains,
  useLoader,
} from "@coral-xyz/recoil";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

// TODO move this
export type Token = ReturnType<typeof useBlockchainTokensSorted>[number];

function BalanceSummaryWidget() {
  return null;
}

export function TokenTable({
  blockchain,
  onClickRow,
  tokenAccounts,
  searchFilter = "",
  customFilter = () => true,
  displayWalletHeader = true,
}: {
  blockchain: Blockchain;
  onClickRow: (blockchain: Blockchain, token: Token) => void;
  tokenAccounts?: ReturnType<typeof useBlockchainTokensSorted>;
  searchFilter?: string;
  customFilter?: (token: Token) => boolean;
  displayWalletHeader?: boolean;
}) {
  const title = toTitleCase(blockchain);
  // points to a relative path when it should point to a URL or something different. perhaps @coral-xyz/assets
  const blockchainLogo = useBlockchainLogo(blockchain);
  const connectionUrl = useBlockchainConnectionUrl(blockchain);
  const activeWallets = useActiveWallets();
  const wallet = activeWallets.filter((w) => w.blockchain === blockchain)[0];

  console.log({ title, blockchainLogo, connectionUrl, activeWallets, wallet });

  const [_tokenAccounts, _, isLoading] = tokenAccounts
    ? [tokenAccounts, "hasValue"]
    : useLoader(
        blockchainBalancesSorted(blockchain),
        [],
        [wallet.publicKey, connectionUrl]
      );

  const [search, setSearch] = useState(searchFilter);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const searchLower = search.toLowerCase();
  const tokenAccountsFiltered = _tokenAccounts
    .filter(
      (t: any) =>
        t.name &&
        (t.name.toLowerCase().startsWith(searchLower) ||
          t.ticker.toLowerCase().startsWith(searchLower))
    )
    .filter(customFilter);

  useEffect(() => {
    setSearch(searchFilter);
  }, [searchFilter]);

  const onCopy = () => {
    setTooltipOpen(true);
    setTimeout(() => setTooltipOpen(false), 1000);
    navigator.clipboard.writeText(wallet.publicKey.toString());
  };

  const useVirtualization = tokenAccountsFiltered.length > 100;
  // Note: if this fixed height changes in react-xnft-renderer it'll need to be changed here
  const rowHeight = 68;
  const headerHeight = 36;
  // If using virtualization, restrict the table height to 6 rows with an internal scrollbar
  const tableStyle = useVirtualization
    ? {
        height:
          headerHeight +
          Math.min(tokenAccountsFiltered.length, 6) * rowHeight +
          "px",
      }
    : {};

  const addressDisplay = walletAddressDisplay(wallet?.publicKey);

  return (
    <View style={{ backgroundColor: "yellow", marginBottom: 12 }}>
      <Text>
        {JSON.stringify(
          {
            connectionUrl,
            activeWallets,
            wallet,
            blockchainLogo,
            addressDisplay,
            tokenAccountsFiltered,
            blockchain,
          },
          null,
          2
        )}
      </Text>
    </View>
  );
}

// for each blockchain, render each of the tokens on BalancesScreen
export function TokenTables({
  blockchains,
  onPressRow,
  searchFilter = "",
  customFilter = () => true,
}: {
  blockchains?: Array<Blockchain>;
  onPressRow: (blockchain: Blockchain, token: Token) => void;
  searchFilter?: string;
  customFilter?: (token: Token) => boolean;
}) {
  const enabledBlockchains = useEnabledBlockchains();
  const filteredBlockchains =
    blockchains?.filter((b) => enabledBlockchains.includes(b)) ||
    enabledBlockchains;

  console.log({ enabledBlockchains, filteredBlockchains });

  return (
    <>
      {filteredBlockchains.map((blockchain: Blockchain) => (
        <TokenTable
          key={blockchain}
          blockchain={blockchain}
          onPressRow={onPressRow}
          searchFilter={searchFilter}
          customFilter={customFilter}
        />
      ))}
    </>
  );
}

export default function BalancesScreen({ navigation }) {
  console.log("balances");
  // const background = useBackgroundClient();
  //  const wallet = useActiveSolanaWallet();

  const onPressTokenRow = (blockchain: Blockchain, token: Token) => {
    navigation.push("BlockchainTickerScreenTODO", {
      // title: `${toTitleCase(blockchain)} / ${token.ticker}`, TODO figure out push() and useNav to see where this goes
      // TODO can probably all go under props (useNavigationSegue)
      title: `${toTitleCase(blockchain)} / ${token.ticker}`,
      componentId: NAV_COMPONENT_TOKEN,
      componentProps: {
        blockchain,
        address: token.address,
      },
    });
  };

  return (
    <Screen>
      <BalanceSummaryWidget />
      <View style={{ paddingVertical: 32 }}>
        <TransferWidget rampEnabled={true} />
      </View>
      <TokenTables
        onPressRow={onPressTokenRow}
        customFilter={(token: Token) => {
          if (token.mint && token.mint === SOL_NATIVE_MINT) {
            return true;
          }
          if (token.address && token.address === ETH_NATIVE_MINT) {
            return true;
          }
          return !token.nativeBalance.isZero();
        }}
      />
    </Screen>
  );
}
