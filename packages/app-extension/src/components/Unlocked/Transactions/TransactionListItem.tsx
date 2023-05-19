import type { Blockchain } from "@coral-xyz/common";
import { explorerUrl } from "@coral-xyz/common";
import { isFirstLastListItemStyle } from "@coral-xyz/react-common";
import {
  getBlockchainLogo,
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
} from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import CallMade from "@mui/icons-material/CallMade";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";

import type { ChainId, Transaction } from "../../../graphql/graphql";

import { TransactionListItemIcon } from "./TransactionListItemIcon";

const useStyles = styles((theme) => ({
  txSig: {
    color: theme.custom.colors.fontColor,
    fontSize: "16px",
    fontWeight: 500,
    lineHeight: "24px",
  },
  txDate: {
    color: theme.custom.colors.secondary,
    fontSize: "12px",
    fontWeight: 500,
    lineHeight: "24px",
  },
}));

export function TransactionListItem({
  blockchain,
  isFirst,
  isLast,
  transaction,
}: {
  blockchain: ChainId;
  isFirst: boolean;
  isLast: boolean;
  transaction: Partial<Transaction>;
}) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const explorer = useBlockchainExplorer(
    blockchain.toLowerCase() as Blockchain
  );
  const connectionUrl = useBlockchainConnectionUrl(
    blockchain.toLowerCase() as Blockchain
  );
  const blockchainLogo = getBlockchainLogo(
    blockchain.toLowerCase() as Blockchain
  );

  const handleClick = () => {
    window.open(explorerUrl(explorer, transaction.hash!, connectionUrl));
  };

  return (
    <ListItem
      button
      disableRipple
      onClick={handleClick}
      style={{
        backgroundColor: theme.custom.colors.nav,
        display: "flex",
        height: "68px",
        paddingLeft: "12px",
        paddingRight: "12px",
        paddingTop: "10px",
        paddingBottom: "10px",
        borderBottom: isLast
          ? undefined
          : `solid 1pt ${theme.custom.colors.border}`,
        ...isFirstLastListItemStyle(isFirst, isLast, 12),
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flex: 1 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <TransactionListItemIcon transaction={transaction} />
          </div>
          <div>
            <Typography className={classes.txSig}>
              <img
                style={{
                  borderRadius: "2px",
                  marginRight: "10px",
                  width: "12px",
                }}
                src={blockchainLogo}
              />
              {transaction.hash?.slice(0, 4)}...
              {transaction.hash?.slice(transaction.hash!.length - 5)}
            </Typography>
            <Typography className={classes.txDate}>
              {new Date(transaction.timestamp!).toLocaleString()}
            </Typography>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <CallMade style={{ color: theme.custom.colors.icon }} />
        </div>
      </div>
    </ListItem>
  );
}
