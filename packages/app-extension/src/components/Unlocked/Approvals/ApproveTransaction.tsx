import { useState, useEffect } from "react";
import { ethers, BigNumber } from "ethers";
import * as bs58 from "bs58";
import { AccountLayout, u64, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, Transaction } from "@solana/web3.js";
import { Typography } from "@mui/material";
import _CheckIcon from "@mui/icons-material/Check";
import { Blockchain, UI_RPC_METHOD_SIMULATE } from "@coral-xyz/common";
import {
  useActiveWallet,
  useBackgroundClient,
  useBlockchainTokensSorted,
  useSolanaCtx,
  useSplTokenRegistry,
} from "@coral-xyz/recoil";
import { styles } from "@coral-xyz/themes";
import { WithApproval } from ".";
import { SettingsList } from "../../common/Settings/List";

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
  warning: {
    color: theme.custom.colors.negative,
    fontSize: "14px",
    marginTop: "24px",
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
  onCompletion,
}: {
  origin: string;
  title: string;
  tx: string | null;
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
  onCompletion,
}: {
  origin: string;
  title: string;
  txs: string;
  onCompletion: (confirmed: boolean) => void;
}) {
  const classes = useStyles();

  const txArray = JSON.parse(txs);

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
      onConfirm={onConfirm}
      onConfirmLabel="Approve"
      onDeny={onDeny}
    >
      <>Hi</>
    </WithApproval>
  );
}

function TransactionData({ tx }: { tx: string | null }) {
  const classes = useStyles();
  const background = useBackgroundClient();
  const solanaCtx = useSolanaCtx();
  const [loading, setLoading] = useState(true);
  const [estimatedFee, setEstimatedFee] = useState<number | undefined>(
    undefined
  );
  const [balanceChanges, setBalanceChanges] = useState<any>({});
  const [simulationError, setSimulationError] = useState<boolean>(false);
  const wallet = useActiveWallet();
  const tokenAccountsSorted = useBlockchainTokensSorted(Blockchain.SOLANA);
  const tokenRegistry = useSplTokenRegistry();
  const { connection } = solanaCtx;

  useEffect(() => {
    (async () => {
      if (wallet && tx) {
        const result = await background.request({
          method: UI_RPC_METHOD_SIMULATE,
          params: [tx, wallet.publicKey.toString(), true],
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
                      new PublicKey(t.mint).toString() ===
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
                  // ignore, probably not a token account
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
    console.log(amount);
    const className = amount.gte(Zero) ? classes.positive : classes.negative;
    return (
      <span className={className}>
        {ethers.utils.formatUnits(amount, decimals)} {ticker}
      </span>
    );
  };

  const balanceChangeMenuItems = {
    ...Object.fromEntries(
      Object.keys(balanceChanges).map((ticker) => {
        return [
          ticker,
          {
            onClick: () => {},
            detail: changeDetail(
              balanceChanges[ticker].nativeChange,
              ticker,
              balanceChanges[ticker].decimals
            ),
            button: false,
          },
        ];
      })
    ),
  };

  const menuItems = {
    ...balanceChangeMenuItems,
    Network: {
      onClick: () => {},
      detail: <>Solana</>,
      button: false,
    },
    "Network Fee": {
      onClick: () => {},
      detail: (
        <>
          {estimatedFee && `${ethers.utils.formatUnits(estimatedFee, 9)} SOL`}
        </>
      ),
      button: false,
    },
  };

  return (
    <>
      <Typography className={classes.listDescription}>
        Transaction details
      </Typography>
      <SettingsList menuItems={menuItems} style={{ margin: 0 }} />
      {simulationError && (
        <div className={classes.warning}>
          This transaction is unlikely to succeed.
        </div>
      )}
    </>
  );
}
