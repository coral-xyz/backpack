import React, { useEffect, useRef, useState } from "react";
import { Scrollbars } from "react-custom-scrollbars";
import type { Element } from "react-xnft";
import { motion, AnimatePresence } from "framer-motion";
import { NodeKind } from "react-xnft";
import { formatUSD, proxyImageUrl } from "@coral-xyz/common";
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
import { TextareaAutosize as MuiTextArea } from "@mui/base";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { ViewRenderer } from "./ViewRenderer";
import { useDomContext } from "./Context";

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
  textFieldInput: {
    fontWeight: 500,
    borderRadius: "12px",
    fontSize: "16px",
    lineHeight: "24px",
  },
  textAreaInput: {
    fontWeight: 500,
    borderRadius: "12px",
    fontSize: "16px",
    lineHeight: "24px",
    padding: "16.5px 14px",
    font: "inherit",
    background: theme.custom.colors.textBackground,
    border: `2pt solid ${theme.custom.colors.textBackground}`,
    "&:hover": {
      border: `2pt solid ${theme.custom.colors.primaryButton}`,
    },
    "&:focus": {
      border: `2pt solid ${theme.custom.colors.primaryButton}`,
      outline: "none",
    },
  },
  textFieldInputColorEmpty: {
    color: theme.custom.colors.textPlaceholder,
  },
  textFieldInputColor: {
    color: theme.custom.colors.fontColor2,
  },
  textFieldRoot: {
    "& .MuiOutlinedInput-root": {
      background: theme.custom.colors.textBackground,
      borderRadius: "12px",
      "& fieldset": {
        border: `${theme.custom.colors.borderFull}`,
      },
      "&:hover fieldset": {
        border: `solid 2pt ${theme.custom.colors.primaryButton}`,
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
      return (
        <Image
          id={id}
          props={props}
          style={style}
          children={viewData.children}
        />
      );
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
    case NodeKind.Custom:
      return (
        <Custom
          children={viewData.children}
          component={props.component}
          props={props}
        />
      );
    case NodeKind.Path:
      return <Path props={props} />;
    case "raw":
      return <Raw text={viewData.text} />;
    default:
      console.error(viewData);
      throw new Error("unexpected view data");
  }
}

function Custom({ children, component, props }) {
  const el = React.createElement(
    component,
    props,
    children.map((c) => <ViewRenderer key={c.id} element={c} />)
  );
  return el;
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
      stroke={props.stroke}
      style={props.style}
    />
  );
}

function Circle({ props }: any) {
  return (
    <circle
      cx={props.cx}
      cy={props.cy}
      r={props.r}
      fill={props.fill}
      stroke={props.stroke}
      stroke-width={props.strokeWidth}
      pathLength={props.pathLength}
      stroke-dasharray={props.strokeDasharray}
      stroke-dashoffset={props.strokeDashoffset}
    />
  );
}

function Iframe({ props, style }: any) {
  const [xnftProp, setXnftProp] = useState(false);
  const ref = useRef<any>();

  useEffect(() => {
    if (!isValidSecureUrl(props.src)) {
      return () => {};
    }
    if (!ref.current || !xnftProp) {
      return () => {};
    }
    // @ts-ignore
    window.xnft.addIframe(ref.current);
    return () => {
      // @ts-ignore
      window.xnft.removeIframe(ref.current);
    };
  }, [props.src, ref, xnftProp]);
  return isValidSecureUrl(props.src) ? (
    <iframe
      ref={ref}
      sandbox="allow-same-origin allow-scripts"
      src={props.src}
      height={props.height}
      width={props.width}
      style={{
        position: "absolute",
        border: "none",
        width: "100%",
        height: "100%",
        maxWidth: "100%",
        maxHeight: "100%",
        overflowY: "hidden",
        ...style,
      }}
      onLoad={({ currentTarget }) => {
        if (props.xnft) {
          // plugin.setActiveIframe(currentTarget, props.src);
          setXnftProp(true);
        }
      }}
    ></iframe>
  ) : null;
}

const isValidSecureUrl = (url: string): boolean => {
  try {
    const { protocol, hostname } = new URL(url);
    if (["localhost", "0.0.0.0", "127.0.0.1"].includes(hostname)) {
      // allow http:// or https:// for localhost urls during development
      return ["http:", "https:"].includes(protocol);
    } else {
      // only allow https:// for external urls
      return protocol === "https:";
    }
  } catch (e) {
    return false;
  }
};

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
  return (
    <__BalancesTableRow
      id={id}
      props={props}
      style={style}
      children={children}
      childrenRenderer={childrenRenderer}
      onClick={props.onClick}
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
          <ProxyImage
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
  return (
    <div style={style} onClick={props.onClick}>
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
  if (props.multiline) {
    return (
      <TextArea
        placeholder={props.placeholder}
        value={props.value}
        maxRows={props.numberOfLines}
        minRows={props.numberOfLines}
        setValue={props.onChange}
        children={children}
        style={style}
      />
    );
  }
  return (
    <TextField
      placeholder={props.placeholder}
      value={props.value}
      setValue={props.onChange}
      children={children}
      style={style}
    />
  );
}

export function TextArea({
  maxRows,
  minRows,
  value,
  setValue,
  placeholder,
  style,
  className = "",
}: any) {
  const classes = useStyles();
  className =
    className +
    `${classes.textAreaInput} ${
      value ? classes.textFieldInputColor : classes.textFieldInputColorEmpty
    }
    `;
  return (
    <MuiTextArea
      maxRows={maxRows}
      minRows={minRows}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        ...style,
      }}
      value={value}
      className={className}
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
      className: `${classes.textFieldInput} ${
        value ? classes.textFieldInputColor : classes.textFieldInputColorEmpty
      }`,
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

function Image({ id, props, style }: any) {
  return <ProxyImage src={props.src} style={style} onClick={props.onClick} />;
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
  return (
    <__Button
      id={id}
      props={props}
      style={style}
      childrenRenderer={childrenRenderer}
      onClick={props.onClick}
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
