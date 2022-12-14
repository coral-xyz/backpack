import React, { useRef,useState } from "react";
import { formatUSD, proxyImageUrl } from "@coral-xyz/common";
import { useDeveloperMode } from "@coral-xyz/recoil";
import { styles } from "@coral-xyz/themes";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import {
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  Typography,
} from "@mui/material";

import { Button } from "../../../plugin";

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
  hover: {
    "&:hover": {
      cursor: "pointer",
    },
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
    fontSize: "12px",
    color: theme.custom.colors.negative,
    float: "right",
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
  const { icon, title, subtitle, usdValue, percentChange } = props;
  const classes = useStyles();
  const isDeveloperMode = useDeveloperMode();
  const [displayCell, setDisplayCell] = useState(true);
  const [domNode, setDomNode] = useState<any>(null);

  const positive = percentChange && percentChange > 0 ? true : false;
  const negative = percentChange && percentChange < 0 ? true : false;
  const neutral = percentChange && percentChange === 0 ? true : false;

  let trim;
  try {
    trim = `${subtitle.split(".")[0]}.${subtitle.split(".")[1].slice(0, 5)}`;
  } catch {
    // pass
  }

  return !displayCell ? null : (
    <div
      ref={(current) => {
        setDomNode(current);
      }}
      className={classes.balancesTableCellContainer}
    >
      {!!icon && (
        <ListItemIcon
          className={classes.tokenListItemIcon}
          classes={{ root: classes.tokenListItemIconRoot }}
        >
          <ProxyImage
            src={icon}
            className={classes.logoIcon}
            onError={(event: any) => {
              event.currentTarget.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12ZM10.9645 15.3015C10.9645 15.7984 11.3677 16.2015 11.8645 16.2015C12.3612 16.2015 12.7645 15.7984 12.7645 15.3015C12.7645 14.8047 12.3612 14.4015 11.8645 14.4015C11.3677 14.4015 10.9645 14.8047 10.9645 15.3015ZM13.3939 11.8791C13.9135 11.5085 14.2656 11.1748 14.4511 10.8777C14.8776 10.1948 14.8728 9.02088 14.0532 8.35291C12.9367 7.44383 10.8943 7.77224 9.6001 8.49763L10.2067 9.7155C10.9189 9.35193 11.553 9.17 12.1092 9.17C12.6546 9.17 13.1214 9.36453 13.1214 9.91004C13.1214 10.4891 12.6543 10.8231 12.1713 11.1684L12.171 11.1686L12.1645 11.173C11.9915 11.2996 11.8416 11.4235 11.7147 11.5442C11.5451 11.7059 11.4168 11.8621 11.3298 12.013C11.1013 12.4085 11.1014 12.736 11.1019 13.152V13.2015H12.5761L12.576 13.158C12.5755 12.6312 12.5753 12.4844 13.3939 11.8791ZM20.5 12C20.5 16.6944 16.6944 20.5 12 20.5C7.30558 20.5 3.5 16.6944 3.5 12C3.5 7.30558 7.30558 3.5 12 3.5C16.6944 3.5 20.5 7.30558 20.5 12ZM22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z' fill='%238F929E'/%3E%3C/svg%3E";
            }}
          />
        </ListItemIcon>
      )}
      <div className={classes.tokenListItemContent}>
        <div className={classes.tokenListItemRow}>
          <Typography className={classes.tokenName}>{title}</Typography>
          {usdValue && (
            <Typography className={classes.tokenBalance}>
              {formatUSD(usdValue)}
            </Typography>
          )}
        </div>
        <div className={classes.tokenListItemRow}>
          {subtitle && (
            <Typography className={classes.tokenAmount}>
              {trim ? trim : subtitle}
            </Typography>
          )}
          {percentChange !== undefined && positive && (
            <Typography className={classes.tokenBalanceChangePositive}>
              +{formatUSD(percentChange.toLocaleString())}
            </Typography>
          )}
          {percentChange !== undefined && negative && (
            <Typography className={classes.tokenBalanceChangeNegative}>
              {formatUSD(percentChange.toLocaleString())}
            </Typography>
          )}
          {percentChange !== undefined && neutral && (
            <Typography className={classes.tokenBalanceChangeNeutral}>
              {formatUSD(percentChange.toLocaleString())}
            </Typography>
          )}
        </div>
      </div>
    </div>
  );
}

export function BalancesTable({ props, style, children }: any) {
  const classes = useStyles();
  return (
    <BalancesTableProvider>
      <Card className={classes.blockchainCard} elevation={0} style={style}>
        {children}
      </Card>
    </BalancesTableProvider>
  );
}

function BalancesTableProvider(props: any) {
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

export function BalancesTableHead({ props, style }: any) {
  const { subtitle, title, iconUrl, disableToggle } = props;
  const classes = useStyles();
  const { showContent, setShowContent } = useBalancesContext();
  return (
    <Button
      style={{
        width: "100%",
        borderRadius: 0,
        padding: 0,
        ...style,
      }}
    >
      <CardHeader
        onClick={() => !disableToggle && setShowContent(!showContent)}
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
              {subtitle}
            </div>
            {!disableToggle && (
              <>
                {showContent ? (
                  <ExpandLess className={classes.expand} />
                ) : (
                  <ExpandMore className={classes.expand} />
                )}
              </>
            )}
          </div>
        }
        classes={{
          root: `${classes.cardHeaderRoot} ${
            disableToggle ? "" : classes.hover
          }`,
          content: classes.cardHeaderContent,
          title: classes.cardHeaderTitle,
          avatar: classes.cardHeaderAvatar,
        }}
      />
    </Button>
  );
}

export function BalancesTableContent({ props, style, children }: any) {
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

function __BalancesTableRow({
  id,
  props,
  style,
  children,
  childrenRenderer,
  onClick,
}: any) {
  const classes = useStyles();
  return (
    <ListItem
      button
      disableRipple
      className={classes.tokenListItem}
      onClick={onClick}
      style={style}
    >
      {children}
    </ListItem>
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
