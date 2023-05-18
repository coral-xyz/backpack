import { useEffect, useState } from "react";
import type { Blockchain, FeeConfig } from "@coral-xyz/common";
import { EmptyState, Loading } from "@coral-xyz/react-common";
import {
  isKeyCold,
  type TransactionData as TransactionDataType,
  useMultipleTransactionsData,
  useTransactionData,
  useWalletBlockchain,
} from "@coral-xyz/recoil";
import { styles as makeStyles } from "@coral-xyz/themes";
import { Block as BlockIcon } from "@mui/icons-material";
import { type ClassNameMap, Typography } from "@mui/material";
import { BigNumber, ethers } from "ethers";
import { useRecoilValue } from "recoil";

import { TransactionData } from "../../common/TransactionData";
import { WithApproval } from "../../Unlocked/Approvals";

const { Zero } = ethers.constants;

const useStyles = makeStyles((theme) => ({
  title: {
    fontWeight: 500,
    fontSize: "18px",
    lineHeight: "24px",
    color: theme.custom.colors.fontColor,
    marginBottom: "48px",
    marginTop: "16px",
    textAlign: "center",
  },
  advancedDetailsLabel: {
    textAlign: "center",
    color: theme.custom.colors.secondary,
    fontSize: "12px",
    marginTop: "6px",
    marginBottom: "8px",
    cursor: "pointer",
  },
  listDescription: {
    color: theme.custom.colors.secondary,
    fontSize: "14px",
    marginBottom: "8px",
  },
  // warning: {
  //   color: theme.custom.colors.negative,
  //   fontSize: "14px",
  //   textAlign: "center",
  //   marginTop: "8px",
  // },
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
  onCompletion: (
    transaction: any,
    feeConfig?: { config: FeeConfig; disabled: boolean }
  ) => Promise<void>;
}) {
  const classes = useStyles();
  const blockchain = useWalletBlockchain(wallet);
  const transactionData = useTransactionData(blockchain as Blockchain, tx);
  const { loading, transaction, solanaFeeConfig } = transactionData;
  const _isKeyCold = useRecoilValue(isKeyCold(wallet));

  if (loading) {
    return <Loading />;
  }

  if (_isKeyCold) {
    return <Cold origin={origin!} />;
  }

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
    >
      {loading ? (
        <Loading />
      ) : (
        <div
          style={{
            marginTop: "24px",
            marginLeft: "8px",
            marginRight: "8px",
          }}
        >
          <Typography className={classes.listDescription}>
            Transaction details
          </Typography>
          <TransactionData
            transactionData={transactionData}
            menuItems={createTransactionDataMenuItems(transactionData, classes)}
            menuItemClasses={{ root: classes.txMenuItemRoot }}
          />
        </div>
      )}
    </WithApproval>
  );
}

export function Cold({
  origin,
  style,
}: {
  origin: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <EmptyState
          icon={(props: any) => <BlockIcon {...props} />}
          title="Request Rejected"
          subtitle={`WARNING: ${origin} is trying to sign with your cold wallet. This may be dangerous. To enable, see your wallet settings and enable "App Signing". Do so with caution!`}
          buttonText=""
          onClick={() => {}}
          style={style}
        />
      </div>
    </div>
  );
}

export function ApproveAllTransactions({
  origin,
  title,
  wallet,
  txs,
  onCompletion,
}: {
  origin: string;
  title: string;
  wallet: string;
  txs: Array<string>;
  onCompletion: (confirmed: boolean) => void;
}) {
  const classes = useStyles();
  const blockchain = useWalletBlockchain(wallet);
  const transactionsData = useMultipleTransactionsData(
    blockchain as Blockchain,
    txs
  );
  const _isKeyCold = useRecoilValue(isKeyCold(wallet));
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [consolidated, setConsolidated] = useState<TransactionDataType | null>(
    null
  );

  useEffect(() => {
    if (transactionsData.some((t) => t.loading)) {
      return;
    }

    const allBalanceChanges: TransactionDataType["balanceChanges"] = {};
    let allNetworkFees = "0";

    for (const tx of transactionsData) {
      if (tx.balanceChanges) {
        Object.entries(tx.balanceChanges).forEach(([key, val]) => {
          allBalanceChanges[key] = {
            nativeChange: (
              allBalanceChanges[key]?.nativeChange ?? BigNumber.from("0")
            ).add(val.nativeChange),
            decimals: val.decimals,
          };
        });
      }

      allNetworkFees = (
        parseFloat(allNetworkFees) + parseFloat(tx.networkFee)
      ).toPrecision(2);
    }

    setConsolidated({
      ...transactionsData[0],
      balanceChanges: allBalanceChanges,
      networkFee: allNetworkFees,
    });
    setLoading(false);
  }, [transactionsData]);

  const onConfirm = async () => {
    onCompletion(true);
  };

  const onDeny = async () => {
    onCompletion(false);
  };

  const onToggleAdvanced = () => {
    setShowAll((val) => !val);
  };

  if (_isKeyCold) {
    return <Cold origin={origin!} />;
  }

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
      {loading || !consolidated ? (
        <Loading />
      ) : (
        <div
          style={{
            marginTop: "24px",
            ...(showAll ? { height: "250px", overflowY: "scroll" } : {}),
          }}
        >
          <div
            key={0}
            style={{
              marginLeft: "8px",
              marginRight: "8px",
            }}
          >
            <Typography className={classes.listDescription}>
              Transaction Aggregate Details ({transactionsData.length})
            </Typography>
            <TransactionData
              transactionData={consolidated}
              menuItems={createTransactionDataMenuItems(consolidated, classes)}
              menuItemClasses={{ root: classes.txMenuItemRoot }}
            />
          </div>
          {showAll
            ? transactionsData.map((tx, i) => (
              <div
                key={i + 1}
                style={{
                    marginTop: "10px",
                    marginLeft: "8px",
                    marginRight: "8px",
                  }}
                >
                <Typography className={classes.listDescription}>
                  [{i + 1}] Transaction details
                </Typography>
                <TransactionData
                  transactionData={tx}
                  menuItems={createTransactionDataMenuItems(tx, classes)}
                  menuItemClasses={{ root: classes.txMenuItemRoot }}
                  />
              </div>
              ))
            : null}
        </div>
      )}
      <Typography
        className={classes.advancedDetailsLabel}
        onClick={onToggleAdvanced}
      >
        {showAll ? "Hide Advanced Details" : "View Advanced Details"}
      </Typography>
    </WithApproval>
  );
}

function createTransactionDataMenuItems(
  tx: TransactionDataType,
  classes: ClassNameMap<string>
): any {
  return tx.balanceChanges
    ? Object.fromEntries(
        Object.entries(tx.balanceChanges).map(
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
}
