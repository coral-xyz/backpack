import React, { useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import {
  formatUsd,
  proxyImageUrl,
  toTitleCase,
  UNKNOWN_ICON_SRC,
} from "@coral-xyz/common";
import {
  getBlockchainLogo,
  isAggregateWallets,
  useActiveWallet,
} from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import {
  Button as MuiButton,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItemButton,
  ListItemIcon,
  Typography,
} from "@mui/material";
import { useRecoilValue } from "recoil";

import { WalletDrawerButton } from "../../common/WalletList";

const useStyles = styles((theme) => ({
  blockchainLogo: {
    width: "12px",
    borderRadius: "2px",
    color: theme.custom.colors.secondary,
  },
  blockchainCard: {
    backgroundColor: "inherit",
    marginBottom: "12px",
    marginLeft: "12px",
    marginRight: "12px",
    borderRadius: "12px",
    border: theme.custom.colors.borderFull,
  },
  cardHeaderAvatar: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },
  cardHeaderRoot: {
    padding: "6px",
    paddingLeft: "16px",
    paddingRight: "16px",
    height: "36px",
    width: "100%",
  },
  cardHeaderTitle: {
    fontWeight: 500,
    fontSize: "14px",
  },
  cardHeaderContent: {
    color: theme.custom.colors.fontColor,
  },
  cardContentRoot: {
    padding: "0 !important",
  },
  cardListRoot: {
    padding: "0 !important",
    height: "100%",
  },
  tokenListItem: {
    borderTop: `solid 1pt ${theme.custom.colors.border}`,
    backgroundColor: `${theme.custom.colors.nav} !important`,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: "12px",
    paddingRight: "12px",
    padding: 0,
    height: "68px",
  },
  balancesTableCellContainer: {
    width: "100%",
    height: "100%",
    display: "flex",
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
  logoIcon: {
    borderRadius: "22px",
    width: "44px",
    height: "44px",
  },
  tokenListItemIcon: {
    paddingTop: "12px",
    paddingBottom: "12px",
    marginRight: "12px",
  },
  tokenName: {
    height: "24px",
    fontWeight: 500,
    fontSize: "16px",
    maxWidth: "200px",
    overflow: "hidden",
    color: theme.custom.colors.fontColor,
    lineHeight: "24px",
  },
  tokenAmount: {
    fontWeight: 500,
    fontSize: "14px",
    color: theme.custom.colors.secondary,
    lineHeight: "20px",
  },
  tokenBalance: {
    fontWeight: 500,
    fontSize: "16px",
    color: theme.custom.colors.fontColor,
    lineHeight: "24px",
  },
  tokenBalanceChangeNeutral: {
    fontWeight: 500,
    fontSize: "14px",
    color: theme.custom.colors.secondary,
    float: "right",
    lineHeight: "20px",
  },
  tokenBalanceChangePositive: {
    fontWeight: 500,
    fontSize: "14px",
    color: theme.custom.colors.positive,
    float: "right",
    lineHeight: "20px",
  },
  tokenBalanceChangeNegative: {
    fontWeight: 500,
    fontSize: "14px",
    color: theme.custom.colors.negative,
    float: "right",
    lineHeight: "20px",
  },
  tokenListItemIconRoot: {
    minWidth: "44px",
  },
  expand: {
    width: "18px",
    color: theme.custom.colors.secondary,
  },
}));

export function BalancesTableCell({ props }: any) {
  const { icon, title, subtitle, usdValue, balanceChange } = props;
  const classes = useStyles();

  // Determine the balance change polarity with a 100th rounding margin of 0.00
  const polarity =
    (balanceChange ?? 0) > 0.004
      ? "positive"
      : (balanceChange ?? 0) < -0.004
      ? "negative"
      : "neutral";

  const changeLabel =
    polarity === "positive" ? (
      <Typography className={classes.tokenBalanceChangePositive}>
        +{formatUsd(balanceChange.toLocaleString())}
      </Typography>
    ) : polarity === "negative" ? (
      <Typography className={classes.tokenBalanceChangeNegative}>
        {formatUsd(balanceChange.toLocaleString())}
      </Typography>
    ) : null;

  return (
    <div className={classes.balancesTableCellContainer}>
      {icon ? (
        <ListItemIcon
          className={classes.tokenListItemIcon}
          classes={{ root: classes.tokenListItemIconRoot }}
        >
          <ProxyImage
            src={icon}
            className={classes.logoIcon}
            onError={(event: any) => {
              event.currentTarget.src = UNKNOWN_ICON_SRC;
            }}
          />
        </ListItemIcon>
      ) : null}
      <div className={classes.tokenListItemContent}>
        <div className={classes.tokenListItemRow}>
          <Typography className={classes.tokenName}>{title}</Typography>
          <Typography className={classes.tokenBalance}>
            {usdValue ? formatUsd(usdValue) : "-"}
          </Typography>
        </div>
        <div className={classes.tokenListItemRow}>
          {subtitle ? (
            <Typography className={classes.tokenAmount}>{subtitle}</Typography>
          ) : null}
          {changeLabel}
          {!usdValue ? (
            <Typography className={classes.tokenBalanceChangeNeutral}>
              -
            </Typography>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function BalancesTable({ style, children }: any) {
  const classes = useStyles();
  return (
    <BalancesTableProvider>
      <Card className={classes.blockchainCard} elevation={0} style={style}>
        {children}
      </Card>
    </BalancesTableProvider>
  );
}

export function BalancesTableProvider(props: any) {
  const [showContent, setShowContent] = useState(true);
  return (
    <_BalancesTableContext.Provider
      value={{
        showContent,
        setShowContent,
      }}
    >
      {props.children}
    </_BalancesTableContext.Provider>
  );
}

type BalancesContext = {
  showContent: boolean;
  setShowContent: (b: boolean) => void;
};
const _BalancesTableContext = React.createContext<BalancesContext | null>(null);

export function useBalancesContext() {
  const ctx = React.useContext(_BalancesTableContext);
  if (ctx === null) {
    throw new Error("Context not available");
  }
  return ctx;
}

export function BalancesTableHead({
  disableToggle,
  wallet,
}: {
  wallet: { name: string; publicKey: string; blockchain: Blockchain };
  disableToggle?: boolean;
}) {
  const { showContent, setShowContent } = useBalancesContext();
  return (
    <_BalancesTableHead
      blockchain={wallet.blockchain}
      disableToggle={disableToggle}
      showContent={showContent}
      setShowContent={setShowContent}
    />
  );
}

export function _BalancesTableHead({
  blockchain,
  disableToggle,
  showContent,
  setShowContent,
}: {
  blockchain: Blockchain;
  disableToggle?: boolean;
  showContent: boolean;
  setShowContent: (b: boolean) => void;
}) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const title = toTitleCase(blockchain);
  const iconUrl = getBlockchainLogo(blockchain);
  const _isAggregateWallets = useRecoilValue(isAggregateWallets);
  const wallet = useActiveWallet();
  return (
    <div
      style={{
        width: "100%",
        borderRadius: 0,
        padding: 0,
        backgroundColor: theme.custom.colors.nav,
      }}
    >
      <CardHeader
        avatar={
          iconUrl ? (
            <ProxyImage className={classes.blockchainLogo} src={iconUrl} />
          ) : undefined
        }
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                width: "100%",
              }}
            >
              <Typography
                style={{
                  fontWeight: 500,
                  lineHeight: "24px",
                  fontSize: "14px",
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                {title}
              </Typography>
              <WalletDrawerButton
                showIcon={false}
                wallet={wallet}
                buttonStyle={{
                  border: undefined,
                  padding: 0,
                  marginLeft: "5px",
                }}
              />
            </div>
            {_isAggregateWallets ? (
              <MuiButton
                disableRipple
                style={{
                  width: "18px",
                  minWidth: "18px",
                  marginLeft: "8px",
                  padding: 0,
                }}
                onClick={() => !disableToggle && setShowContent(!showContent)}
              >
                {showContent ? (
                  <ExpandLess className={classes.expand} />
                ) : (
                  <ExpandMore className={classes.expand} />
                )}
              </MuiButton>
            ) : null}
          </div>
        }
        classes={{
          root: `${classes.cardHeaderRoot}`,
          content: classes.cardHeaderContent,
          title: classes.cardHeaderTitle,
          avatar: classes.cardHeaderAvatar,
        }}
      />
    </div>
  );
}

export function BalancesTableContent({ style, children }: any) {
  const classes = useStyles();
  const { showContent } = useBalancesContext();
  return (
    <CardContent classes={{ root: classes.cardContentRoot }} style={style}>
      <List
        style={{
          display: !showContent ? "none" : undefined,
        }}
        classes={{ root: classes.cardListRoot }}
      >
        {children}
      </List>
    </CardContent>
  );
}

export function BalancesTableRow({
  id,
  props,
  style,
  children,
  childrenRenderer,
  onClick,
}: any) {
  return (
    <__BalancesTableRow
      id={id}
      props={props}
      style={style}
      children={children}
      childrenRenderer={childrenRenderer}
      onClick={onClick}
    />
  );
}

function __BalancesTableRow({ style, children, onClick }: any) {
  const classes = useStyles();
  return (
    <ListItemButton
      disableRipple
      className={classes.tokenListItem}
      onClick={onClick}
      style={style}
    >
      {children}
    </ListItemButton>
  );
}
function ProxyImage(props: any) {
  return (
    <img
      {...props}
      onError={({ currentTarget }) => {
        currentTarget.onerror = props.onError || null;
        currentTarget.src = props.src;
      }}
      src={proxyImageUrl(props.src)}
    />
  );
}
