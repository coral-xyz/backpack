import { useEffect, useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as WindowedList } from "react-window";
import type { Blockchain } from "@coral-xyz/common";
import { TextInput } from "@coral-xyz/react-common";
import type { useBlockchainTokensSorted } from "@coral-xyz/recoil";
import {
  blockchainBalancesSorted,
  useAllWalletsDisplayed,
  useBlockchainConnectionUrl,
  useLoader,
} from "@coral-xyz/recoil";
import { styles } from "@coral-xyz/themes";
import { Skeleton } from "@mui/material";

import {
  BalancesTable,
  BalancesTableCell,
  BalancesTableContent,
  BalancesTableHead,
  BalancesTableRow,
} from "../Unlocked/Balances";

export type Token = ReturnType<typeof useBlockchainTokensSorted>[number];

const useStyles = styles(() => ({
  searchField: {
    marginLeft: "12px",
    marginRight: "12px",
    marginTop: "16px",
    marginBottom: "16px",
    width: "inherit",
    display: "flex",
    "& .MuiOutlinedInput-root": {
      "& input": {
        paddingTop: 0,
        paddingBottom: 0,
      },
    },
  },
  skeleton: {
    background: "rgba(0,0,0,0.15)",
  },
}));

export function SearchableTokenTables({
  onClickRow,
  customFilter = () => true,
}: {
  onClickRow: (blockchain: Blockchain, token: Token) => void;
  customFilter: (token: Token) => boolean;
}) {
  const classes = useStyles();
  const [searchFilter, setSearchFilter] = useState("");
  return (
    <>
      <TextInput
        className={classes.searchField}
        placeholder="Search"
        value={searchFilter}
        setValue={(e) => setSearchFilter(e.target.value)}
        inputProps={{
          style: {
            height: "48px",
          },
        }}
      />
      <TokenTables
        searchFilter={searchFilter}
        onClickRow={onClickRow}
        customFilter={customFilter}
      />
    </>
  );
}

export function SearchableTokenTable({
  onClickRow,
  tokenAccounts,
  customFilter = () => true,
}: {
  onClickRow: (blockchain: Blockchain, token: Token) => void;
  tokenAccounts?: ReturnType<typeof useBlockchainTokensSorted>;
  customFilter: (token: Token) => boolean;
}) {
  const classes = useStyles();
  const [searchFilter, setSearchFilter] = useState("");
  return (
    <>
      <TextInput
        className={classes.searchField}
        placeholder="Search"
        value={searchFilter}
        setValue={(e) => setSearchFilter(e.target.value)}
        inputProps={{
          style: {
            height: "48px",
          },
        }}
      />
      <TokenTables
        onClickRow={onClickRow}
        tokenAccounts={tokenAccounts}
        searchFilter={searchFilter}
        customFilter={customFilter}
      />
    </>
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

  const [_tokenAccounts, , isLoading] = tokenAccounts
    ? [tokenAccounts, "hasValue"]
    : loader;

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

  return (
    <BalancesTable style={tableStyle}>
      <BalancesTableContent
        style={
          useVirtualization ? { height: `calc(100% - ${headerHeight}px)` } : {}
        }
      >
        {isLoading ? (
          <SkeletonRows />
        ) : useVirtualization ? (
          <AutoSizer>
            {({ height, width }: { height: number; width: number }) => {
              return (
                <WindowedList
                  height={height}
                  width={width}
                  itemCount={tokenAccountsFiltered.length}
                  itemSize={rowHeight}
                  itemData={{
                    tokenList: tokenAccountsFiltered,
                    blockchain,
                    onClickRow: (token: Token) =>
                      onClickRow(
                        blockchain,
                        token,
                        wallet.publicKey.toString()
                      ),
                  }}
                  overscanCount={12}
                >
                  {WindowedTokenRowRenderer}
                </WindowedList>
              );
            }}
          </AutoSizer>
        ) : (
          <>
            {tokenAccountsFiltered.map((token: any) => (
              <TokenRow
                key={token.address}
                token={token}
                onClick={(token) =>
                  onClickRow(blockchain, token, wallet.publicKey.toString())
                }
              />
            ))}
          </>
        )}
      </BalancesTableContent>
    </BalancesTable>
  );
}

export const SkeletonRows = () => {
  const classes = useStyles();
  return (
    <BalancesTableRow>
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
    </BalancesTableRow>
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
    <BalancesTableRow onClick={() => onClick(token)} style={style}>
      <BalancesTableCell
        props={{
          icon: token.logo,
          title: token.name,
          subtitle,
          usdValue: token.usdBalance,
          balanceChange: token.recentUsdBalanceChange,
        }}
      />
    </BalancesTableRow>
  );
}
