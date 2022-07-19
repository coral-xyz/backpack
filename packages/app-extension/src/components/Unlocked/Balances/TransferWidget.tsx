import { useState, useEffect } from "react";
import { Typography } from "@mui/material";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
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
  useEphemeralNav,
} from "@coral-xyz/recoil";
import { WithHeaderButton } from "./TokensWidget/Token";
import { Deposit } from "./TokensWidget/Deposit";
import { Send } from "./TokensWidget/Send";
import { useDrawerContext } from "../../Layout/Drawer";
import { useNavStack } from "../../Layout/NavStack";

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
        border: `solid 2pt ${theme.custom.colors.border}`,
      },
      "&:hover fieldset": {
        border: `solid 2pt ${theme.custom.colors.primaryButton}`,
      },
    },
  },
}));

export function TransferWidget() {
  return (
    <div
      style={{
        display: "flex",
        width: "120px",
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: "20px",
        marginBottom: "20px",
      }}
    >
      <ReceiveButton />
      <div style={{ width: "16px" }} />
      <SendButton />
    </div>
  );
}

function SendButton() {
  return (
    <TransferButton
      label={"Send"}
      labelComponent={
        <ArrowUpward
          style={{
            display: "flex",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      }
      routes={[
        {
          name: "select-token",
          component: SendToken,
          title: "Select token",
        },
        {
          name: "send",
          component: (props: any) => <_Send {...props} />,
          title: "",
        },
      ]}
    />
  );
}

function ReceiveButton() {
  return (
    <TransferButton
      label={"Receive"}
      labelComponent={
        <ArrowDownward
          style={{
            display: "flex",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      }
      routes={[
        {
          component: Deposit,
          title: "Deposit",
          name: "deposit",
        },
      ]}
    />
  );
}

function TransferButton({
  label,
  labelComponent,
  routes,
}: {
  label: string;
  labelComponent: any;
  routes: Array<{ props?: any; component: any; title: string; name: string }>;
}) {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        width: "52px",
        height: "70px",
      }}
    >
      <WithHeaderButton
        style={{
          padding: 0,
          width: "42px",
          height: "42px",
          minWidth: "42px",
          borderRadius: "21px",
          boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.15)",
          marginLeft: "auto",
          marginRight: "auto",
          display: "block",
          marginBottom: "8px",
        }}
        label={""}
        labelComponent={labelComponent}
        routes={routes}
      />
      <Typography
        style={{
          color: theme.custom.colors.secondary,
          fontSize: "14px",
          fontWeight: 500,
          lineHeight: "20px",
          textAlign: "center",
        }}
      >
        {label}
      </Typography>
    </div>
  );
}

function SendToken() {
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
      <TokenTable searchFilter={searchFilter} />
    </div>
  );
}

function TokenTable({ searchFilter }: { searchFilter?: string }) {
  const blockchain = "solana";
  const title = "Tokens";

  const blockchainLogo = useBlockchainLogo(blockchain);
  const tokenAccountsSorted = useBlockchainTokensSorted(blockchain);
  const [search, setSearch] = useState(searchFilter ?? "");

  const searchLower = search.toLowerCase();
  const tokenAccountsFiltered = tokenAccountsSorted.filter(
    (t: any) =>
      t.nativeBalance !== 0 &&
      t.name &&
      (t.name.toLowerCase().startsWith(searchLower) ||
        t.ticker.toLowerCase().startsWith(searchLower))
  );

  useEffect(() => {
    setSearch(searchFilter ?? "");
  }, [searchFilter]);

  return (
    <BalancesTable>
      <BalancesTableHead
        props={{ title, iconUrl: blockchainLogo, disableToggle: true }}
      />
      <BalancesTableContent>
        {tokenAccountsFiltered.map((token: any) => (
          <TokenRow key={token.address} token={token} blockchain={blockchain} />
        ))}
      </BalancesTableContent>
    </BalancesTable>
  );
}

function TokenRow({ token, blockchain }: { token: any; blockchain: string }) {
  const { push } = useNavStack();
  return (
    <BalancesTableRow
      onClick={() =>
        push("send", {
          blockchain,
          token,
        })
      }
    >
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

function _Send({ token, blockchain }: { token: any; blockchain: string }) {
  const { title, setTitle } = useNavStack();
  useEffect(() => {
    const prev = title;
    setTitle(`Send ${token.ticker}`);
    return () => {
      setTitle(prev);
    };
  }, []);
  return <Send blockchain={blockchain} tokenAddress={token.address} />;
}
