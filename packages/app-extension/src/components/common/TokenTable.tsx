import { useState, useEffect } from "react";
import { FixedSizeList as WindowedList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { Button as MuiButton, Skeleton } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { styles } from "@coral-xyz/themes";
import {
  Blockchain,
  toTitleCase,
  walletAddressDisplay,
} from "@coral-xyz/common";
import {
  blockchainBalancesSorted,
  useActiveWallets,
  useBlockchainConnectionUrl,
  useBlockchainLogo,
  useBlockchainTokensSorted,
  useEnabledBlockchains,
  useLoader,
} from "@coral-xyz/recoil";
import { TextField } from "../../plugin/Component";
import { WithCopyTooltip } from "./WithCopyTooltip";
import {
  BalancesTable,
  BalancesTableCell,
  BalancesTableContent,
  BalancesTableHead,
  BalancesTableRow,
} from "../Unlocked/Balances";
import { TextInput } from "./Inputs";

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
      "& input": {
        paddingTop: 0,
        paddingBottom: 0,
      },
    },
  },
  addressButton: {
    padding: 0,
    color: theme.custom.colors.secondary,
    textTransform: "none",
    fontWeight: 500,
    lineHeight: "24px",
    fontSize: "14px",
    marginLeft: "8px",
    "&:hover": {
      backgroundColor: "transparent",
      "& svg": {
        visibility: "visible",
      },
    },
  },
  skeleton: {
    background: "rgba(0,0,0,0.15)",
  },
  copyIcon: {
    visibility: "hidden",
    width: "16px",
    marginLeft: "6px",
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
        placeholder={"Search"}
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
  blockchain,
  onClickRow,
  tokenAccounts,
  customFilter = () => true,
  displayWalletHeader = true,
}: {
  blockchain: Blockchain;
  onClickRow: (blockchain: Blockchain, token: Token) => void;
  tokenAccounts?: ReturnType<typeof useBlockchainTokensSorted>;
  customFilter: (token: Token) => boolean;
  displayWalletHeader?: boolean;
}) {
  const classes = useStyles();
  const [searchFilter, setSearchFilter] = useState("");
  return (
    <>
      <TextInput
        className={classes.searchField}
        placeholder={"Search"}
        value={searchFilter}
        setValue={(e) => setSearchFilter(e.target.value)}
        inputProps={{
          style: {
            height: "48px",
          },
        }}
      />
      <TokenTable
        blockchain={blockchain}
        onClickRow={onClickRow}
        tokenAccounts={tokenAccounts}
        searchFilter={searchFilter}
        customFilter={customFilter}
        displayWalletHeader={displayWalletHeader}
      />
    </>
  );
}

export function TokenTables({
  blockchains,
  onClickRow,
  searchFilter = "",
  customFilter = () => true,
}: {
  blockchains?: Array<Blockchain>;
  onClickRow: (blockchain: Blockchain, token: Token) => void;
  searchFilter?: string;
  customFilter?: (token: Token) => boolean;
}) {
  const enabledBlockchains = useEnabledBlockchains();
  const filteredBlockchains =
    blockchains?.filter((b) => enabledBlockchains.includes(b)) ||
    enabledBlockchains;

  return (
    <>
      {filteredBlockchains.map((blockchain: Blockchain) => (
        <TokenTable
          key={blockchain}
          blockchain={blockchain}
          onClickRow={onClickRow}
          searchFilter={searchFilter}
          customFilter={customFilter}
        />
      ))}
    </>
  );
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
  const classes = useStyles();
  const title = toTitleCase(blockchain);
  const blockchainLogo = useBlockchainLogo(blockchain);
  const connectionUrl = useBlockchainConnectionUrl(blockchain);
  const activeWallets = useActiveWallets();
  const wallet = activeWallets.filter((w) => w.blockchain === blockchain)[0];

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

  return (
    <BalancesTable style={tableStyle}>
      <BalancesTableHead
        props={{
          title,
          iconUrl: blockchainLogo,
          disableToggle: false,
          subtitle: displayWalletHeader && (
            <WithCopyTooltip tooltipOpen={tooltipOpen}>
              <MuiButton
                disableRipple
                className={classes.addressButton}
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy();
                }}
              >
                {walletAddressDisplay(wallet?.publicKey)}
                <ContentCopyIcon className={classes.copyIcon} />
              </MuiButton>
            </WithCopyTooltip>
          ),
        }}
      />
      <BalancesTableContent style={useVirtualization ? { height: "100%" } : {}}>
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
                    onClickRow: (token: Token) => onClickRow(blockchain, token),
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
                onClick={(token) => onClickRow(blockchain, token)}
              />
            ))}
          </>
        )}
      </BalancesTableContent>
    </BalancesTable>
  );
}

const SkeletonRows = () => {
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
          width={40}
          height={40}
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
export function TokenRow({
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
