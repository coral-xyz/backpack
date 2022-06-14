import { useState, useEffect } from "react";
import { useTheme, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import {
  TextField,
  BalancesTable,
  BalancesTableHead,
  BalancesTableContent,
  BalancesTableRow,
  BalancesTableCell,
} from "@200ms/anchor-ui-renderer";
import {
  useBlockchainLogo,
  useBlockchainTokensSorted,
  useEphemeralNav,
} from "@200ms/recoil";
import { WithHeaderButton } from "./TokensWidget/Token";
import { Deposit } from "./TokensWidget/Deposit";
import { Send } from "./TokensWidget/Send";

const useStyles = makeStyles((theme: any) => ({
  searchField: {
    marginTop: "16px",
    marginBottom: "16px",
    "& .MuiOutlinedInput-root": {
      height: "48px !important",
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
      dialog={(setOpenDrawer: (b: boolean) => void) => {
        return <SendToken close={() => setOpenDrawer(false)} />;
      }}
      dialogTitle={"Select token"}
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
      dialog={(setOpenDrawer: (b: boolean) => void) => {
        return <Deposit close={() => setOpenDrawer(false)} />;
      }}
      dialogTitle={"Deposit"}
    />
  );
}

function TransferButton({
  label,
  labelComponent,
  dialog,
  dialogTitle,
}: {
  label: string;
  labelComponent: any;
  dialog: (setOpenDrawer: (b: boolean) => void) => React.ReactNode;
  dialogTitle: string;
}) {
  const theme = useTheme() as any;
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
          marginLeft: "auto",
          marginRight: "auto",
          display: "block",
          marginBottom: "8px",
        }}
        dialogTitle={dialogTitle}
        label={""}
        dialog={dialog}
        labelComponent={labelComponent}
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

function SendToken({ close }: { close: () => void }) {
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
      <TokenTable close={close} searchFilter={searchFilter} />
    </div>
  );
}

function TokenTable({
  close,
  searchFilter,
}: {
  close: () => void;
  searchFilter?: string;
}) {
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
          <TokenRow
            key={token.address}
            close={close}
            token={token}
            blockchain={blockchain}
          />
        ))}
      </BalancesTableContent>
    </BalancesTable>
  );
}

function TokenRow({
  close,
  token,
  blockchain,
}: {
  close: () => void;
  token: any;
  blockchain: string;
}) {
  const { push } = useEphemeralNav();
  return (
    <BalancesTableRow
      onClick={() => {
        push(<_Send blockchain={blockchain} token={token} close={close} />);
      }}
    >
      <BalancesTableCell
        props={{
          icon: token.logo,
          title: token.ticker,
          subtitle: `${token.nativeBalance.toLocaleString()} ${token.ticker}`,
          usdValue: token.usdBalance,
          percentChange: token.recentUsdBalanceChange,
        }}
      />
    </BalancesTableRow>
  );
}

function _Send({
  close,
  token,
  blockchain,
}: {
  close: () => void;
  token: any;
  blockchain: string;
}) {
  const { title, setTitle } = useEphemeralNav();
  useEffect(() => {
    const prev = title;
    setTitle(`Send ${token.ticker}`);
    return () => {
      setTitle(prev);
    };
  }, []);
  return (
    <Send
      blockchain={blockchain}
      tokenAddress={token.address}
      onCancel={close}
    />
  );
}
