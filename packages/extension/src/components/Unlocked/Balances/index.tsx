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
import { ArrowForwardIos } from "@material-ui/icons";
import {
  useBlockchains,
  useBlockchainLogo,
  useTotal,
  useBlockchainTokensSorted,
  useNavigation,
} from "@200ms/recoil";
import {
  NAV_COMPONENT_BALANCES_NETWORK,
  NAV_COMPONENT_TOKEN,
} from "@200ms/common";
import { PluginGrid } from "./Plugin";

const useStyles = makeStyles((theme: any) => ({
  logoIcon: {
    borderRadius: "22px",
    width: "44px",
    height: "44px",
  },
  tokenListItem: {
    borderTop: `solid 1pt ${theme.custom.colors.border}`,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: "12px",
    paddingRight: "12px",
    padding: 0,
    height: "68px",
  },
  tokenListItemIcon: {
    paddingTop: "12px",
    paddingBottom: "12px",
    marginRight: "12px",
  },
  tokenListItemIconRoot: {
    minWidth: "44px",
  },
  blockchainCard: {
    backgroundColor: theme.custom.colors.nav,
    marginBottom: "12px",
    marginLeft: "12px",
    marginRight: "12px",
    borderRadius: "12px",
    boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.15)",
  },
  blockchainFooter: {
    borderTop: `solid 1pt ${theme.custom.colors.border}`,
    display: "flex",
    justifyContent: "space-between",
    paddingLeft: "16px",
    paddingRight: "16px",
    paddingTop: "6px",
    paddingBottom: "6px",
    height: "36px",
  },
  footerArrowIcon: {
    width: "10px",
    color: theme.custom.colors.secondary,
  },
  footerLabel: {
    fontSize: "14px",
    weight: 500,
    color: theme.custom.colors.fontColor,
  },
  cardContentRoot: {
    padding: "0 !important",
  },
  blockchainLogo: {
    width: "12px",
    color: theme.custom.colors.secondary,
  },
  cardHeaderRoot: {
    padding: "6px",
    paddingLeft: "16px",
    paddingRight: "16px",
    height: "36px",
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
    paddingTop: "10px",
    paddingBottom: "10px",
  },
  tokenListItemRow: {
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
  tokenBalanceChangeNeutral: {
    fontWeight: 500,
    fontSize: "12px",
    color: theme.custom.colors.secondary,
    float: "right",
  },
  tokenBalanceChangePositive: {
    fontWeight: 500,
    fontSize: "12px",
    color: theme.custom.colors.positive,
    float: "right",
  },
  tokenBalanceChangeNegative: {
    fontWeight: 500,
    fontSize: "12px",
    color: theme.custom.colors.negative,
    float: "right",
  },
  balancesHeaderContainer: {
    display: "flex",
    justifyContent: "space-between",
    paddingLeft: "24px",
    paddingRight: "24px",
    paddingTop: "16px",
    paddingBottom: "16px",
  },
  headerLabel: {
    fontSize: "12px",
    fontWeight: 500,
    color: theme.custom.colors.secondary,
    lineHeight: "24px",
  },
  totalBalance: {
    fontWeight: 500,
    fontSize: "20px",
    color: theme.custom.colors.fontColor,
    lineHeight: "24px",
  },
  positive: {
    color: theme.custom.colors.positive,
    fontSize: "12px",
    lineHeight: "24px",
  },
  negative: {
    color: theme.custom.colors.negative,
    fontSize: "12px",
    lineHeight: "24px",
  },
  cardAvatar: {
    display: "flex",
  },
}));

export function Balances() {
  const blockchains = useBlockchains();
  return (
    <div>
      <BalancesHeader />
      <PluginGrid />
      {blockchains.map((b) => (
        <BlockchainCard
          key={b}
          blockchain={b}
          title={toTitleCase(b)}
          limit={3}
          avatar={true}
        />
      ))}
    </div>
  );
}

export function BalancesHeader({ blockchain }: { blockchain?: string }) {
  const classes = useStyles();
  const { totalBalance, totalChange, percentChange } = useTotal(blockchain);
  return (
    <div className={classes.balancesHeaderContainer}>
      <div>
        <Typography className={classes.headerLabel}>Total Balance</Typography>
        <Typography className={classes.totalBalance}>
          ${totalBalance.toLocaleString()}
        </Typography>
      </div>
      <div>
        <Typography className={classes.headerLabel}>Last 24 hrs</Typography>
        <Typography
          className={totalChange > 0 ? classes.positive : classes.negative}
        >
          ${totalChange.toLocaleString()} ({percentChange}%)
        </Typography>
      </div>
    </div>
  );
}

