import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  InputAdornment,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Close, ExpandMore, SwapVert } from "@mui/icons-material";
import { CheckIcon, CrossIcon } from "../common/Icon";
import {
  useSplTokenRegistry,
  useJupiterInputMints,
  useJupiterOutputMints,
  useSwapContext,
  SwapProvider,
} from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { Blockchain, SOL_NATIVE_MINT, WSOL_MINT } from "@coral-xyz/common";
import {
  TextField,
  TextFieldLabel,
  PrimaryButton,
  DangerButton,
} from "../common";
import { WithHeaderButton } from "./Balances/TokensWidget/Token";
import { BottomCard } from "./Balances/TokensWidget/Send";
import { WithMiniDrawer, useDrawerContext } from "../common/Layout/Drawer";
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
    borderTop: `solid 1pt ${theme.custom.colors.border}`,
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
    border: `solid 1pt ${theme.custom.colors.border}`,
    width: "38px",
    height: "38px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  closeConfirmButton: {
    border: "none !important",
    background: theme.custom.colors.nav,
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
  tokenLogoLarge: {
    marginRight: "8px",
    width: "32px",
    height: "32px",
    borderRadius: "10px",
  },
  confirmationTitle: {
    color: theme.custom.colors.secondary,
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: "20px",
    textAlign: "center",
  },
  confirmationAmount: {
    color: theme.custom.colors.fontColor,
    fontSize: "24px",
    fontWeight: 500,
    lineHeight: "32px",
    textAlign: "center",
  },
  swapInfoRow: {
    marginBottom: "8px",
    display: "flex",
    justifyContent: "space-between",
  },
  swapInfoTitleLeft: {
    color: theme.custom.colors.secondary,
    lineHeight: "20px",
    fontSize: "14px",
    fontWeight: 500,
  },
  swapInfoTitleRight: {
    color: theme.custom.colors.fontColor,
    lineHeight: "20px",
    fontSize: "14px",
    fontWeight: 500,
  },
}));

enum SwapState {
  INITIAL,
  CONFIRMATION,
  CONFIRMING,
  CONFIRMED,
  ERROR,
}

export function Swap() {
  return <SwapInner blockchain={Blockchain.SOLANA} />;
}

function SwapInner({ blockchain }: any) {
  return (
    <SwapProvider>
      <_Swap blockchain={blockchain} />
    </SwapProvider>
  );
}

function _Swap({ blockchain }: { blockchain: Blockchain }) {
  const classes = useStyles();
  const { toAmount, swapToFromMints, executeSwap } = useSwapContext();
  const [swapState, setSwapState] = useState(SwapState.INITIAL);

  // Only allow drawer close if not confirming
  const onDrawerClose =
    swapState === SwapState.CONFIRMING
      ? () => null
      : () => setSwapState(SwapState.INITIAL);

  const onConfirm = async () => {
    setSwapState(SwapState.CONFIRMING);
    const result = await executeSwap();
    if (result) {
      setSwapState(SwapState.CONFIRMED);
    } else {
      setSwapState(SwapState.ERROR);
    }
  };

  const onSwapButtonClick = () => {
    if (swapState !== SwapState.INITIAL) {
      setSwapState(SwapState.INITIAL);
    } else {
      swapToFromMints();
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.topHalf}>
        <SwapTokensButton onClick={onSwapButtonClick} />
        <InputTextField />
      </div>
      <div className={classes.bottomHalfWrapper}>
        <div className={classes.bottomHalf}>
          <div>
            <OutputTextField />
            {!!toAmount && toAmount > 0 && (
              <div
                style={{
                  marginTop: "24px",
                  marginLeft: "8px",
                  marginRight: "8px",
                }}
              >
                <SwapInfo />
              </div>
            )}
          </div>
          <ConfirmSwapButton
            blockchain={blockchain}
            onClick={() => setSwapState(SwapState.CONFIRMATION)}
          />
        </div>
      </div>
      <WithMiniDrawer
        openDrawer={swapState !== SwapState.INITIAL}
        backdropProps={{
          style: {
            opacity: 0.8,
            background: "#18181b",
          },
        }}
        modalProps={{ onBackdropClick: onDrawerClose }}
        onClose={onDrawerClose}
      >
        {swapState === SwapState.CONFIRMATION && (
          <SwapConfirmation onConfirm={onConfirm} onClose={onDrawerClose} />
        )}
        {swapState === SwapState.CONFIRMING && <SwapConfirming />}
        {swapState === SwapState.CONFIRMED && <SwapConfirmed />}
        {swapState === SwapState.ERROR && (
          <SwapError
            onCancel={() => {
              setSwapState(SwapState.INITIAL);
            }}
            onRetry={onConfirm}
          />
        )}
      </WithMiniDrawer>
    </div>
  );
}

