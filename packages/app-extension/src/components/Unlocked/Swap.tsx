import { useEffect, useState } from "react";
import {
  List,
  ListItem,
  InputAdornment,
  Button,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Close, ExpandMore, SwapVert } from "@mui/icons-material";
import {
  useBlockchainTokenAccount,
  useSplTokenRegistry,
  useSwapTokenList,
  useSwapContext,
  SwapProvider,
} from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { Blockchain } from "@coral-xyz/common";
import {
  TextField,
  TextFieldLabel,
  PrimaryButton,
  DangerButton,
} from "../common";
import { WithHeaderButton } from "./Balances/TokensWidget/Token";
import { BottomCard } from "./Balances/TokensWidget/Send";
import {
  CloseButton,
  WithMiniDrawer,
  WithDrawer,
  useDrawerContext,
} from "../Layout/Drawer";
import { WithNav } from "../Layout/Nav";
import type { Token } from "../common/TokenTable";
import { SearchableTokenTable } from "../common/TokenTable";

const useStyles = styles((theme) => ({
  container: {
    backgroundColor: theme.custom.colors.background,
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  topHalf: {
    paddingTop: "24px",
    paddingBottom: "38px",
    marginLeft: "16px",
    marginRight: "16px",
  },
  bottomHalfWrapper: {
    background: theme.custom.colors.swapGradient,
    flex: 1,
    paddingBottom: "12px",
    paddingTop: "38px",
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
    position: "relative",
  },
  bottomHalf: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    margin: "0 16px 16px 16px",
    height: "100%",
  },
  fromFieldRoot: {
    marginTop: 0,
    marginBottom: 0,
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        border: `solid 1pt ${theme.custom.colors.border}`,
      },
      "&:hover fieldset": {
        border: `solid 2pt ${theme.custom.colors.primaryButton}`,
      },
    },
  },
  receiveFieldRoot: {
    marginTop: 0,
    marginBottom: 0,
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        border: `solid 1pt ${theme.custom.colors.border}`,
        // Override disable and hover styles
        borderColor: `${theme.custom.colors.border} !important`,
      },
    },
    "& .MuiInputBase-input.Mui-disabled": {
      // Override disabled font color
      WebkitTextFillColor: `${theme.custom.colors.secondary} !important`,
    },
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
  searchField: {
    marginLeft: "12px",
    marginRight: "12px",
    marginTop: "16px",
    marginBottom: "16px",
    width: "inherit",
    display: "flex",
    "& .MuiOutlinedInput-root": {
      height: "48px !important",
      "& fieldset": {
        border: `solid 1pt ${theme.custom.colors.border}`,
      },
      "&:hover fieldset": {
        border: `solid 2pt ${theme.custom.colors.primaryButton}`,
      },
    },
  },
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
  const theme = useCustomTheme();
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
      <div className={classes.bottomHalfWrapper}>
        <div className={classes.bottomHalf}>
          <div>
            <TextFieldLabel leftLabel={"You Receive"} />
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
                style: {
                  textFill: `${theme.custom.colors.fontColor} !important`,
                },
              }}
            />
          </div>
          <div>
            {cancel && <DangerButton onClick={onCancel} />}
            <PrimaryButton
              label="Review"
              onClick={() => setOpenDrawer()}
              disabled={!fromAmount || !toAmount}
            />
          </div>
        </div>
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

function TokenSelectorButton({ mint, isFrom }: any) {
  const classes = useStyles();
  const tokenRegistry = useSplTokenRegistry();
  const tokenInfo = tokenRegistry.get(mint); // todo handle null case
  const symbol = tokenInfo ? tokenInfo.symbol : "-";
  const logoUri = tokenInfo ? tokenInfo.logoURI : "-";
  const { setFromMint, setToMint } = useSwapContext();

  const onSelectToken = (blockchain: Blockchain, token: Token) => {
    if (isFrom) {
      setFromMint(token.mint);
    } else {
      setToMint(token.mint);
    }
    close();
  };

  const tokenFilter = isFrom
    ? (token: Token) => token.nativeBalance !== 0
    : () => true;

  return (
    <>
      <InputAdornment position="end">
        <WithHeaderButton
          labelComponent={
            <>
              <img className={classes.tokenLogo} src={logoUri} />
              <Typography className={classes.tokenSelectorButtonLabel}>
                {symbol}
              </Typography>
              <ExpandMore className={classes.expandMore} />
            </>
          }
          routes={[
            {
              title: "Select token",
              name: "select-token",
              component: (props: any) => <SearchableTokenTable {...props} />,
              props: {
                onClickRow: onSelectToken,
                customFilter: tokenFilter,
              },
            },
          ]}
          style={{
            backgroundColor: "transparent",
          }}
        />
      </InputAdornment>
    </>
  );
}