export function BlockchainCard({
  blockchain,
  title,
  limit,
  avatar = false,
}: {
  blockchain: string;
  title: string;
  limit?: number;
  avatar?: boolean;
}) {
  const classes = useStyles();
  const blockchainLogo = useBlockchainLogo(blockchain);
  const tokenAccountsSorted = useBlockchainTokensSorted(blockchain);
  const { push } = useNavigation();
  return (
    <Card className={classes.blockchainCard} elevation={0}>
      <CardHeader
        avatar={
          avatar ? (
            <img className={classes.blockchainLogo} src={blockchainLogo} />
          ) : undefined
        }
        title={title}
        classes={{
          root: classes.cardHeaderRoot,
          content: classes.cardHeaderContent,
          title: classes.cardHeaderTitle,
        }}
      />
      <CardContent classes={{ root: classes.cardContentRoot }}>
        <List classes={{ root: classes.cardListRoot }}>
          {tokenAccountsSorted
            .slice(0, limit ?? tokenAccountsSorted.length)
            .map((token: any) => (
              <TokenListItem
                key={token.address}
                blockchain={blockchain}
                token={token}
              />
            ))}
          {tokenAccountsSorted.length > 3 && limit && (
            <BlockchainCardFooter
              onClick={() => {
                push({
                  title: toTitleCase(blockchain),
                  componentId: NAV_COMPONENT_BALANCES_NETWORK,
                  componentProps: { blockchain },
                });
              }}
              tokenCount={tokenAccountsSorted.length}
            />
          )}
        </List>
      </CardContent>
    </Card>
  );
}

function TokenListItem({
  token,
  blockchain,
}: {
  token: any;
  blockchain: string;
}) {
  const classes = useStyles();
  const { push: pushNavigation } = useNavigation();

  if (token.nativeBalance === 0) {
    return <></>;
  }

  const positive = token.recentUsdBalanceChange > 0 ? true : false;
  const negative = token.recentUsdBalanceChange < 0 ? true : false;
  const neutral = token.recentusdBalanceChange === 0 ? true : false;

  return (
    <ListItem
      button
      disableRipple
      className={classes.tokenListItem}
      onClick={() => {
        pushNavigation({
          title: `${toTitleCase(blockchain)} / ${token.ticker}`,
          componentId: NAV_COMPONENT_TOKEN,
          componentProps: {
            blockchain,
            address: token.address,
          },
        });
      }}
    >
      <ListItemIcon
        className={classes.tokenListItemIcon}
        classes={{ root: classes.tokenListItemIconRoot }}
      >
        <img src={token.logo} className={classes.logoIcon} />
      </ListItemIcon>
      <div className={classes.tokenListItemContent}>
        <div className={classes.tokenListItemRow}>
          <Typography className={classes.tokenName}>{token.ticker}</Typography>
          <Typography className={classes.tokenBalance}>
            ${token.usdBalance.toLocaleString()}
          </Typography>
        </div>
        <div className={classes.tokenListItemRow}>
          <Typography className={classes.tokenAmount}>
            {token.nativeBalance.toLocaleString()} {token.ticker}
          </Typography>
          {positive && (
            <Typography className={classes.tokenBalanceChangePositive}>
              $+{token.recentUsdBalanceChange.toLocaleString()}
            </Typography>
          )}
          {negative && (
            <Typography className={classes.tokenBalanceChangeNegative}>
              ${token.recentUsdBalanceChange.toLocaleString()}
            </Typography>
          )}
          {neutral && (
            <Typography className={classes.tokenBalanceChangeNeutral}>
              ${token.recentUsdBalanceChange.toLocaleString()}
            </Typography>
          )}
        </div>
      </div>
    </ListItem>
  );
}

function BlockchainCardFooter({
  onClick,
  tokenCount,
}: {
  onClick: () => void;
  tokenCount: number;
}) {
  const classes = useStyles();
  return (
    <ListItem
      button
      disableRipple
      className={classes.blockchainFooter}
      onClick={onClick}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Typography className={classes.footerLabel}>
          Show all {tokenCount}
        </Typography>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <ArrowForwardIos className={classes.footerArrowIcon} />
      </div>
    </ListItem>
  );
}

export function toTitleCase(blockchain: string) {
  return (
    blockchain.slice(0, 1).toUpperCase() + blockchain.toLowerCase().slice(1)
  );
}
