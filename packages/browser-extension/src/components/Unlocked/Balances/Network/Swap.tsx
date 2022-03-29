import { useState } from "react";
import {
  makeStyles,
  List,
  ListItem,
  InputAdornment,
  Button,
  Typography,
  IconButton,
} from "@material-ui/core";
import { ExpandMore, SwapVert } from "@material-ui/icons";
import { TextField, TextFieldLabel } from "../../../common";
import { NetworkFeeInfo } from "../Send";
import { SwapProvider, useSwapContext } from "../../../../context/Swap";
import { useBlockchainTokenAccount } from "../../../../hooks/useBlockchainBalances";
import { useSplTokenRegistry } from "../../../../hooks/useSplTokenRegistry";
import { WithDrawer } from "../../../../components/Layout/Drawer";
import { useBlockchainTokensSorted } from "../../../../hooks/useBlockchainBalances";

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
    position: "absolute",
    top: "-24px",
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
}));

export function Swap({ blockchain, cancel, onCancel }: any) {
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
    setToAmount,
    fromToken,
    toToken,
    fromMint,
    toMint,
    swapToFromMints,
  } = useSwapContext();
  const fromTokenData = useBlockchainTokenAccount(blockchain, fromToken);
  return (
    <div className={classes.container}>
      <div className={classes.topHalf}>
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
        <SwapTokensButton onClick={swapToFromMints} />
        <TextFieldLabel leftLabel={"You Receive"} rightLabel={""} />
        <TextField
          endAdornment={
            <TokenSelectorButton blockchain={blockchain} mint={toMint} />
          }
          rootClass={classes.receiveFieldRoot}
          type={"number"}
          value={toAmount}
          setValue={setToAmount}
        />
        <div style={{ marginTop: "16px" }}>
          <NetworkFeeInfo />
        </div>
      </div>
      <div className={classes.bottomHalfFooter}>
        {cancel && <CancelButton onCancel={onCancel} />}
        <ReviewButton />
      </div>
    </div>
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

function ReviewButton() {
  const classes = useStyles();
  return (
    <Button disableRipple disableElevation className={classes.reviewBtn}>
      <Typography className={classes.reviewBtnLabel}>Review Swap</Typography>
    </Button>
  );
}

function SwapTokensButton({ onClick }: any) {
  const classes = useStyles();
  return (
    <div className={classes.swapTokensContainer}>
      <IconButton
        disableRipple
        className={classes.swapTokensButton}
        onClick={onClick}
      >
        <SwapVert className={classes.swapIcon} />
      </IconButton>
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
      <WithDrawer
        title={"Tokens"}
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
      >
        <TokenList
          blockchain={blockchain}
          isFrom={isFrom}
          close={() => setOpenDrawer(false)}
        />
      </WithDrawer>
    </InputAdornment>
  );
}

function TokenList({ isFrom, blockchain, close }: any) {
  const [search, setSearch] = useState("");
  const { setFromMint, setToMint } = useSwapContext();
  const classes = useStyles();
  const tokenRegistry = useSplTokenRegistry();
  const tokenAccountsSorted = useBlockchainTokensSorted(blockchain);
  const didSelect = (token: any) => {
    if (isFrom) {
      setFromMint(token.mint);
    } else {
      setToMint(token.mint);
    }
    close();
  };

  let tokens;
  if (isFrom) {
    tokens = tokenAccountsSorted.filter((t: any) => t.nativeBalance > 0);
  } else {
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
        <Typography className={classes.tokenListItemBalance}>
          {token.nativeBalance.toLocaleString()} {token.ticker}
        </Typography>
      </div>
    </ListItem>
  );
}