function InputTextField() {
  const classes = useStyles();
  const { fromAmount, fromMint, setFromAmount } = useSwapContext();
  const tokenAccountsSorted = useJupiterInputMints();
  const balance =
    tokenAccountsSorted.find((t) => t.mint === fromMint)?.nativeBalance || 0;
  const exceedsBalance = fromAmount && fromAmount > balance;

  const _setFromAmount = (amount: number) => {
    if (amount >= 0) {
      setFromAmount(amount);
    }
  };

  return (
    <>
      <TextFieldLabel
        leftLabel={"You Pay"}
        rightLabelComponent={
          <MaxSwapAmount balance={balance} onSetAmount={_setFromAmount} />
        }
      />
      <TextField
        placeholder={"0"}
        endAdornment={<InputTokenSelectorButton />}
        rootClass={classes.fromFieldRoot}
        type={"number"}
        value={fromAmount ?? ""}
        setValue={_setFromAmount}
        isError={exceedsBalance}
      />
    </>
  );
}

function OutputTextField() {
  const classes = useStyles();
  const theme = useCustomTheme();
  const { toAmount, isLoadingRoutes } = useSwapContext();
  return (
    <>
      <TextFieldLabel leftLabel={"You Receive"} />
      <TextField
        placeholder={"0"}
        startAdornment={
          isLoadingRoutes && (
            <CircularProgress
              style={{
                display: "flex",
                color: theme.custom.colors.secondary,
              }}
              size={24}
              thickness={5}
            />
          )
        }
        endAdornment={<OutputTokenSelectorButton />}
        rootClass={classes.receiveFieldRoot}
        type={"number"}
        value={toAmount || ""}
        disabled={true}
        inputProps={{
          style: {
            textFill: `${theme.custom.colors.fontColor} !important`,
          },
        }}
      />
    </>
  );
}

const MaxSwapAmount = ({
  balance,
  onSetAmount,
}: {
  balance: number;
  onSetAmount: (amount: number) => void;
}) => {
  const theme = useCustomTheme();
  return (
    <div
      onClick={() => onSetAmount(balance)}
      style={{
        fontWeight: 500,
        fontSize: "12px",
        lineHeight: "16px",
        color: theme.custom.colors.fontColor,
        cursor: "pointer",
      }}
    >
      <span style={{ color: theme.custom.colors.secondary }}>Max: </span>
      {balance}
    </div>
  );
};

const SwapUnavailableButton = () => {
  return <DangerButton label="Swaps unavailable" disabled={true} />;
};

const InsufficientBalanceButton = () => {
  return <DangerButton label="Insufficient balance" disabled={true} />;
};

const ConfirmSwapButton = ({
  blockchain,
  onClick,
}: {
  blockchain: Blockchain;
  onClick: () => void;
}) => {
  const { toAmount, toMint, fromAmount, fromMint, isJupiterError } =
    useSwapContext();
  const tokenAccountsSorted = useJupiterInputMints();
  const balance =
    tokenAccountsSorted.find((t) => t.mint === fromMint)?.nativeBalance || 0;
  const exceedsBalance = fromAmount && fromAmount > balance;
  if (exceedsBalance) {
    return <InsufficientBalanceButton />;
  } else if (isJupiterError) {
    return <SwapUnavailableButton />;
  }
  let label;
  if (fromMint === SOL_NATIVE_MINT && toMint === WSOL_MINT) {
    label = "Wrap";
  } else if (fromMint === WSOL_MINT && toMint === SOL_NATIVE_MINT) {
    label = "Unwrap";
  } else {
    label = "Review";
  }
  return (
    <PrimaryButton
      label={label}
      onClick={onClick}
      disabled={!fromAmount || !toAmount}
    />
  );
};

