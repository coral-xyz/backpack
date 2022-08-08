import { useState } from "react";
import { ethers, BigNumber } from "ethers";
import {
  InputAdornment,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import type { Button } from "@mui/material";
import { Close, ExpandMore, SwapVert } from "@mui/icons-material";
import {
  useSplTokenRegistry,
  useJupiterInputMints,
  useJupiterOutputMints,
  useBackgroundClient,
  useSwapContext,
  SwapProvider,
} from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import {
  Blockchain,
  SOL_NATIVE_MINT,
  WSOL_MINT,
  TAB_BALANCES,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
} from "@coral-xyz/common";
import {
  TextField,
  TextFieldLabel,
  PrimaryButton,
  DangerButton,
  SecondaryButton,
} from "../common";
import { TokenInputField } from "../common/TokenInput";
import { CheckIcon, CrossIcon } from "../common/Icon";
import { WithHeaderButton } from "./Balances/TokensWidget/Token";
import { BottomCard } from "./Balances/TokensWidget/Send";
import { useDrawerContext } from "../common/Layout/Drawer";
import type { Token } from "../common/TokenTable";
import { SearchableTokenTable } from "../common/TokenTable";
import { MaxLabel } from "../common/MaxLabel";
import { ApproveTransactionDrawer } from "../common/ApproveTransactionDrawer";

const { Zero } = ethers.constants;

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
  const { toAmount, swapToFromMints } = useSwapContext();
  const [openDrawer, setOpenDrawer] = useState(false);

  const onSwapButtonClick = () => {
    swapToFromMints();
  };

  const onSubmit = (e: any) => {
    e.preventDefault();
    setOpenDrawer(true);
  };

  return (
    <>
      <form onSubmit={onSubmit} className={classes.container} noValidate>
        <div className={classes.topHalf}>
          <SwapTokensButton
            onClick={onSwapButtonClick}
            style={{
              position: "fixed",
              top: "175px",
              left: "24px",
            }}
          />
          <InputTextField />
        </div>
        <div className={classes.bottomHalfWrapper}>
          <div className={classes.bottomHalf}>
            <div>
              <OutputTextField />
              {!!toAmount && toAmount.gt(Zero) && (
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
            <ConfirmSwapButton type="submit" blockchain={blockchain} />
          </div>
        </div>
      </form>
      <ApproveTransactionDrawer
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
      >
        <SwapConfirmationCard onClose={() => setOpenDrawer(false)} />
      </ApproveTransactionDrawer>
    </>
  );
}

const SwapConfirmationCard: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const { executeSwap } = useSwapContext();
  const [swapState, setSwapState] = useState(SwapState.CONFIRMATION);

  const onConfirm = async () => {
    setSwapState(SwapState.CONFIRMING);
    const result = await executeSwap();
    if (result) {
      setSwapState(SwapState.CONFIRMED);
    } else {
      setSwapState(SwapState.ERROR);
    }
  };

  return (
    <div>
      {swapState === SwapState.CONFIRMATION && (
        <SwapConfirmation onConfirm={onConfirm} />
      )}
      {swapState === SwapState.CONFIRMING && (
        <SwapConfirming isConfirmed={false} />
      )}
      {swapState === SwapState.CONFIRMED && (
        <SwapConfirming isConfirmed={true} />
      )}
      {swapState === SwapState.ERROR && (
        <SwapError onCancel={() => onClose()} onRetry={onConfirm} />
      )}
    </div>
  );
};

function InputTextField() {
  const classes = useStyles();
  const {
    fromAmount,
    setFromAmount,
    fromMintInfo,
    availableForSwap,
    exceedsBalance,
  } = useSwapContext();

  return (
    <>
      <TextFieldLabel
        leftLabel={"You Pay"}
        rightLabelComponent={
          <MaxLabel
            amount={availableForSwap}
            onSetAmount={setFromAmount}
            decimals={fromMintInfo.decimals}
          />
        }
      />
      <TokenInputField
        type="number"
        placeholder="0"
        endAdornment={<InputTokenSelectorButton />}
        rootClass={classes.fromFieldRoot}
        value={fromAmount}
        setValue={setFromAmount}
        decimals={fromMintInfo.decimals}
        isError={exceedsBalance}
      />
    </>
  );
}

function OutputTextField() {
  const classes = useStyles();
  const theme = useCustomTheme();
  const { toAmount, toMintInfo, isLoadingRoutes } = useSwapContext();
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
                marginRight: "10px",
              }}
              size={24}
              thickness={5}
            />
          )
        }
        endAdornment={<OutputTokenSelectorButton />}
        rootClass={classes.receiveFieldRoot}
        type={"number"}
        value={
          toAmount
            ? ethers.utils.formatUnits(toAmount, toMintInfo.decimals)
            : ""
        }
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

