import { useState, useEffect } from "react";
import { FixedSizeList as WindowedList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { styles } from "@coral-xyz/themes";
import { Blockchain } from "@coral-xyz/common";
import {
  TextField,
  BalancesTable,
  BalancesTableHead,
  BalancesTableContent,
  BalancesTableRow,
  BalancesTableCell,
} from "@coral-xyz/react-xnft-renderer";
import {
  useBlockchainLogo,
  useBlockchainTokensSorted,
} from "@coral-xyz/recoil";

export type Token = ReturnType<typeof useBlockchainTokensSorted>[number];

const useStyles = styles((theme) => ({
  searchField: {
    marginLeft: "12px",
    marginRight: "12px",
    marginTop: "16px",
    marginBottom: "16px",
    width: "inherit",
    display: "flex",
    "& .MuiOutlinedInput-root": {
      height: "48px !important",
      "& fieldset": {
        border: `solid 1pt ${theme.custom.colors.border}`,
      },
      "&:hover fieldset": {
        border: `solid 2pt ${theme.custom.colors.primaryButton}`,
      },
    },
  },
}));

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
      <TextField
        placeholder={"Search"}
        value={searchFilter}
        setValue={setSearchFilter}
        rootClass={classes.searchField}
        inputProps={{
          style: {
            height: "48px",
          },
        }}
      />
      <TokenTable
        onClickRow={onClickRow}
        tokenAccounts={tokenAccounts}
        searchFilter={searchFilter}
        customFilter={customFilter}
      />
    </>
  );
}

export function TokenTable({
  onClickRow,
  tokenAccounts,
  searchFilter = "",
  customFilter = () => true,
}: {
  onClickRow: (blockchain: Blockchain, token: Token) => void;
  tokenAccounts?: ReturnType<typeof useBlockchainTokensSorted>;
  searchFilter: string;
  customFilter: (token: Token) => boolean;
}) {
  const blockchain = Blockchain.SOLANA;
  const title = "Tokens";
  const blockchainLogo = useBlockchainLogo(blockchain);
  const tokenAccountsSorted = tokenAccounts
    ? tokenAccounts
    : useBlockchainTokensSorted(blockchain);
  const [search, setSearch] = useState(searchFilter);
  const searchLower = search.toLowerCase();
  const tokenAccountsFiltered = tokenAccountsSorted
    .filter(
      (t) =>
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

  return (
    <BalancesTable
      style={useVirtualization ? { height: "calc(100% - 92px)" } : {}}
    >
      <BalancesTableHead
        props={{ title, iconUrl: blockchainLogo, disableToggle: true }}
      />
      <BalancesTableContent style={useVirtualization ? { height: "100%" } : {}}>
        {useVirtualization ? (
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
                    onClickRow: (token: Token) => onClickRow(blockchain, token),
                  }}
                  overscanCount={24}
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
                key={token.mint}
                token={token}
                onClick={(token) => onClickRow(blockchain, token)}
              />
            ))}
          </>
        )}
      </BalancesTableContent>
    </BalancesTable>
  );
}

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
          percentChange: token.recentUsdBalanceChange,
        }}
      />
    </BalancesTableRow>
  );
}
