import { explorerUrl } from "@coral-xyz/common";
import { isFirstLastListItemStyle } from "@coral-xyz/react-common";
import {
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
  useBlockchainLogo,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { CallMade } from "@mui/icons-material";
import Check from "@mui/icons-material/Check";
import { ListItem, Typography } from "@mui/material";

import { useStyles } from "../../Messages/SearchBox";

export function RecentSolanaActivityListItem({
  transaction,
  isFirst,
  isLast,
}: any) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const explorer = useBlockchainExplorer(transaction.blockchain);
  const connectionUrl = useBlockchainConnectionUrl(transaction.blockchain);
  const blockchainLogo = useBlockchainLogo(transaction.blockchain);
  const onClick = () => {
    window.open(explorerUrl(explorer!, transaction.signature, connectionUrl!));
  };

  console.log(transaction, "!!!!");
  return (
    <ListItem
      button
      disableRipple
      onClick={onClick}
      style={{
        paddingLeft: "12px",
        paddingRight: "12px",
        paddingTop: "10px",
        paddingBottom: "10px",
        display: "flex",
        height: "68px",
        backgroundColor: theme.custom.colors.nav,
        borderBottom: isLast
          ? undefined
          : `solid 1pt ${theme.custom.colors.border}`,
        ...isFirstLastListItemStyle(isFirst, isLast, 12),
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{ flex: 1, display: "flex" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Check className={classes.recentActivityListItemIcon} />
          </div>
          <div>
            <Typography className={classes.txSig}>
              <img
                style={{
                  width: "12px",
                  borderRadius: "2px",
                  marginRight: "10px",
                }}
                src={blockchainLogo}
              />
              {transaction.signature.slice(0, 4)}...
              {transaction.signature.slice(transaction.signature.length - 5)}
            </Typography>
            <Typography className={classes.txDate}>
              {transaction.timestamp}
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