//
// Bottom drawer displayed so the user can confirm the swap parameters.
//
function SwapConfirmation({
  onConfirm,
  onClose,
}: {
  onConfirm: () => void;
  onClose: () => void;
}) {
  const classes = useStyles();
  return (
    <BottomCard onButtonClick={onConfirm} buttonLabel={"Confirm"}>
      <CloseButton onClick={onClose} />
      <Typography
        className={classes.confirmationTitle}
        style={{ marginTop: "32px" }}
      >
        You Receive
      </Typography>
      <div style={{ marginTop: "8px", marginBottom: "38px" }}>
        <SwapReceiveAmount />
      </div>
      <div style={{ margin: "24px 24px 68px 24px" }}>
        <SwapInfo compact={false} />
      </div>
    </BottomCard>
  );
}

//
// Bottom card that is displayed while the swap is confirming (i.e. transactions
// are being submitted/confirmed)
//
function SwapConfirming() {
  const classes = useStyles();
  const theme = useCustomTheme();
  return (
    <BottomCard>
      <Typography
        className={classes.confirmationTitle}
        style={{ marginTop: "52px" }}
      >
        Swapping...
      </Typography>
      <div style={{ marginTop: "8px", marginBottom: "16px" }}>
        <SwapReceiveAmount />
      </div>
      <div style={{ textAlign: "center" }}>
        <CircularProgress
          size={48}
          style={{
            color: theme.custom.colors.primaryButton,
            marginBottom: "88px",
          }}
        />
      </div>
    </BottomCard>
  );
}

//
// Bottom card displayed on swap success.
//
function SwapConfirmed() {
  const classes = useStyles();
  const navigate = useNavigate();
  return (
    <BottomCard
      cancelButtonLabel={"View balances"}
      onCancelButtonClick={() => navigate("/balances")}
    >
      <Typography
        className={classes.confirmationTitle}
        style={{ marginTop: "52px" }}
      >
        Swap Confirmed!
      </Typography>
      <div style={{ marginTop: "8px", marginBottom: "16px" }}>
        <SwapReceiveAmount />
      </div>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <CheckIcon />
      </div>
    </BottomCard>
  );
}

//
// Bottom card displayed on swap error.
//
function SwapError({ onRetry, onCancel }: any) {
  const classes = useStyles();
  return (
    <BottomCard
      buttonLabel={"Retry"}
      onButtonClick={onRetry}
      cancelButtonLabel={"Back"}
      onCancelButtonClick={onCancel}
    >
      <Typography
        className={classes.confirmationTitle}
        style={{ marginTop: "40px", marginBottom: "16px" }}
      >
        Error :(
      </Typography>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <CrossIcon />
      </div>
    </BottomCard>
  );
}

//
// Token logo, swap receive amount, and swap currency
//
function SwapReceiveAmount() {
  const classes = useStyles();
  const theme = useCustomTheme();
  const { toAmount, toMintInfo } = useSwapContext();

  const logoUri = toMintInfo ? toMintInfo.logoURI : "-";
  return (
    <div
      className={classes.confirmationAmount}
      style={{ display: "flex", justifyContent: "center" }}
    >
      <img
        className={classes.tokenLogoLarge}
        src={logoUri}
        onError={(event) => (event.currentTarget.style.display = "none")}
      />
      {toAmount}
      <span style={{ color: theme.custom.colors.secondary, marginLeft: "8px" }}>
        {toMintInfo?.symbol}
      </span>
    </div>
  );
}

function SwapInfo({ compact = true }: { compact?: boolean }) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const {
    fromAmount,
    toAmount,
    fromMintInfo,
    toMintInfo,
    priceImpactPct,
    isLoadingRoutes,
    transactionFee,
  } = useSwapContext();

  // Loading indicator when routes are being loaded due to polling
  if (isLoadingRoutes) {
    return (
      <div style={{ textAlign: "center" }}>
        <CircularProgress
          size={48}
          style={{
            color: theme.custom.colors.primaryButton,
            margin: "39px 0",
          }}
        />
      </div>
    );
  }

  const rate = fromAmount ? toAmount! / fromAmount : 0;

  const rows = [];
  if (!compact) {
    rows.push(["You Pay", `${fromAmount} ${fromMintInfo.symbol}`]);
  }
  rows.push([
    "Rate",
    `1 ${fromMintInfo.symbol} = ${rate.toFixed(4)} ${toMintInfo.symbol}`,
  ]);
  rows.push([
    "Network Fee",
    transactionFee ? `${transactionFee / 10 ** 9} SOL` : "-",
  ]);
  if (!compact) {
    rows.push([
      "Backpack Fee",
      <span style={{ color: theme.custom.colors.secondary }}>FREE</span>,
    ]);
  }
  rows.push([
    "Price Impact",
    `${
      priceImpactPct === 0
        ? 0
        : priceImpactPct > 0.1
        ? priceImpactPct.toFixed(2)
        : "< 0.1"
    }%`,
  ]);

  return (
    <>
      {rows.map((r: any) => (
        <div className={classes.swapInfoRow} key={r[0]}>
          <Typography className={classes.swapInfoTitleLeft}>{r[0]}</Typography>
          <Typography className={classes.swapInfoTitleRight}>{r[1]}</Typography>
        </div>
      ))}
    </>
  );
}

