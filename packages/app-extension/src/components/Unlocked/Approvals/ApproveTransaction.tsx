import type { Blockchain, FeeConfig } from "@coral-xyz/common";
import { Loading } from "@coral-xyz/react-common";
import { useTransactionData, useWalletBlockchain } from "@coral-xyz/recoil";
import { styles } from "@coral-xyz/themes";
import _CheckIcon from "@mui/icons-material/Check";
import { Typography } from "@mui/material";
import { BigNumber, ethers } from "ethers";

import { TransactionData } from "../../common/TransactionData";
import { WithApproval } from "../../Unlocked/Approvals";

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
    border: `${theme.custom.colors.borderFull}`,
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
  txMenuItemRoot: {
    height: "36px !important",
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
  onCompletion: (transaction: any, feeConfig?: FeeConfig) => Promise<void>;
}) {
  const classes = useStyles();
  const blockchain = useWalletBlockchain(wallet);
  const transactionData = useTransactionData(blockchain as Blockchain, tx);
  const { loading, balanceChanges, transaction, solanaFeeConfig } =
    transactionData;

  if (loading) {
    return <Loading />;
  }

  const menuItems = balanceChanges
    ? Object.fromEntries(
        Object.entries(balanceChanges).map(
          ([symbol, { nativeChange, decimals }]) => {
            const className = nativeChange.gte(Zero)
              ? classes.positive
              : classes.negative;
            return [
              symbol,
              {
                onClick: () => {},
                detail: (
                  <Typography className={className}>
                    {ethers.utils.commify(
                      ethers.utils.formatUnits(
                        nativeChange,
                        BigNumber.from(decimals)
                      )
                    )}{" "}
                    {symbol}
                  </Typography>
                ),
                button: false,
              },
            ];
          }
        )
      )
    : {};

  const onConfirm = async () => {
    await onCompletion(transaction, solanaFeeConfig);
  };

  const onDeny = async () => {
    await onCompletion(false);
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
      blockchain={blockchain as Blockchain}
    >
      {loading ? (
        <Loading />
      ) : (
        <div
          style={{ marginTop: "24px", marginLeft: "8px", marginRight: "8px" }}
        >
          <Typography className={classes.listDescription}>
            Transaction details
          </Typography>
          <TransactionData
            transactionData={transactionData}
            menuItems={menuItems}
            menuItemClasses={{ root: classes.txMenuItemRoot }}
          />
        </div>
      )}
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
