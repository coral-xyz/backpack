import type { Element } from "@200ms/anchor-ui";
import { NodeKind } from "@200ms/anchor-ui";
import {
  makeStyles,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  Typography,
} from "@material-ui/core";
import { usePluginContext } from "./Context";
import { ViewRenderer } from "./ViewRenderer";

const useStyles = makeStyles((theme: any) => ({
  blockchainLogo: {
    width: "12px",
    color: theme.custom.colors.secondary,
  },
  blockchainCard: {
    backgroundColor: theme.custom.colors.nav,
    marginBottom: "12px",
    marginLeft: "12px",
    marginRight: "12px",
    borderRadius: "12px",
    boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.15)",
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
  cardHeaderContent: {
    color: theme.custom.colors.fontColor,
  },
  cardContentRoot: {
    padding: "0 !important",
  },
  cardListRoot: {
    padding: "0 !important",
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
  tokenListItemIconRoot: {
    minWidth: "44px",
  },
}));

export const Component = ({ viewData }) => {
  const { id, props, style, kind } = viewData;
  switch (kind) {
    case NodeKind.View:
      return (
        <View
          id={id}
          props={props}
          style={style}
          children={viewData.children}
        />
      );
    case NodeKind.Text:
      return <Text props={props} style={style} children={viewData.children} />;
    case NodeKind.Table:
      return <Table props={props} style={style} />;
    case NodeKind.Image:
      return <Image props={props} style={style} children={viewData.children} />;
    case NodeKind.BalancesTable:
      return (
        <BalancesTable
          props={props}
          style={style}
          childrenRenderer={viewData.children}
        />
      );
    case NodeKind.BalancesTableHead:
      return <BalancesTableHead props={props} style={style} />;
    case NodeKind.BalancesTableContent:
      return (
        <BalancesTableContent
          props={props}
          style={style}
          childrenRenderer={viewData.children}
        />
      );
    case NodeKind.BalancesTableRow:
      return (
        <BalancesTableRow
          props={props}
          style={style}
          childrenRenderer={viewData.children}
        />
      );
    case NodeKind.BalancesTableCell:
      return <BalancesTableCell props={props} style={style} />;
    case NodeKind.BalancesTableFooter:
      return (
        <BalancesTableFooter
          props={props}
          style={style}
          children={viewData.children}
        />
      );
    case "raw":
      return <Raw text={viewData.text} />;
    default:
      console.error(viewData);
      throw new Error("unexpected view data");
  }
};

export function BalancesTable({
  props,
  style,
  children,
  childrenRenderer,
}: any) {
  const classes = useStyles();
  return (
    <Card className={classes.blockchainCard} elevation={0}>
      {children ??
        childrenRenderer.map((c: Element) => (
          <ViewRenderer key={c.id} element={c} />
        ))}
    </Card>
  );
}

export function BalancesTableHead({ props, style }: any) {
  const { title, iconUrl } = props;
  const classes = useStyles();
  return (
    <CardHeader
      avatar={
        iconUrl ? (
          <img className={classes.blockchainLogo} src={iconUrl} />
        ) : undefined
      }
      title={title}
      classes={{
        root: classes.cardHeaderRoot,
        content: classes.cardHeaderContent,
        title: classes.cardHeaderTitle,
      }}
    />
  );
}

export function BalancesTableContent({
  props,
  style,
  children,
  childrenRenderer,
}: any) {
  const classes = useStyles();
  return (
    <CardContent classes={{ root: classes.cardContentRoot }}>
      <List classes={{ root: classes.cardListRoot }}>
        {children ??
          childrenRenderer.map((c: Element) => (
            <ViewRenderer key={c.id} element={c} />
          ))}
      </List>
    </CardContent>
  );
}

export function BalancesTableRow({
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
    >
      {children ??
        childrenRenderer.map((c: Element) => (
          <ViewRenderer key={c.id} element={c} />
        ))}
    </ListItem>
  );
}

export function BalancesTableCell({ props, style }: any) {
  const { icon, title, subtitle, usdValue, percentChange } = props;
  const classes = useStyles();

  const positive = percentChange && percentChange > 0 ? true : false;
  const negative = percentChange && percentChange < 0 ? true : false;
  const neutral = percentChange && percentChange === 0 ? true : false;

  return (
    <div className={classes.balancesTableCellContainer}>
      <ListItemIcon
        className={classes.tokenListItemIcon}
        classes={{ root: classes.tokenListItemIconRoot }}
      >
        <img src={icon} className={classes.logoIcon} />
      </ListItemIcon>
      <div className={classes.tokenListItemContent}>
        <div className={classes.tokenListItemRow}>
          <Typography className={classes.tokenName}>{title}</Typography>
          <Typography className={classes.tokenBalance}>
            ${usdValue.toLocaleString()}
          </Typography>
        </div>
        <div className={classes.tokenListItemRow}>
          <Typography className={classes.tokenAmount}>{subtitle}</Typography>
          {percentChange !== undefined && positive && (
            <Typography className={classes.tokenBalanceChangePositive}>
              $+{percentChange.toLocaleString()}
            </Typography>
          )}
          {percentChange !== undefined && negative && (
            <Typography className={classes.tokenBalanceChangeNegative}>
              ${percentChange.toLocaleString()}
            </Typography>
          )}
          {percentChange !== undefined && neutral && (
            <Typography className={classes.tokenBalanceChangeNeutral}>
              ${percentChange.toLocaleString()}
            </Typography>
          )}
        </div>
      </div>
    </div>
  );
}

export function BalancesTableFooter({ props, style, children }: any) {
  return (
    <div style={style}>
      {children.map((c: Element) => (
        <ViewRenderer key={c.id} element={c} />
      ))}
    </div>
  );
}

function View({ id, props, style, children }: any) {
  const { plugin } = usePluginContext();
  const onClick = !props.onClick
    ? undefined
    : (_event) => {
        plugin.didClick(id);
      };
  return (
    <div style={style} onClick={onClick}>
      {children.map((c: Element) => (
        <ViewRenderer key={c.id} element={c} />
      ))}
    </div>
  );
}

function Table({ props, style, children }: any) {
  return <></>;
}

function Text({ props, children, style }: any) {
  style = {
    color: "#fff", // todo: inject theme into top level renderer and set provider?
    fontWeight: 500,
    ...style,
  };
  return (
    <p style={style}>
      {children.map((c: Element) => (
        <ViewRenderer key={c.id} element={c} />
      ))}
    </p>
  );
}

function Image({ props, style }: any) {
  return <img src={props.src} style={style} />;
}

function Raw({ text }: any) {
  return <>{text}</>;
}
