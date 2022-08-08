import React, { useState } from "react";
import { Scrollbars } from "react-custom-scrollbars";
import type { Element } from "react-xnft";
import { motion, AnimatePresence } from "framer-motion";
import { NodeKind } from "react-xnft";
import { formatUSD } from "@coral-xyz/common";
import { useCustomTheme, styles } from "@coral-xyz/themes";
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
  CircularProgress,
} from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { usePluginContext } from "./Context";
import { ViewRenderer } from "./ViewRenderer";

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
    boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.15)",
  },
  cardHeaderAvatar: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },
  cardHeaderRoot: {
    backgroundColor: theme.custom.colors.nav,
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
  textFieldInput: {
    fontWeight: 500,
    borderRadius: "12px",
    color: theme.custom.colors.secondary,
    fontSize: "16px",
    lineHeight: "24px",
  },
  textFieldRoot: {
    "& .MuiOutlinedInput-root": {
      backgroundColor: theme.custom.colors.background,
      borderRadius: "12px",
      "& fieldset": {
        border: "none",
      },
      "&.Mui-focused fieldset": {
        border: `solid 2pt ${theme.custom.colors.primaryButton} !important`,
        borderColor: `${theme.custom.colors.primaryButton} !important`,
      },
    },
  },
  textRootError: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        border: `solid 2pt ${theme.custom.colors.negative} !important`,
      },
      "&.Mui-focused fieldset": {
        border: `solid 2pt ${theme.custom.colors.negative} !important`,
        borderColor: `${theme.custom.colors.negative} !important`,
      },
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
    case NodeKind.Loading:
      return <Loading id={id} props={props} style={style} />;
    case NodeKind.ScrollBar:
      return (
        <ScrollBar
          id={id}
          props={props}
          style={style}
          children={viewData.children}
        />
      );
    case NodeKind.Svg:
      return <Svg props={props} children={viewData.children} />;
    case NodeKind.Path:
      return <Path props={props} />;
    case NodeKind.Circle:
      return <Circle props={props} />;
    case NodeKind.NavAnimation:
      return <NavAnimation props={props} children={viewData.children} />;
    case NodeKind.Iframe:
      return <Iframe props={props} style={style} />;
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

function Svg({ props, children }: any) {
  return (
    <svg
      width={props.width}
      height={props.height}
      viewBox={props.viewBox}
      fill={props.fill}
    >
      {children &&
        children.map((c: Element) => <ViewRenderer key={c.id} element={c} />)}
    </svg>
  );
}

function Path({ props }: any) {
  return (
    <path
      d={props.d}
      fillRule={props.fillRule}
      clipRule={props.clipRule}
      fill={props.fill}
    />
  );
}

function Circle({ props }: any) {
  return <circle cx={props.cx} cy={props.cy} r={props.r} fill={props.fill} />;
}

function Iframe({ props, style }: any) {
  return (
    <iframe
      src={props.src}
      height={props.height}
      width={props.width}
      style={{
        border: "none",
        ...style,
      }}
    ></iframe>
  );
}

function NavAnimation({ props, children }: any) {
  return (
    <AnimatePresence initial={false}>
      <WithMotion id={props.routeName} navAction={props.navAction}>
        {children &&
          children.map((c: Element) => <ViewRenderer key={c.id} element={c} />)}
      </WithMotion>
    </AnimatePresence>
  );
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
      <Card className={classes.blockchainCard} elevation={0} style={style}>
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
    <CardContent classes={{ root: classes.cardContentRoot }} style={style}>
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
      style={style}
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
      {!!icon && (
        <ListItemIcon
          className={classes.tokenListItemIcon}
          classes={{ root: classes.tokenListItemIconRoot }}
        >
          <img
            src={icon}
            className={classes.logoIcon}
            onError={(event) => (event.currentTarget.style.display = "none")}
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
      children={children}
      style={style}
    />
  );
}

export function TextField({
  placeholder,
  type,
  value,
  setValue,
  rootClass,
  startAdornment,
  endAdornment,
  isError,
  inputProps,
  disabled,
  autoFocus,
  rows,
  select,
  children,
  style,
}: any) {
  const classes = useStyles();
  inputProps = Object.assign(
    {
      className: classes.textFieldInput,
    },
    inputProps
  );
  return (
    <MuiTextField
      autoFocus={autoFocus}
      multiline={!!rows}
      rows={rows}
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
          classes.textFieldRoot
        } ${rootClass ?? ""}`,
      }}
      InputLabelProps={{
        shrink: false,
        style: {
          borderRadius: "12px",
          border: "none",
        },
      }}
      InputProps={{
        startAdornment,
        endAdornment,
      }}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      select={select}
      children={children}
      style={style}
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
  const theme = useCustomTheme();
  return (
    <MuiButton
      disableElevation
      variant="contained"
      disableRipple
      style={{
        borderRadius: "12px",
        width: "100px",
        height: "40px",
        textTransform: "none",
        backgroundColor: theme.custom.colors.nav,
        ...style,
      }}
      onClick={onClick}
    >
      {children ??
        childrenRenderer.map((c: Element) => (
          <ViewRenderer key={c.id} element={c} />
        ))}
    </MuiButton>
  );
}

function Loading({ id, props, style }: any) {
  const theme = useCustomTheme();
  style = {
    color: theme.custom.colors.activeNavButton,
    ...style,
  };
  return <CircularProgress style={style} thickness={6} />;
}

function ScrollBar({ id, props, style, children }: any) {
  return (
    <ScrollBarImpl>
      {children.map((c: Element) => (
        <ViewRenderer key={c.id} element={c} />
      ))}
    </ScrollBarImpl>
  );
}

export function ScrollBarImpl(props: any) {
  const theme = useCustomTheme();
  return (
    <>
      <Scrollbars
        style={{ width: "100%", height: "100%" }}
        renderTrackHorizontal={(props) => (
          <div {...props} className="track-horizontal" />
        )}
        renderTrackVertical={(props) => (
          <div
            style={{ backgroundColor: theme.custom.colors.scrollbarTrack }}
            {...props}
            className="track-vertical"
          />
        )}
        renderThumbHorizontal={(props) => (
          <div {...props} className="thumb-horizontal" />
        )}
        renderThumbVertical={(props) => (
          <div
            style={{ backgroundColor: theme.custom.colors.scrollbarThumb }}
            {...props}
            className="thumb-vertical"
          />
        )}
        renderView={(props) => <div {...props} className="view" />}
        autoHide
        thumbMinSize={30}
      >
        {props.children}
      </Scrollbars>
      <style>
        {`
          .track-vertical {
            background: ${theme.custom.colors.scrollbarTrack};
          }
          .track-vertical .thumb-vertical {
            background-color: ${theme.custom.colors.scrollbarThumb};
          }
				`}
      </style>
    </>
  );
}

function Raw({ text }: any) {
  return <>{text}</>;
}

export function WithMotion({ children, id, navAction }: any) {
  return (
    <motion.div
      key={id}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
      variants={MOTION_VARIANTS}
      initial={!navAction || navAction === "tab" ? {} : "initial"}
      animate={!navAction || navAction === "tab" ? {} : "animate"}
      exit={!navAction || navAction === "tab" ? {} : "exit"}
    >
      {children}
    </motion.div>
  );
}

export const MOTION_VARIANTS = {
  initial: {
    opacity: 0,
  },
  animate: {
    translateX: 0,
    opacity: 1,
    transition: { delay: 0.09 },
  },
  exit: {
    translateX: window.innerWidth,
    transition: { delay: 0.09, duration: 0.1 },
    opacity: 0,
  },
};
