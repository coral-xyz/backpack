import { useState, useEffect } from "react";
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
  customFilter = () => true,
}: {
  onClickRow: (blockchain: Blockchain, token: Token) => void;
  customFilter: (token: Token) => boolean;
}) {
  const classes = useStyles();
  const [searchFilter, setSearchFilter] = useState("");
  return (
    <div>
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
        searchFilter={searchFilter}
        customFilter={customFilter}
      />
    </div>
  );
}

export function TokenTable({
  onClickRow,
  searchFilter = "",
  customFilter = () => true,
}: {
  onClickRow: (blockchain: Blockchain, token: Token) => void;
  searchFilter: string;
  customFilter: (token: Token) => boolean;
}) {
  const blockchain = Blockchain.SOLANA;
  const title = "Tokens";

  const blockchainLogo = useBlockchainLogo(blockchain);
  const tokenAccountsSorted = useBlockchainTokensSorted(blockchain);
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

  return (
    <BalancesTable>
      <BalancesTableHead
        props={{ title, iconUrl: blockchainLogo, disableToggle: true }}
      />
      <BalancesTableContent>
        {tokenAccountsFiltered.map((token) => (
          <TokenRow
            key={token.address}
            token={token}
            onClick={() => onClickRow(blockchain, token)}
          />
        ))}
      </BalancesTableContent>
    </BalancesTable>
  );
}

function TokenRow({
  onClick,
  token,
}: {
  onClick: (blockchain: Blockchain, token: Token) => void;
  token: Token;
}) {
  return (
    <BalancesTableRow onClick={onClick}>
      <BalancesTableCell
        props={{
          icon: token.logo,
          title: token.name,
          subtitle: `${token.nativeBalance.toLocaleString()} ${token.ticker}`,
          usdValue: token.usdBalance,
          percentChange: token.recentUsdBalanceChange,
        }}
      />
    </BalancesTableRow>
  );
}
