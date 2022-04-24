import { useState } from "react";
import {
  makeStyles,
  List,
  ListItem,
  InputAdornment,
  Button,
  Typography,
  IconButton,
  CircularProgress,
} from "@material-ui/core";
import { Close, ExpandMore, SwapVert } from "@material-ui/icons";
import {
  useBlockchainTokenAccount,
  useSplTokenRegistry,
  useSwapTokenList,
  useSwapContext,
  SwapProvider,
} from "@200ms/recoil";
import { TextField, TextFieldLabel } from "../common";
import { BottomCard, NetworkFeeInfo } from "./Balances/Send";
import { WithMiniDrawer, WithDrawer } from "../Layout/Drawer";

const useStyles = makeStyles((theme: any) => ({
  container: {
    backgroundColor: theme.custom.colors.background,
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  topHalf: {
    paddingTop: "24px",
    paddingBottom: "38px",
  },
  bottomHalf: {},
  bottomHalfContent: {
    background: theme.custom.colors.swapGradient,
    flex: 1,
    paddingBottom: "12px",
    paddingTop: "38px",
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
    position: "relative",
  },
  bottomHalfFooter: {
    display: "flex",
    justifyContent: "space-between",
    paddingLeft: "12px",
    paddingRight: "12px",
  },
  reviewBtn: {
    marginTop: "16px",
    marginBottom: "16px",
    borderRadius: "12px",
    backgroundColor: theme.custom.colors.nav,
    flex: 1,
    height: "48px",
  },
  reviewBtnLabel: {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 500,
    textTransform: "none",
    color: theme.custom.colors.fontColor,
  },
  fromFieldRoot: {
    marginTop: 0,
    marginBottom: 0,
  },
  receiveFieldRoot: {
    marginTop: 0,
    marginBottom: 0,
  },
  swapTokensContainer: {
    backgroundColor: theme.custom.colors.background,
    width: "44px",
    height: "44px",
    zIndex: 2,
    position: "fixed",
    top: "175px",
    left: "24px",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    borderRadius: "22px",
  },
  closeDrawerContainer: {
    backgroundColor: theme.custom.colors.background,
    width: "44px",
    height: "44px",
    position: "fixed",
    top: "222px",
    left: "24px",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    borderRadius: "22px",
  },
  swapTokensButton: {
    backgroundColor: theme.custom.colors.nav,
    width: "38px",
    height: "38px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  swapIcon: {
    color: theme.custom.colors.secondary,
  },
  loadingContainer: {
    backgroundColor: theme.custom.colors.nav,
    width: "38px",
    height: "38px",
    borderRadius: "19px",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    marginLeft: "auto",
    marginRight: "auto",
  },
  circularProgress: {
    color: theme.custom.colors.secondary,
    width: "16px",
    height: "16px",
    marginLeft: "auto",
    marginRight: "auto",
    display: "block",
  },
  tokenSelectorButton: {
    display: "flex",
  },
  tokenSelectorButtonLabel: {
    color: theme.custom.colors.fontColor,
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: "24px",
  },
  expandMore: {
    color: theme.custom.colors.secondary,
    fontSize: "18px",
    marginLeft: "6px",
  },
  tokenLogo: {
    marginRight: "8px",
    width: "20px",
    height: "20px",
    borderRadius: "10px",
  },
  tokenList: {
    borderTop: `solid 1pt ${theme.custom.colors.border}`,
    padding: 0,
  },
  tokenListItem: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: `solid 1pt ${theme.custom.colors.border}`,
  },
  tokenListItemName: {
    color: theme.custom.colors.fontColor,
    fontWeight: 500,
  },
  tokenListItemBalance: {
    color: theme.custom.colors.secondary,
    fontWeight: 500,
  },
  tokenListSearchRoot: {},
  tokenListContainer: {
    flex: 1,
    backgroundColor: theme.custom.colors.nav,
  },
  paperAnchorBottom: {
    height: "402px",
  },
  confirmationTitle: {
    color: theme.custom.colors.secondary,
    lineHeight: "16px",
    fontWeight: 500,
    fontSize: "12px",
    marginTop: "38px",
    textAlign: "center",
  },
  confirmationTitleAmount: {
    color: theme.custom.colors.fontColor,
    lineHeight: "24px",
    fontWeight: 500,
    fontSize: "18px",
    marginTop: "5px",
    textAlign: "center",
    marginBottom: "41px",
  },
  confirmationTitleRow: {
    marginBottom: "12px",
    display: "flex",
    justifyContent: "space-between",
    marginLeft: "24px",
    marginRight: "24px",
  },
  confirmationTitleLeft: {
    color: theme.custom.colors.secondary,
    lineHeight: "16px",
    fontSize: "12px",
    fontWeight: 500,
  },
  confirmationTitleRight: {
    color: theme.custom.colors.fontColor,
    lineHeight: "16px",
    fontSize: "12px",
    fontWeight: 500,
  },
}));

