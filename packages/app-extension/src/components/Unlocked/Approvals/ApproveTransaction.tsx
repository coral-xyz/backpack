import { ethers, BigNumber } from "ethers";
import { List, ListItem, Typography } from "@mui/material";
import _CheckIcon from "@mui/icons-material/Check";
import { useTransactionData } from "@coral-xyz/recoil";
import { Blockchain } from "@coral-xyz/common";
import { styles } from "@coral-xyz/themes";
import { Loading } from "../../common";
import { WithApproval } from ".";

const { Zero } = ethers.constants;

const useStyles = styles((theme) => ({
  title: {
    fontWeight: 500,
    fontSize: "18px",
    lineHeight: "24px",
    color: theme.custom.colors.fontColor,
    marginBottom: "48px",
    marginTop: "16px",
    textAlign: "center",
  },
  listDescription: {
    color: theme.custom.colors.secondary,
    fontSize: "14px",
    marginBottom: "8px",
  },
  listRoot: {
    color: theme.custom.colors.fontColor,
    padding: "0",
    borderRadius: "4px",
    fontSize: "14px",
  },
  listItemRoot: {
    alignItems: "start",
    borderBottom: `1px solid #000`,
    borderRadius: "4px",
    background: theme.custom.colors.nav,
    padding: "8px",
  },
  listItemIconRoot: {
    minWidth: "inherit",
    height: "20px",
    width: "20px",
    marginRight: "8px",
  },
  warning: {
    color: theme.custom.colors.negative,
    fontSize: "14px",
    textAlign: "center",
    marginTop: "8px",
  },
  link: {
    cursor: "pointer",
    color: theme.custom.colors.secondary,
    textDecoration: "underline",
  },
  negative: {
    color: theme.custom.colors.negative,
  },
  positive: {
    color: theme.custom.colors.positive,
  },
}));

export function ApproveTransaction({
  origin,
  title,
  tx,
  wallet,
  onCompletion,
}: {
  origin: string;
  title: string;
  tx: string | null;
  wallet: string;
  onCompletion: (confirmed: boolean) => void;
}) {
  const classes = useStyles();

  const onConfirm = async () => {
    onCompletion(true);
  };

  const onDeny = async () => {
    onCompletion(false);
  };

  return (
    <WithApproval
      origin={origin}
      originTitle={title}
      wallet={wallet}
      title={<div className={classes.title}>Approve Transaction</div>}
      onConfirm={onConfirm}
      onConfirmLabel="Approve"
      onDeny={onDeny}
    >
      <TransactionData tx={tx} />
    </WithApproval>
  );
}

export function ApproveAllTransactions({
  origin,
  title,
  txs,
  wallet,
  onCompletion,
}: {
  origin: string;
  title: string;
  txs: string;
  wallet: string;
  onCompletion: (confirmed: boolean) => void;
}) {
  const classes = useStyles();

  const onConfirm = async () => {
    onCompletion(true);
  };

  const onDeny = async () => {
    onCompletion(false);
  };

  return (
    <WithApproval
      origin={origin}
      originTitle={title}
      title={<div className={classes.title}>Approve Transactions</div>}
      wallet={wallet}
      onConfirm={onConfirm}
      onConfirmLabel="Approve"
      onDeny={onDeny}
    >
      <div className={classes.warning}>Confirming multiple transactions</div>
    </WithApproval>
  );
}

function TransactionData({ tx }: { tx: string | null }) {
  const classes = useStyles();

  const { loading, simulationError, balanceChanges, network, networkFee } =
    useTransactionData(Blockchain.SOLANA, tx);

  if (loading) {
    return <Loading />;
  }

  const balanceChangeRows = balanceChanges
    ? Object.entries(balanceChanges).map(
        ([symbol, { nativeChange, decimals }]) => {
          const className = nativeChange.gte(Zero)
            ? classes.positive
            : classes.negative;
          return [
            symbol,
            <span className={className}>
              {ethers.utils.commify(
                ethers.utils.formatUnits(nativeChange, BigNumber.from(decimals))
              )}{" "}
              {symbol}
            </span>,
          ];
        }
      )
    : [];

  const menuItems = [
    ...balanceChangeRows,
    ["Network", network],
    ["Network Fee", networkFee],
  ];

  return (
    <>
      <Typography className={classes.listDescription}>
        Transaction details
      </Typography>
      <List className={classes.listRoot}>
        {menuItems.map((row, index) => {
          return (
            <ListItem
              key={index}
              className={classes.listItemRoot}
              secondaryAction={row[1]}
            >
              {row[0]}
            </ListItem>
          );
        })}
      </List>
      {simulationError && (
        <div className={classes.warning}>
          This transaction is unlikely to succeed.
        </div>
      )}
    </>
  );
}
