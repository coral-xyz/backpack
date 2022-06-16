import React, { useState } from "react";
import type { Element } from "@coral-xyz/anchor-ui";
import { NodeKind } from "@coral-xyz/anchor-ui";
import { formatUSD } from "@coral-xyz/common";
import {
  Button as MuiButton,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  Typography,
  TextField as MuiTextField,
} from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import makeStyles from "@mui/styles/makeStyles";
import { usePluginContext } from "./Context";
import { ViewRenderer } from "./ViewRenderer";

const useStyles = makeStyles((theme: any) => ({
  blockchainLogo: {
    width: "12px",
    borderRadius: "2px",
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
  button: {
    borderRadius: "12px",
    width: "100px",
    height: "40px",
    textTransform: "none",
    backgroundColor: theme.custom.colors.nav,
    "&:hover": {
      backgroundColor: theme.custom.colors.nav,
    },
  },
  passwordField: {
    fontSize: "14px",
    lineHeight: "24px",
    fontWeight: 500,
    borderRadius: "12px",
    color: theme.custom.colors.secondary,
    width: "351px",
  },
  passwordRoot: {
    marginLeft: "12px",
    marginRight: "12px",
    width: "351px",
    "& .MuiOutlinedInput-root": {
      border: `solid 1pt ${theme.custom.colors.border}`,
      backgroundColor: theme.custom.colors.background,
      borderRadius: "12px",
      height: "56px",
      "& fieldset": {
        border: "none",
      },
    },
  },
  textRootError: {
    "& .MuiOutlinedInput-root": {
      borderColor: `${theme.custom.colors.negative} !important`,
    },
  },
  expand: {
    width: "18px",
    color: theme.custom.colors.secondary,
  },
}));

export function Component({ viewData }) {
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
    case NodeKind.TextField:
      return (
        <_TextField
          id={id}
          props={props}
          style={style}
          children={viewData.children}
        />
      );
    case NodeKind.Table:
      return <Table props={props} style={style} />;
    case NodeKind.Image:
      return <Image props={props} style={style} children={viewData.children} />;
    case NodeKind.Button:
      return (
        <_Button
          id={id}
          props={props}
          style={style}
          childrenRenderer={viewData.children}
        />
      );
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
        <_BalancesTableRow
          id={id}
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
}

export function BalancesTable({
  props,
  style,
  children,
  childrenRenderer,
}: any) {
  const classes = useStyles();
  return (
    <BalancesTableProvider>
      <Card className={classes.blockchainCard} elevation={0}>
        {children ??
          childrenRenderer.map((c: Element) => (
            <ViewRenderer key={c.id} element={c} />
          ))}
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
  const { title, iconUrl, disableToggle } = props;
  const classes = useStyles();
  const { showContent, setShowContent } = useBalancesContext();
  return (
    <CardHeader
      onClick={() => !disableToggle && setShowContent(!showContent)}
      avatar={
        iconUrl ? (
          <img className={classes.blockchainLogo} src={iconUrl} />
        ) : undefined
      }
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography
            style={{
              fontWeight: 500,
              lineHeight: "24px",
              fontSize: "14px",
            }}
          >
            {title}
          </Typography>
          {!disableToggle && (
            <>
              {showContent ? (
                <ExpandMore className={classes.expand} />
              ) : (
                <ExpandLess className={classes.expand} />
              )}
            </>
          )}
        </div>
      }
      classes={{
        root: `${classes.cardHeaderRoot} ${disableToggle ? "" : classes.hover}`,
        content: classes.cardHeaderContent,
        title: classes.cardHeaderTitle,
        avatar: classes.cardHeaderAvatar,
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
  const { showContent } = useBalancesContext();
  return (
    <CardContent classes={{ root: classes.cardContentRoot }}>
      <List
        style={{
          display: !showContent ? "none" : undefined,
        }}
        classes={{ root: classes.cardListRoot }}
      >
        {children ??
          childrenRenderer.map((c: Element) => (
            <ViewRenderer key={c.id} element={c} />
          ))}
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

function _BalancesTableRow({
  id,
  props,
  style,
  children,
  childrenRenderer,
}: any) {
  const { plugin } = usePluginContext();
  const clickHandler = !props.onClick
    ? undefined
    : (_) => plugin.pushClickNotification(id);
  return (
    <__BalancesTableRow
      id={id}
      props={props}
      style={style}
      children={children}
      childrenRenderer={childrenRenderer}
      onClick={clickHandler}
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
          {usdValue && (
            <Typography className={classes.tokenBalance}>
              {formatUSD(usdValue)}
            </Typography>
          )}
        </div>
        <div className={classes.tokenListItemRow}>
          {subtitle && (
            <Typography className={classes.tokenAmount}>{subtitle}</Typography>
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
        plugin.pushClickNotification(id);
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
    <Typography style={style}>
      {children.map((c: Element) => (
        <ViewRenderer key={c.id} element={c} />
      ))}
    </Typography>
  );
}

function _TextField({ id, props, children, style }: any) {
  const { plugin } = usePluginContext();
  const onChange = !props.onChange
    ? undefined
    : (value: any) => {
        plugin.pushOnChangeNotification(id, value);
      };
  return (
    <TextField
      placeholder={props.placeholder}
      value={props.value}
      setValue={onChange}
    />
  );
}

export function TextField({
  placeholder,
  type,
  value,
  setValue,
  rootClass,
  endAdornment,
  isError,
  inputProps,
  disabled,
}: any) {
  const classes = useStyles();
  inputProps = Object.assign(
    {
      className: classes.passwordField,
    },
    inputProps
  );
  return (
    <MuiTextField
      disabled={disabled}
      placeholder={placeholder}
      variant="outlined"
      margin="dense"
      required
      fullWidth
      type={type}
      inputProps={inputProps}
      classes={{
        root: `${isError ? classes.textRootError : ""} ${
          classes.passwordRoot
        } ${rootClass ?? ""}`,
      }}
      InputLabelProps={{
        shrink: false,
        style: {
          borderRadius: "12px",
        },
      }}
      InputProps={{
        endAdornment,
      }}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

function Image({ props, style }: any) {
  return <img src={props.src} style={style} />;
}

export function Button({ id, props, style, onClick, children }: any) {
  return (
    <__Button
      id={id}
      props={props}
      style={style}
      children={children}
      onClick={onClick}
    />
  );
}

export function _Button({ id, props, style, childrenRenderer }: any) {
  const { plugin } = usePluginContext();
  const onClick = !props.onClick
    ? undefined
    : (_event) => {
        plugin.pushClickNotification(id);
      };

  return (
    <__Button
      id={id}
      props={props}
      style={style}
      childrenRenderer={childrenRenderer}
      onClick={onClick}
    />
  );
}

export function __Button({
  id,
  onClick,
  props,
  style,
  children,
  childrenRenderer,
}: any) {
  const classes = useStyles();
  return (
    <MuiButton
      disableElevation
      variant="contained"
      className={classes.button}
      disableRipple
      style={style}
      onClick={onClick}
    >
      {children ??
        childrenRenderer.map((c: Element) => (
          <ViewRenderer key={c.id} element={c} />
        ))}
    </MuiButton>
  );
}

function Raw({ text }: any) {
  return <>{text}</>;
}
