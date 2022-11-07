import React, { LegacyRef, useEffect, useRef, useState } from "react";
import type { Element } from "react-xnft";
import { NodeKind } from "react-xnft";
import { AnimatePresence, motion } from "framer-motion";
import { formatUSD, proxyImageUrl } from "@coral-xyz/common";
import { styles } from "@coral-xyz/themes";
import {
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  Typography,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { ViewRenderer } from "./ViewRenderer";
import { ScrollbarNew } from "./components/Scrollbar";
import { useDefaultClasses } from "./theme/defaults";

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
  loadingIndicator: {
    color:
      "linear-gradient(113.94deg, #3EECB8 15.93%, #A372FE 58.23%, #FE7D4A 98.98%)",
  },
  circle: {
    stroke: "url(#linearColors)",
  },
}));

export function Component({ viewData }) {
  const { id, props, kind, style: viewDataStyle } = viewData;
  const style = viewDataStyle || props?.style || {};

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
    case NodeKind.Audio:
      return <Audio props={props} id={id} />;
    case NodeKind.Video:
      return <Video props={props} id={id} />;
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
    { ...props, className: props?.tw + " " + props.className },
    children.map((c) => <ViewRenderer key={c.id} element={c} />)
  );
  return el;
}

function Svg({ props, children }: any) {
  return (
    <svg
      className={props?.tw}
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
  const [id, _setId] = useState(randomString());
  const ref = useRef<any>();

  useEffect(() => {
    if (!isValidSecureUrl(props.src)) {
      return () => {};
    }
    if (!ref.current || !xnftProp) {
      return () => {};
    }
    // @ts-ignore
    window.xnft.addIframe(ref.current, props.src, id);
    return () => {
      // @ts-ignore
      window.xnft.removeIframe(id);
    };
  }, [props.src, ref, xnftProp]);
  return isValidSecureUrl(props.src) ? (
    <iframe
      name={id}
      ref={ref}
      sandbox="allow-same-origin allow-scripts allowfullscreen  allow-fullscreen"
      allow="fullscreen"
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
      props={{}}
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
    <div style={style} onClick={props.onClick} className={props?.tw}>
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
  const defaultClasses = useDefaultClasses();
  return (
    <p
      style={style}
      className={defaultClasses[NodeKind.Text] + " " + props?.tw}
    >
      {children.map((c: Element) => (
        <ViewRenderer key={c.id} element={c} />
      ))}
    </p>
  );
}

function _TextField({ id, props, children, style }: any) {
  if (props.multiline) {
    return (
      <TextArea
        props={props}
        placeholder={props.placeholder}
        value={props.value}
        maxRows={props.numberOfLines}
        minRows={props.numberOfLines}
        onChange={props.onChange}
        style={style}
      />
    );
  }
  return (
    <TextField
      props={props}
      placeholder={props.placeholder}
      value={props.value}
      onChange={props.onChange}
      children={children}
      style={style}
    />
  );
}

export function TextArea({
  maxRows,
  minRows,
  value,
  onChange,
  placeholder,
  props,
  style,
}: any) {
  const defaultClasses = useDefaultClasses();
  return (
    <textarea
      rows={minRows}
      style={style}
      className={defaultClasses[NodeKind.TextField] + " " + (props?.tw || "")}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
}

export function TextField({
  placeholder,
  type,
  value,
  onChange,
  style,
  props,
}: any) {
  const defaultClasses = useDefaultClasses();
  return (
    <input
      type={type}
      style={style}
      className={defaultClasses[NodeKind.TextField] + " " + (props?.tw || "")}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      p
    />
  );
}

function Image({ id, props, style }: any) {
  return (
    <ProxyImage
      className={props?.tw}
      src={props.src}
      style={style}
      onClick={props.onClick}
    />
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
  const defaultClasses = useDefaultClasses();
  return (
    <button
      className={defaultClasses[NodeKind.Button] + " " + (props?.tw || "")}
      style={{
        ...style,
      }}
      onClick={onClick}
    >
      {children ??
        childrenRenderer.map((c: Element) => (
          <ViewRenderer key={c.id} element={c} />
        ))}
    </button>
  );
}

function Video({ id, props }) {
  const ref = useRef<any>();

  useEffect(() => {
    if (props.stream && ref && ref.current) {
      ref.current.srcObject = props.stream;
      if (!props.muted) {
        ref.current.play();
      }
    }
  }, [props.stream, ref]);

  useEffect(() => {
    if (ref && ref.current) {
      ref.current.volume = props.volume;
      ref.current.muted = props.muted;
    }
  }, [props.muted, props.volume, ref]);

  if (props.src) {
    return (
      <video
        className={props?.tw || ""}
        controls={props.controls}
        ref={ref}
        style={props.style}
        autoPlay={props.autoplay}
        muted={props.muted}
        src={props.src}
      />
    );
  }
  return (
    <video
      className={props?.tw || ""}
      controls={props.controls}
      ref={ref}
      style={props.style}
      autoPlay={props.autoplay}
      muted={props.muted}
    />
  );
}

function Audio({ id, props }) {
  const ref = useRef<any>();

  useEffect(() => {
    if (props.stream && ref && ref.current) {
      ref.current.srcObject = props.stream;
      if (!props.muted) {
        ref.current.play();
      }
    }
  }, [props.stream, ref]);

  useEffect(() => {
    if (ref && ref.current) {
      ref.current.volume = props.volume;
      ref.current.muted = props.muted;
    }
  }, [props.muted, props.volume, ref]);

  if (props.src) {
    return (
      <audio
        controls={props.controls}
        ref={ref}
        style={props.style}
        src={props.src}
        autoPlay={props.autoplay}
        muted={props.muted}
      />
    );
  }
  return (
    <audio
      ref={ref}
      controls={props.controls}
      style={props.style}
      autoPlay={props.autoplay}
      muted={props.muted}
    />
  );
}

function Loading({ id, props, style }: any) {
  const classes = useStyles();
  style = {
    ...style,
  };
  return (
    <>
      <svg style={{ position: "fixed" }}>
        <linearGradient id="linearColors" x1="0" y1="0" x2="1" y2="1">
          <stop offset="15.93%" stopColor="#3EECB8" />
          <stop offset="58.23%" stopColor="#A372FE" />
          <stop offset="98.98%" stopColor="#FE7D4A" />
        </linearGradient>
      </svg>
      <CircularProgress
        className={classes.loadingIndicator}
        style={style}
        thickness={6}
        classes={{ circle: classes.circle }}
      />
      ;
    </>
  );
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
  return (
    <>
      <ScrollbarNew {...props}>{props.children}</ScrollbarNew>
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

function randomString() {
  return Math.floor(Math.random() * 10000000) + "";
}