function SwapTokensButton({ onClick }: { onClick: () => void }) {
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

function CloseButton({ onClick }: { onClick: () => void }) {
  const classes = useStyles();
  return (
    <div className={classes.swapTokensContainer}>
      <IconButton
        disableRipple
        className={`${classes.swapTokensButton} ${classes.closeConfirmButton}`}
        onClick={onClick}
      >
        <Close className={classes.swapIcon} />
      </IconButton>
    </div>
  );
}

function InputTokenSelectorButton() {
  const { fromMint, setFromMint } = useSwapContext();
  const tokenAccounts = useJupiterInputMints();
  const tokenAccountsFiltered = tokenAccounts.filter(
    (token: Token) => token.nativeBalance !== 0 && token.mint !== fromMint
  );
  return (
    <TokenSelectorButton
      selectedMint={fromMint}
      tokenAccounts={tokenAccountsFiltered}
      setMint={setFromMint}
    />
  );
}

function OutputTokenSelectorButton() {
  const { fromMint, toMint, setToMint } = useSwapContext();
  const tokenAccounts = useJupiterOutputMints(fromMint);
  const tokenAccountsFiltered = tokenAccounts.filter(
    (token: Token) => token.mint !== toMint
  );
  return (
    <TokenSelectorButton
      selectedMint={toMint}
      tokenAccounts={tokenAccountsFiltered}
      setMint={setToMint}
    />
  );
}

function TokenSelectorButton({ selectedMint, tokenAccounts, setMint }: any) {
  const classes = useStyles();

  const tokenRegistry = useSplTokenRegistry();
  const tokenInfo = tokenRegistry.get(selectedMint); // TODO handle null case
  const symbol = tokenInfo ? tokenInfo.symbol : "-";
  const logoUri = tokenInfo ? tokenInfo.logoURI : "-";

  return (
    <>
      <InputAdornment position="end">
        <WithHeaderButton
          labelComponent={
            <>
              <img
                className={classes.tokenLogo}
                src={logoUri}
                onError={(event) =>
                  (event.currentTarget.style.display = "none")
                }
              />
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
              component: (props: any) => <SelectToken {...props} />,
              props: {
                setMint,
                tokenAccounts,
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

function SelectToken({
  setMint,
  tokenAccounts,
  customFilter,
}: {
  setMint: (mint: string) => void;
  tokenAccounts: Token[];
  customFilter: (token: Token) => boolean;
}) {
  const { close } = useDrawerContext();

  const onClickRow = (_blockchain: Blockchain, token: Token) => {
    setMint(token.mint);
    close();
  };

  return (
    <SearchableTokenTable
      onClickRow={onClickRow}
      tokenAccounts={tokenAccounts}
      customFilter={customFilter}
    />
  );
}