const SwapUnavailableButton = () => {
  return <DangerButton label="Swaps unavailable" disabled={true} />;
};

const InsufficientBalanceButton = () => {
  return <DangerButton label="Insufficient balance" disabled={true} />;
};

const ConfirmSwapButton = ({
  blockchain,
  ...buttonProps
}: {
  blockchain: Blockchain;
} & React.ComponentProps<typeof Button>) => {
  const {
    toAmount,
    toMint,
    fromAmount,
    fromMint,
    isJupiterError,
    exceedsBalance,
    isLoadingRoutes,
    isLoadingTransactions,
  } = useSwapContext();

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
      disabled={
        !fromAmount || !toAmount || isLoadingRoutes || isLoadingTransactions
      }
      {...buttonProps}
    />
  );
};

//
// Bottom drawer displayed so the user can confirm the swap parameters.
//
function SwapConfirmation({ onConfirm }: { onConfirm: () => void }) {
  const classes = useStyles();
  return (
    <BottomCard onButtonClick={onConfirm} buttonLabel={"Confirm"}>
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
function SwapConfirming({ isConfirmed }: { isConfirmed: boolean }) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const background = useBackgroundClient();

  const onViewBalances = () => {
    background.request({
      method: UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
      params: [TAB_BALANCES],
    });
  };

  return (
    <div
      style={{
        height: "264px",
        paddingTop: "52px",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <Typography className={classes.confirmationTitle}>
          {isConfirmed ? "Swap Confirmed!" : "Swapping.."}
        </Typography>
        <div style={{ marginTop: "8px", marginBottom: "16px" }}>
          <SwapReceiveAmount />
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          {isConfirmed ? (
            <div
              style={{
                textAlign: "center",
              }}
            >
              <CheckIcon />
            </div>
          ) : (
            <CircularProgress
              size={48}
              style={{
                color: theme.custom.colors.primaryButton,
                display: "flex",
                marginLeft: "auto",
                marginRight: "auto",
              }}
              thickness={6}
            />
          )}
        </div>
      </div>
      {isConfirmed && (
        <div
          style={{
            marginBottom: "16px",
            marginLeft: "16px",
            marginRight: "16px",
          }}
        >
          <SecondaryButton onClick={onViewBalances} label={"View Balances"} />
        </div>
      )}
    </div>
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
      {toAmount ? ethers.utils.formatUnits(toAmount, toMintInfo.decimals) : 0}
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
    isLoadingTransactions,
    transactionFee,
    swapFee,
  } = useSwapContext();

  // Loading indicator when routes are being loaded due to polling
  if (isLoadingRoutes || isLoadingTransactions) {
    return (
      <div style={{ textAlign: "center" }}>
        <CircularProgress
          size={48}
          style={{
            color: theme.custom.colors.primaryButton,
            margin: "32px 0",
          }}
          thickness={6}
        />
      </div>
    );
  }

  if (!fromAmount || !toAmount) return <></>;

  const decimalDifference = fromMintInfo.decimals - toMintInfo.decimals;
  const toAmountWithFees = toAmount.sub(swapFee);
  const rate = fromAmount.gt(Zero)
    ? (toAmountWithFees.toNumber() / fromAmount.toNumber()) *
      10 ** decimalDifference
    : 0;

  const rows = [];
  if (!compact) {
    rows.push([
      "You Pay",
      `${ethers.utils.formatUnits(fromAmount, fromMintInfo.decimals)} ${
        fromMintInfo.symbol
      }`,
    ]);
  }
  rows.push([
    "Rate",
    `1 ${fromMintInfo.symbol} = ${rate.toFixed(4)} ${toMintInfo.symbol}`,
  ]);
  rows.push([
    "Network Fee",
    transactionFee ? `${ethers.utils.formatUnits(transactionFee, 9)} SOL` : "-",
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

function SwapTokensButton({
  onClick,
  style,
}: {
  onClick: () => void;
  style: any;
}) {
  const classes = useStyles();
  return (
    <div className={classes.swapTokensContainer} style={style}>
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

export function CloseButton({
  onClick,
  style,
}: {
  onClick: () => void;
  style?: React.CSSProperties;
}) {
  const classes = useStyles();
  return (
    <div className={classes.swapTokensContainer} style={style}>
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
  const { toMint, fromMint, setFromMint } = useSwapContext();
  const tokenAccounts = useJupiterInputMints();
  const tokenAccountsFiltered = tokenAccounts.filter(
    (token: Token) => !token.nativeBalance.isZero() && token.mint !== toMint
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
    (token: Token) => token.mint !== fromMint
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
