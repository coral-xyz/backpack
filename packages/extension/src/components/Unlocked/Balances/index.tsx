import { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  IconButton,
} from "@material-ui/core";
import { ArrowForwardIos, OfflineBolt as Bolt } from "@material-ui/icons";
import {
  BalancesTable,
  BalancesTableHead,
  BalancesTableContent,
  PluginRenderer,
} from "@200ms/anchor-ui-renderer";
import {
  useBlockchains,
  useBlockchainLogo,
  useTotal,
  useBlockchainTokensSorted,
  useNavigation,
  useTablePlugins,
} from "@200ms/recoil";
import {
  toTitleCase,
  NAV_COMPONENT_BALANCES_NETWORK,
  NAV_COMPONENT_TOKEN,
} from "@200ms/common";
import { WithDrawer } from "../../Layout/Drawer";
import { RecentActivity } from "./RecentActivity";

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
    paddingLeft: "12px",
    paddingRight: "12px",
    marginLeft: "12px",
    marginRight: "12px",
    paddingTop: "12px",
    paddingBottom: "12px",
    borderRadius: "12px",
    backgroundColor: theme.custom.colors.nav,
    marginBottom: "12px",
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
  networkSettingsButtonContainer: {
    display: "flex",
    flexDirection: "row-reverse",
    width: "38px",
  },
  networkSettingsButton: {
    padding: 0,
    "&:hover": {
      background: "transparent",
    },
  },
  networkSettingsIcon: {
    color: theme.custom.colors.nav,
    backgroundColor: theme.custom.colors.secondary,
    borderRadius: "12px",
  },
}));

export function Balances() {
  return (
    <div>
      <SolanaBalances />
      <PluginTables />
    </div>
  );
}

function RecentActivityButton() {
  const classes = useStyles();
  const [openDrawer, setOpenDrawer] = useState(false);
  return (
    <div className={classes.networkSettingsButtonContainer}>
      <IconButton
        disableRipple
        className={classes.networkSettingsButton}
        onClick={() => setOpenDrawer(true)}
      >
        <Bolt className={classes.networkSettingsIcon} />
      </IconButton>
      <WithDrawer
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
        title={"Recent Activity"}
      >
        <RecentActivity />
      </WithDrawer>
    </div>
  );
}

export function SolanaBalances() {
  return (
    <div>
      <BalancesHeader blockchain={"solana"} />
      <BlockchainCard blockchain={"solana"} title={"Tokens"} limit={3} />
    </div>
  );
}

function PluginTables() {
  const tablePlugins = useTablePlugins();
  return (
    <>
      {tablePlugins.map((plugin: any) => {
        return <PluginRenderer key={plugin.iframeUrl} plugin={plugin} />;
      })}
    </>
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
}: {
  blockchain: string;
  title: string;
  limit?: number;
}) {
  const blockchainLogo = useBlockchainLogo(blockchain);
  const tokenAccountsSorted = useBlockchainTokensSorted(blockchain);
  const [showAll, setShowAll] = useState(false);
  return (
    <BalancesTable>
      <BalancesTableHead props={{ title, iconUrl: blockchainLogo }} />
      <BalancesTableContent>
        {tokenAccountsSorted
          .slice(0, limit && !showAll ? limit : tokenAccountsSorted.length)
          .map((token: any) => (
            <BalancesTableRow token={token} blockchain={blockchain} />
          ))}
      </BalancesTableContent>
      <BalancesTableFooter
        count={tokenAccountsSorted.length}
        showAll={showAll}
        setShowAll={setShowAll}
      />
    </BalancesTable>
  );
}

export function BalancesTableFooter({ count, showAll, setShowAll }: any) {
  return (
    <BlockchainCardFooter
      showAll={showAll}
      onClick={() => setShowAll((showAll: boolean) => !showAll)}
      count={count}
    />
  );
}

export function BalancesTableRow({ token, blockchain }: any) {
  return (
    <TokenListItem key={token.address} blockchain={blockchain} token={token} />
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
  showAll,
  onClick,
  count,
}: {
  showAll: boolean;
  onClick: () => void;
  count: number;
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
          {showAll ? `Hide ${count}` : `Show all ${count}`}
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