export function Swap() {
  return <SwapInner blockchain={"solana"} />;
}

function SwapInner({ blockchain, cancel, onCancel }: any) {
  return (
    <SwapProvider>
      <_Swap blockchain={blockchain} cancel={cancel} onCancel={onCancel} />
    </SwapProvider>
  );
}

function _Swap({ blockchain, cancel, onCancel }: any) {
  const classes = useStyles();
  const {
    fromAmount,
    setFromAmount,
    toAmount,
    fromToken,
    fromMint,
    toMint,
    swapToFromMints,
    executeSwap,
  } = useSwapContext();
  const fromTokenData = useBlockchainTokenAccount(blockchain, fromToken);
  const [_openDrawer, _setOpenDrawer] = useState(false);
  const [isConfirmingSwap, setIsConfirmingSwap] = useState(false);

  const setOpenDrawer = () => {
    _setOpenDrawer(true);
  };
  const onConfirm = async () => {
    setIsConfirmingSwap(true);
    const result = await executeSwap();
    setIsConfirmingSwap(false);
    _setOpenDrawer(false);
    console.log("result", result);
    // todo: do something with the swap here.
  };

  const onSwapButtonClick = () => {
    if (_openDrawer) {
      _setOpenDrawer(false);
    } else {
      swapToFromMints();
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.topHalf}>
        <SwapTokensButton
          isLoading={isConfirmingSwap}
          onClick={onSwapButtonClick}
          isSwap={!_openDrawer}
        />
        <TextFieldLabel
          leftLabel={"You Pay"}
          rightLabel={
            fromTokenData ? fromTokenData.nativeBalance.toString() : "-"
          }
        />
        <TextField
          endAdornment={
            <TokenSelectorButton
              blockchain={blockchain}
              isFrom={true}
              mint={fromMint}
            />
          }
          rootClass={classes.fromFieldRoot}
          type={"number"}
          value={fromAmount}
          setValue={setFromAmount}
        />
      </div>
      <div className={classes.bottomHalfContent}>
        <TextFieldLabel leftLabel={"You Receive"} rightLabel={""} />
        <TextField
          endAdornment={
            <TokenSelectorButton
              blockchain={blockchain}
              mint={toMint}
              isFrom={false}
            />
          }
          rootClass={classes.receiveFieldRoot}
          type={"number"}
          value={toAmount ?? 0}
          disabled={true}
          inputProps={{
            "&:hover": {
              cursor: "no-drop",
            },
          }}
        />
        <div style={{ marginTop: "16px" }}>
          <NetworkFeeInfo />
        </div>
      </div>
      <div className={classes.bottomHalfFooter}>
        {cancel && <CancelButton onCancel={onCancel} />}
        <ReviewButton onClick={() => setOpenDrawer()} />
      </div>
      <WithMiniDrawer
        openDrawer={_openDrawer}
        setOpenDrawer={_setOpenDrawer}
        paperAnchorBottom={classes.paperAnchorBottom}
      >
        <SwapConfirmation onConfirm={onConfirm} />
      </WithMiniDrawer>
    </div>
  );
}

function SwapConfirmation({ onConfirm }: any) {
  const classes = useStyles();
  const { fromAmount, toAmount, fromMint, toMint } = useSwapContext();
  const tokenRegistry = useSplTokenRegistry();
  const fromMintInfo = tokenRegistry.get(fromMint)!;
  const toMintInfo = tokenRegistry.get(toMint)!;
  const rate = toAmount! / fromAmount;
  const rows = [
    ["You Pay", `${fromAmount} ${fromMintInfo.symbol}`],
    ["Rate", `1 ${fromMintInfo.symbol} = ${rate} ${toMintInfo.symbol}`],
    ["Network", "Solana"],
    ["Estimated Fees", "-"], // todo
    ["Slippage", "1%"], // todo
  ];
  return (
    <BottomCard onButtonClick={onConfirm} buttonLabel={"Confirm"}>
      <Typography className={classes.confirmationTitle}>You Receive</Typography>
      <Typography className={classes.confirmationTitleAmount}>
        {toAmount} {toMintInfo?.symbol}
      </Typography>
      <div>
        {rows.map((r) => {
          return (
            <div className={classes.confirmationTitleRow}>
              <Typography className={classes.confirmationTitleLeft}>
                {r[0]}
              </Typography>
              <Typography className={classes.confirmationTitleRight}>
                {r[1]}
              </Typography>
            </div>
          );
        })}
      </div>
    </BottomCard>
  );
}

