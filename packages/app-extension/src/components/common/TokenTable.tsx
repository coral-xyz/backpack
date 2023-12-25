import { useEffect, useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as WindowedList } from "react-window";
import type { Blockchain } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import type { useBlockchainTokensSorted } from "@coral-xyz/recoil";
import {
  blockchainBalancesSorted,
  useActiveWallet,
  useAllWalletsDisplayed,
  useBlockchainConnectionUrl,
  useLoader,
} from "@coral-xyz/recoil";
import {
  BpInput,
  temporarilyMakeStylesForBrowserExtension,
  useTheme,
  YStack,
} from "@coral-xyz/tamagui";
import SearchIcon from "@mui/icons-material/Search";
import { ListItemButton, Skeleton } from "@mui/material";

import { BalancesTableCell } from "../Unlocked/Balances/Balances";

import { Scrollbar } from "./Layout/Scrollbar";

export type Token = ReturnType<typeof useBlockchainTokensSorted>[number];

const useStyles = temporarilyMakeStylesForBrowserExtension((theme) => ({
  skeleton: {
    background: theme.baseBackgroundL1.val,
  },
}));

export const SearchableTokenTables = SearchableTokenTable;
export function SearchableTokenTable({
  onClickRow,
  tokenAccounts,
  customFilter = () => true,
}: {
  onClickRow: (blockchain: Blockchain, token: Token) => void;
  tokenAccounts?: ReturnType<typeof useBlockchainTokensSorted>;
  customFilter: (token: Token) => boolean;
}) {
  const [searchFilter, setSearchFilter] = useState("");
  const theme = useTheme();
  const { t } = useTranslation();
  const wallet = useActiveWallet();

  return (
    <YStack height="100%" space="$3">
      <YStack paddingHorizontal="$4">
        <BpInput
          placeholder={t("search")}
          value={searchFilter}
          onChangeText={(text) => setSearchFilter(text)}
          iconStart={<SearchIcon style={{ color: theme.baseIcon.val }} />}
        />
      </YStack>
      <WalletTokenTable
        onClickRow={onClickRow}
        searchFilter={searchFilter}
        customFilter={customFilter}
        wallet={wallet}
        tokenAccounts={tokenAccounts}
      />
    </YStack>
  );
}

export function TokenTables({
  onClickRow,
  tokenAccounts,
  searchFilter = "",
  customFilter = () => true,
}: {
  onClickRow: (blockchain: Blockchain, token: Token, publicKey: string) => void;
  publicKey?: string;
  searchFilter?: string;
  tokenAccounts?: ReturnType<typeof useBlockchainTokensSorted>;
  customFilter?: (token: Token) => boolean;
}) {
  const wallets = useAllWalletsDisplayed();
  return (
    <>
      {wallets.map(
        (wallet: {
          blockchain: Blockchain;
          publicKey: string;
          type: string;
          name: string;
        }) => (
          <WalletTokenTable
            key={wallet.publicKey.toString()}
            onClickRow={onClickRow}
            searchFilter={searchFilter}
            customFilter={customFilter}
            wallet={wallet}
            tokenAccounts={tokenAccounts}
          />
        )
      )}
    </>
  );
}

function WalletTokenTable({
  onClickRow,
  tokenAccounts,
  wallet,
  searchFilter = "",
  customFilter = () => true,
}: {
  onClickRow: (blockchain: Blockchain, token: Token, publicKey: string) => void;
  wallet: { name: string; publicKey: string; blockchain: Blockchain };
  tokenAccounts?: ReturnType<typeof useBlockchainTokensSorted>;
  searchFilter?: string;
  customFilter?: (token: Token) => boolean;
}) {
  const blockchain = wallet.blockchain;
  const connectionUrl = useBlockchainConnectionUrl(blockchain);
  const loader = useLoader(
    blockchainBalancesSorted({
      publicKey: wallet.publicKey.toString(),
      blockchain,
    }),
    [],
    [wallet.publicKey, connectionUrl]
  );

  const [_tokenAccounts] = tokenAccounts ? [tokenAccounts, "hasValue"] : loader;

  const [search, setSearch] = useState(searchFilter);

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

  // Note: if this fixed height changes in react-xnft-renderer it'll need to be changed here
  const rowHeight = 68;

  return (
    <YStack flex={1} position="relative" width="100%">
      <YStack height="100%" position="absolute" width="100%">
        <AutoSizer>
          {({ height, width }: { height: number; width: number }) => {
            return (
              <WindowedList
                outerElementType={Scrollbar}
                height={height}
                width={width}
                style={{ overflow: "hidden" }}
                itemCount={tokenAccountsFiltered.length}
                itemSize={rowHeight}
                itemData={{
                  tokenList: tokenAccountsFiltered,
                  blockchain,
                  onClickRow: (token: Token) =>
                    onClickRow(blockchain, token, wallet.publicKey.toString()),
                }}
                overscanCount={12}
              >
                {WindowedTokenRowRenderer}
              </WindowedList>
            );
          }}
        </AutoSizer>
      </YStack>
    </YStack>
  );
}

export const SkeletonRow = () => {
  const classes = useStyles();
  return (
    <ListItemButton
      disableRipple
      style={{
        borderRadius: 16,
        cursor: "auto",
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: "16px",
        paddingRight: "16px",
        padding: 0,
        height: "68px",
      }}
    >
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Skeleton
          variant="circular"
          width={44}
          height={44}
          className={classes.skeleton}
        />
        <div style={{ marginLeft: "5px", width: "50%" }}>
          <Skeleton
            width="50%"
            height={40}
            className={classes.skeleton}
            style={{ marginTop: "-6px" }}
          />
          <Skeleton
            width="80%"
            height={20}
            className={classes.skeleton}
            style={{ marginTop: "-6px" }}
          />
        </div>
      </div>
    </ListItemButton>
  );
};

//
// Token row renderer if virtualization is used for the table.
// Cuts down on rerenders.
//
const WindowedTokenRowRenderer = ({
  index,
  data,
  style,
}: {
  index: number;
  data: any;
  style: any;
}) => {
  const token = data.tokenList[index];
  return (
    <TokenRow
      key={token.mint}
      token={token}
      onClick={() => data.onClickRow(token)}
      style={style}
    />
  );
};

//
// Displays an individual token row in the table
//
function TokenRow({
  onClick,
  token,
  style,
}: {
  onClick: (token: Token) => void;
  token: Token;
  style?: any;
}) {
  let subtitle = token.ticker;
  if (token.displayBalance) {
    subtitle = `${token.displayBalance.toLocaleString()} ${subtitle}`;
  }
  return (
    <YStack
      hoverStyle={{
        cursor: "pointer",
        backgroundColor: "$baseBackgroundL2",
      }}
      paddingHorizontal="$4"
      style={style}
      onPress={() => onClick(token)}
    >
      <BalancesTableCell
        props={{
          icon: token.logo,
          title: token.name,
          subtitle,
          usdValue: token.usdBalance,
          balanceChange: token.recentUsdBalanceChange,
        }}
      />
    </YStack>
  );
}
