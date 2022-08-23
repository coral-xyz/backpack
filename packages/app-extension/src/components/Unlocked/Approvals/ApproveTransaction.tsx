import { useState, useEffect } from "react";
import { ethers, BigNumber } from "ethers";
import * as bs58 from "bs58";
import { AccountLayout, u64, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, Transaction } from "@solana/web3.js";
import { List, ListItem, Typography } from "@mui/material";
import _CheckIcon from "@mui/icons-material/Check";
import { Blockchain, UI_RPC_METHOD_SOLANA_SIMULATE } from "@coral-xyz/common";
import {
  useBackgroundClient,
  useBlockchainTokensSorted,
  useSolanaCtx,
  useSplTokenRegistry,
} from "@coral-xyz/recoil";
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
      <TransactionData wallet={wallet} tx={tx} />
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

function TransactionData({
  tx,
  wallet,
}: {
  tx: string | null;
  wallet: string;
}) {
  const classes = useStyles();
  const background = useBackgroundClient();
  const solanaCtx = useSolanaCtx();
  const [loading, setLoading] = useState(true);
  const [estimatedFee, setEstimatedFee] = useState<number | undefined>(
    undefined
  );
  const [balanceChanges, setBalanceChanges] = useState<any>({});
  const [simulationError, setSimulationError] = useState<boolean>(false);
  const tokenAccountsSorted = useBlockchainTokensSorted(Blockchain.SOLANA);
  const tokenRegistry = useSplTokenRegistry();
  const { connection } = solanaCtx;

  useEffect(() => {
    (async () => {
      if (wallet && tx) {
        const result = await background.request({
          method: UI_RPC_METHOD_SOLANA_SIMULATE,
          params: [tx, wallet, true],
        });
        if (result.value.err) {
          setSimulationError(true);
        } else {
          const balanceChanges = result.value.accounts.reduce(
            (result: any, a: any) => {
              if (a.owner === TOKEN_PROGRAM_ID.toString()) {
                try {
                  const buf = Buffer.from(a.data[0], a.data[1]);
                  const account = AccountLayout.decode(buf);
                  const existingTokenAccount = tokenAccountsSorted.find(
                    (t) =>
                      new PublicKey(t.mint!).toString() ===
                      new PublicKey(account.mint).toString()
                  );
                  const token = tokenRegistry.get(
                    new PublicKey(account.mint).toString()
                  );
                  if (!token) {
                    return result;
                  }
                  const existingNativeBalance = existingTokenAccount
                    ? existingTokenAccount.nativeBalance
                    : Zero;
                  const nativeChange = BigNumber.from(
                    u64.fromBuffer(account.amount).toString()
                  ).sub(existingNativeBalance);
                  result[token.symbol] = {
                    nativeChange,
                    decimals: token.decimals,
                  };
                } catch {
                  // ignore, probably not a token account or some other
                  // failure, we don't want to fail displaying the popup
                }
              }
              return result;
            },
            {}
          );
          setBalanceChanges(balanceChanges);
        }
        setLoading(false);
      }
    })();
  }, [tx]);

  useEffect(() => {
    (async () => {
      if (tx) {
        const transaction = Transaction.from(bs58.decode(tx));
        let fee;
        try {
          fee = await transaction.getEstimatedFee(connection);
        } catch (e) {
          // Asssume 5000 lamports if estimation fails
          fee = 5000;
        }
        setEstimatedFee(fee);
      }
    })();
  }, [tx]);

  const changeDetail = (
    amount: BigNumber,
    ticker: string,
    decimals: number
  ) => {
    const className = amount.gte(Zero) ? classes.positive : classes.negative;
    return (
      <span className={className}>
        {ethers.utils.formatUnits(amount, decimals)} {ticker}
      </span>
    );
  };

  const balanceChangeRows = Object.keys(balanceChanges).map((ticker) => {
    return [
      ticker,
      changeDetail(
        balanceChanges[ticker].nativeChange,
        ticker,
        balanceChanges[ticker].decimals
      ),
    ];
  });

  const menuItems = [
    ...balanceChangeRows,
    ["Network", <>Solana</>],
    [
      "Network Fee",
      <>{estimatedFee && `${ethers.utils.formatUnits(estimatedFee, 9)} SOL`}</>,
    ],
  ];

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Typography className={classes.listDescription}>
        Transaction details
      </Typography>
      <List className={classes.listRoot}>
        {menuItems.map((row) => {
          return (
            <ListItem className={classes.listItemRoot} secondaryAction={row[1]}>
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