function CancelButton({ onCancel }: any) {
  const classes = useStyles();
  return (
    <Button
      onClick={onCancel}
      disableRipple
      disableElevation
      className={classes.reviewBtn}
      style={{ marginRight: "8px" }}
    >
      <Typography className={classes.reviewBtnLabel}>Cancel</Typography>
    </Button>
  );
}

function ReviewButton({ onClick }: any) {
  const classes = useStyles();
  return (
    <Button
      disableRipple
      disableElevation
      className={classes.reviewBtn}
      onClick={onClick}
    >
      <Typography className={classes.reviewBtnLabel}>Review Swap</Typography>
    </Button>
  );
}

// Hack: We combine the swap and close button into one so that we can position
// it correctly without the drawer cutting off the top.
function SwapTokensButton({ onClick, isSwap, isLoading }: any) {
  const classes = useStyles();
  return (
    <div className={classes.swapTokensContainer}>
      {isLoading ? (
        <div className={classes.loadingContainer}>
          <CircularProgress size={16} className={classes.circularProgress} />
        </div>
      ) : (
        <IconButton
          disableRipple
          className={classes.swapTokensButton}
          onClick={onClick}
        >
          {isSwap ? (
            <SwapVert className={classes.swapIcon} />
          ) : (
            <Close className={classes.swapIcon} />
          )}
        </IconButton>
      )}
    </div>
  );
}

function TokenSelectorButton({ mint, isFrom, blockchain }: any) {
  const [openDrawer, setOpenDrawer] = useState(false);
  const classes = useStyles();
  const tokenRegistry = useSplTokenRegistry();
  const tokenInfo = tokenRegistry.get(mint); // todo handle null case
  const symbol = tokenInfo ? tokenInfo.symbol : "-";
  const logoUri = tokenInfo ? tokenInfo.logoURI : "-";
  return (
    <>
      <InputAdornment position="end">
        <Button
          disableRipple
          className={classes.tokenSelectorButton}
          onClick={() => setOpenDrawer(true)}
        >
          <img className={classes.tokenLogo} src={logoUri} />
          <Typography className={classes.tokenSelectorButtonLabel}>
            {symbol}
          </Typography>
          <ExpandMore className={classes.expandMore} />
        </Button>
      </InputAdornment>
      <WithDrawer
        title={"Tokens"}
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
      >
        <TokenList
          mint={mint}
          blockchain={blockchain}
          isFrom={isFrom}
          close={() => setOpenDrawer(false)}
        />
      </WithDrawer>
    </>
  );
}

function TokenList({ mint, isFrom, blockchain, close }: any) {
  const [search, setSearch] = useState("");
  const { setFromMint, setToMint } = useSwapContext();
  const classes = useStyles();
  const tokenAccountsSorted = useSwapTokenList(mint, isFrom);

  const didSelect = (token: any) => {
    if (isFrom) {
      setFromMint(token.mint);
    } else {
      setToMint(token.mint);
    }
    close();
  };

  let tokens = tokenAccountsSorted;
  if (isFrom) {
    tokens = tokenAccountsSorted.filter((t: any) => t.nativeBalance > 0);
  }

  const searchLower = search.toLowerCase();
  tokens = tokens.filter(
    (t: any) =>
      t.name &&
      (t.name.toLowerCase().startsWith(searchLower) ||
        t.ticker.toLowerCase().startsWith(searchLower))
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <TextField
        placeholder={"Search name"}
        rootClass={classes.tokenListSearchRoot}
        value={search}
        setValue={setSearch}
      />
      <div className={classes.tokenListContainer}>
        <List className={classes.tokenList}>
          {tokens.map((t: any) => (
            <TokenListItem key={t.address} onClick={didSelect} token={t} />
          ))}
        </List>
      </div>
    </div>
  );
}

function TokenListItem({ token, onClick }: any) {
  const classes = useStyles();
  return (
    <ListItem
      button
      className={classes.tokenListItem}
      onClick={() => onClick(token)}
    >
      <div style={{ display: "flex " }}>
        <img
          src={token.logo}
          style={{ width: "30px", height: "30px", marginRight: "8px" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <Typography className={classes.tokenListItemName}>
            {token.name}
          </Typography>
        </div>
      </div>
      <div>
        {token.nativeBalance && (
          <Typography className={classes.tokenListItemBalance}>
            {token.nativeBalance.toLocaleString()} {token.ticker}
          </Typography>
        )}
      </div>
    </ListItem>
  );
}
