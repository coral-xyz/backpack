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
  return (
    <ListItem className={classes.tokenListItem}>
      <ListItemIcon>
        <img src={token.logo} className={classes.logoIcon} />
      </ListItemIcon>
      <div className={classes.tokenListItemContent}>
        <div>
          <Typography>{token.name}</Typography>
          <Typography>{token.nativeBalance}</Typography>
        </div>
        <div>
          <Typography>{token.usdBalance}</Typography>
          <Typography>{token.recentUsdBalanceChange}</Typography>
        </div>
      </div>
    </ListItem>
  );
}
