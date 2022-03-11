import {
  makeStyles,
  Typography,
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
} from "@material-ui/core";
import {
  useBlockchains,
  useBlockchainTokens,
  useBlockchainBalance,
  useBlockchainLogo,
} from "../../hooks/useBlockchainBalances";

const useStyles = makeStyles((theme: any) => ({
  logoIcon: {
    width: "44px",
    height: "44px",
  },
  tokenListItem: {
    borderTop: `solid 1pt ${theme.custom.colors.border}`,
    height: "68px",
  },
  blockchainCard: {
    marginTop: "12px",
    marginLeft: "12px",
    marginRight: "12px",
    borderRadius: "12px",
  },
  cardContentRoot: {
    padding: "0 !important",
  },
  blockchainLogo: {
    width: "12px",
    height: "12px",
  },
  cardHeaderRoot: {
    padding: "6px",
    paddingLeft: "16px",
    paddingRight: "16px",
  },
  cardHeaderTitle: {
    fontWeight: 500,
    fontSize: "14px",
  },
  cardListRoot: {
    padding: "0 !important",
  },
  cardHeaderContent: {
    color: theme.custom.colors.fontColor,
  },
  tokenListItemContent: {
    color: theme.custom.colors.fontColor,
    flex: 1,
    display: "flex",
    justifyContent: "space-between",
  },
  tokenName: {
    height: "24px",
    fontWeight: 500,
    fontSize: "16px",
    maxWidth: "200px",
    overflow: "hidden",
    color: theme.custom.colors.fontColor,
  },
  tokenAmount: {
    fontWeight: 500,
    fontSize: "12px",
    color: theme.custom.colors.secondary,
  },
  tokenBalance: {
    fontWeight: 500,
    fontSize: "16px",
    color: theme.custom.colors.fontColor,
  },
  tokenBalanceChange: {
    fontWeight: 500,
    fontSize: "12px",
    color: theme.custom.colors.secondary,
    float: "right",
  },
}));

export function Balances() {
  const blockchains = useBlockchains();
  return (
    <div>
      {blockchains.map((b) => (
        <BlockchainCard key={b} blockchain={b} />
      ))}
      <div style={{ marginTop: "12px" }}>{/* Dummy div for margin. */}</div>
    </div>
  );
}

function BlockchainCard({ blockchain }: { blockchain: string }) {
  const classes = useStyles();
  const tokens = useBlockchainTokens(blockchain);
  const blockchainLogo = useBlockchainLogo(blockchain);
  const blockchainDisplay =
    blockchain.slice(0, 1).toUpperCase() + blockchain.toLowerCase().slice(1);
  return (
    <Card className={classes.blockchainCard} elevation={0}>
      <CardHeader
        avatar={<img className={classes.blockchainLogo} src={blockchainLogo} />}
        title={blockchainDisplay}
        classes={{
          root: classes.cardHeaderRoot,
          content: classes.cardHeaderContent,
          title: classes.cardHeaderTitle,
        }}
      />
      <CardContent classes={{ root: classes.cardContentRoot }}>
        <List classes={{ root: classes.cardListRoot }}>
          {tokens.map((t) => (
            <TokenListItem key={t} blockchain={blockchain} tokenAddress={t} />
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

function TokenListItem({
  blockchain,
  tokenAddress,
}: {
  blockchain: string;
  tokenAddress: string;
}) {
  const classes = useStyles();
  const token = useBlockchainBalance(blockchain, tokenAddress);
  if (token.nativeBalance === 0) {
    return <></>;
  }
  return (
    <ListItem className={classes.tokenListItem}>
      <ListItemIcon>
        <img src={token.logo} className={classes.logoIcon} />
      </ListItemIcon>
      <div className={classes.tokenListItemContent}>
        <div>
          <Typography className={classes.tokenName}>{token.name}</Typography>
          <Typography className={classes.tokenAmount}>
            {token.nativeBalance} {token.ticker}
          </Typography>
        </div>
        <div>
          <Typography className={classes.tokenBalance}>
            ${token.usdBalance}
          </Typography>
          <Typography className={classes.tokenBalanceChange}>
            ${token.recentUsdBalanceChange}
          </Typography>
        </div>
      </div>
    </ListItem>
  );
}
