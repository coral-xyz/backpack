import { useEffect, useState } from "react";
import {
  Blockchain,
  SOL_NATIVE_MINT,
  toDisplayBalance,
  WSOL_MINT,
} from "@coral-xyz/common";
import {
  CheckIcon,
  CrossIcon,
  DangerButton,
  Loading,
  MaxLabel,
  PrimaryButton,
  SecondaryButton,
  TextFieldLabel,
} from "@coral-xyz/react-common";
import type { TokenData, TokenDataWithPrice } from "@coral-xyz/recoil";
import {
  useActiveWallet,
  useDarkMode,
  useJupiterOutputTokens,
  useSwapContext,
} from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { ExpandMore, SwapVert } from "@mui/icons-material";
import {
  IconButton,
  InputAdornment,
  Skeleton,
  Typography,
} from "@mui/material";
import { ethers, FixedNumber } from "ethers";

import { Button as XnftButton } from "../../plugin/Component";
import { TextField } from "../common";
import { ApproveTransactionDrawer } from "../common/ApproveTransactionDrawer";
import { BottomCard } from "../common/Layout/BottomCard";
import { useDrawerContext } from "../common/Layout/Drawer";
import { useNavigation } from "../common/Layout/NavStack";
import { TokenAmountHeader } from "../common/TokenAmountHeader";
import { TokenInputField } from "../common/TokenInput";
import type { Token } from "../common/TokenTable";
import { SearchableTokenTable } from "../common/TokenTable";
import { WalletDrawerButton } from "../common/WalletList";

const { Zero } = ethers.constants;

const useStyles = styles((theme) => ({
  container: {
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
    borderTop: `${theme.custom.colors.borderFull}`,
    backgroundColor: theme.custom.colors.bg3,
    flex: 1,
    paddingBottom: "16px",
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
        border: `${theme.custom.colors.borderFull}`,
      },
      "&:hover fieldset": {
        border: `solid 2pt ${theme.custom.colors.primaryButton}`,
      },
      "& input": {
        border: "none",
      },
    },
  },
  receiveFieldRoot: {
    marginTop: 0,
    marginBottom: 0,
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        border: `${theme.custom.colors.borderFull} !important`,
      },
      "&:hover fieldset": {
        border: `${theme.custom.colors.borderFull}`, // Prevent hover from changing border.
      },
      "& input": {
        border: "none",
      },
    },
    "& .MuiInputBase-input.Mui-disabled": {
      // Override disabled font color
      WebkitTextFillColor: `${theme.custom.colors.secondary} !important`,
    },
  },
  swapTokensContainer: {
    backgroundColor: theme.custom.colors.swapTokensButton,
    width: "44px",
    height: "44px",
    zIndex: 2,
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    borderRadius: "22px",
  },
  swapTokensButton: {
    border: `${theme.custom.colors.borderFull}`,
    width: "44px",
    height: "44px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  swapIcon: {
    color: theme.custom.colors.icon,
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

export function Swap({ blockchain }: { blockchain: Blockchain }) {
  const isDark = useDarkMode();
  const nav = useNavigation();

  useEffect(() => {
    nav.setOptions({
      headerTitle: "Swap",
      style: isDark ? { background: "#1D1D20" } : undefined,
    });
  }, [nav]);

  if (blockchain && blockchain !== Blockchain.SOLANA) {
    throw new Error("only Solana swaps are supported currently");
  }

  return <_Swap />;
}

function _Swap() {
  const isDark = useDarkMode();
  const classes = useStyles();
  const { swapToFromMints, fromToken } = useSwapContext();
  const [openDrawer, setOpenDrawer] = useState(false);
  const { close } = useDrawerContext();

  const isLoading = !fromToken;

  const onSwapButtonClick = () => {
    swapToFromMints();
  };

  const onSubmit = (e: any) => {
    e.preventDefault();
    setOpenDrawer(true);
  };

  const onViewBalances = () => {
    setOpenDrawer(false);
    close();
  };

  return (
    <>
      <form
        onSubmit={onSubmit}
        className={classes.container}
        style={isDark ? { background: "#1D1D20" } : undefined}
        noValidate
      >
        <div className={classes.topHalf}>
          <SwapTokensButton
            onClick={onSwapButtonClick}
            style={{
              position: "fixed",
              top: "175px",
              left: "24px",
            }}
          />
          {isLoading ? (
            <Skeleton height={80} style={{ borderRadius: "12px" }} />
          ) : (
            <InputTextField />
          )}
        </div>
        <div className={classes.bottomHalfWrapper}>
          <div className={classes.bottomHalf}>
            {isLoading ? (
              <Skeleton height={80} style={{ borderRadius: "12px" }} />
            ) : (
              <div>
                <OutputTextField />
                <div
                  style={{
                    marginTop: "24px",
                    marginLeft: "8px",
                    marginRight: "8px",
                  }}
                >
                  <SwapInfo />
                </div>
              </div>
            )}
            <ConfirmSwapButton />
          </div>
        </div>
      </form>
      <ApproveTransactionDrawer
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
      >
        <SwapConfirmationCard
          onClose={() => setOpenDrawer(false)}
          onViewBalances={() => onViewBalances()}
        />
      </ApproveTransactionDrawer>
    </>
  );
}

const SwapConfirmationCard: React.FC<{
  onClose: () => void;
  onViewBalances: () => void;
}> = ({ onClose, onViewBalances }) => {
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
      {swapState === SwapState.CONFIRMATION ? <SwapConfirmation onConfirm={onConfirm} /> : null}
      {swapState === SwapState.CONFIRMING ? <SwapConfirming isConfirmed={false} onViewBalances={onViewBalances} /> : null}
      {swapState === SwapState.CONFIRMED ? <SwapConfirming isConfirmed onViewBalances={onViewBalances} /> : null}
      {swapState === SwapState.ERROR ? <SwapError onCancel={() => onClose()} onRetry={onConfirm} /> : null}
    </div>
  );
};

function InputTextField() {
  const classes = useStyles();
  const {
    fromAmount,
    setFromAmount,
    fromToken,
    availableForSwap,
    exceedsBalance,
  } = useSwapContext();

  return (
    <>
      <TextFieldLabel
        leftLabel="Sending"
        rightLabelComponent={
          <MaxLabel
            amount={availableForSwap}
            onSetAmount={setFromAmount}
            decimals={fromToken!.decimals}
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
        decimals={fromToken!.decimals}
        isError={exceedsBalance}
      />
    </>
  );
}

function OutputTextField() {
  const classes = useStyles();
  const theme = useCustomTheme();
  const { toAmount, toToken, isLoadingRoutes } = useSwapContext();
  return (
    <>
      <TextFieldLabel leftLabel="Receiving" />
      <TextField
        placeholder="0"
        startAdornment={
          isLoadingRoutes ? <Loading
            iconStyle={{
                display: "flex",
                color: theme.custom.colors.secondary,
                marginRight: "10px",
              }}
            size={24}
            thickness={5}
            /> : null
        }
        endAdornment={<OutputTokensSelectorButton />}
        rootClass={classes.receiveFieldRoot}
        type="number"
        value={
          toAmount && toToken
            ? ethers.utils.formatUnits(toAmount, toToken.decimals)
            : ""
        }
        disabled
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
  return <DangerButton label="Swaps unavailable" disabled />;
};

const SwapInvalidButton = () => {
  return <DangerButton label="Invalid swap" disabled />;
};

const InsufficientBalanceButton = () => {
  return <DangerButton label="Insufficient balance" disabled />;
};

const InsufficientFeeButton = () => {
  return <DangerButton label="Insufficient balance for fee" disabled />;
};

const ConfirmSwapButton = () => {
  const {
    toAmount,
    toMint,
    fromAmount,
    fromMint,
    isJupiterError,
    exceedsBalance,
    feeExceedsBalance,
    isLoadingRoutes,
    isLoadingTransactions,
  } = useSwapContext();
  const tokenAccounts = useJupiterOutputTokens(fromMint);

  // Parameters aren't all entered or the swap data is loading
  const isIncomplete =
    !fromAmount || !toAmount || isLoadingRoutes || isLoadingTransactions;

  if (fromMint === toMint) {
    return <SwapInvalidButton />;
  } else if (exceedsBalance) {
    return <InsufficientBalanceButton />;
  } else if (feeExceedsBalance && !isIncomplete) {
    return <InsufficientFeeButton />;
  } else if (isJupiterError || tokenAccounts.length === 0) {
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

  return <PrimaryButton type="submit" label={label} disabled={isIncomplete} />;
};

//
// Bottom drawer displayed so the user can confirm the swap parameters.
//
function SwapConfirmation({ onConfirm }: { onConfirm: () => void }) {
  const classes = useStyles();
  return (
    <BottomCard onButtonClick={onConfirm} buttonLabel="Confirm">
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
function SwapConfirming({
  isConfirmed,
  onViewBalances,
}: {
  isConfirmed: boolean;
  onViewBalances: () => void;
}) {
  const classes = useStyles();

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
            <Loading
              size={48}
              iconStyle={{
                display: "flex",
                marginLeft: "auto",
                marginRight: "auto",
              }}
              thickness={6}
            />
          )}
        </div>
      </div>
      {isConfirmed ? <div
        style={{
            marginBottom: "16px",
            marginLeft: "16px",
            marginRight: "16px",
          }}
        >
        <SecondaryButton
          onClick={() => onViewBalances()}
          label="View Balances"
          />
      </div> : null}
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
      buttonLabel="Retry"
      onButtonClick={onRetry}
      cancelButtonLabel="Back"
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

function SwapReceiveAmount() {
  const { toAmount, toToken } = useSwapContext();
  return (
    <TokenAmountHeader
      token={{
        logo: toToken!.logo,
        ticker: toToken!.ticker,
        decimals: toToken!.decimals,
      }}
      amount={toAmount!}
    />
  );
}

function SwapInfo({ compact = true }: { compact?: boolean }) {
  const {
    fromAmount,
    toAmount,
    fromToken,
    toToken,
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
        <Loading
          size={48}
          iconStyle={{
            margin: "32px 0",
            marginLeft: "auto",
            marginRight: "auto",
          }}
          thickness={6}
        />
      </div>
    );
  }

  if (!fromAmount || !toAmount || !fromToken || !toToken) {
    return (
      <SwapInfoRows
        {...{
          compact,
          youPay: "-",
          rate: "-",
          priceImpact: "-",
          networkFee: "-",
        }}
      />
    );
  }

  const decimalDifference = fromToken.decimals - toToken.decimals;
  const toAmountWithFees = toAmount.sub(swapFee);

  // Scale a FixedNumber up or down by a number of decimals
  const scale = (x: FixedNumber, decimalDifference: number) => {
    if (decimalDifference > 0) {
      return x.mulUnsafe(FixedNumber.from(10 ** decimalDifference));
    } else if (decimalDifference < 0) {
      return x.divUnsafe(FixedNumber.from(10 ** Math.abs(decimalDifference)));
    }
    return x;
  };

  const rate = fromAmount.gt(Zero)
    ? ethers.utils.commify(
        scale(
          FixedNumber.from(toAmountWithFees).divUnsafe(
            FixedNumber.from(fromAmount)
          ),
          decimalDifference
        ).toString()
      )
    : "0";

  return (
    <SwapInfoRows
      {...{
        compact,
        youPay: `${toDisplayBalance(fromAmount, fromToken.decimals)} ${
          fromToken.ticker
        }`,
        rate: `1 ${fromToken.ticker} = ${rate.substring(0, 10)} ${
          toToken.ticker
        }`,
        priceImpact: `${
          priceImpactPct === 0
            ? 0
            : priceImpactPct > 0.1
            ? priceImpactPct.toFixed(2)
            : "< 0.1"
        }%`,
        networkFee: transactionFee
          ? `${ethers.utils.formatUnits(transactionFee, 9)} SOL`
          : "-",
      }}
    />
  );
}

function SwapInfoRows({
  youPay,
  rate,
  networkFee,
  priceImpact,
  compact,
}: {
  youPay: any;
  rate: any;
  priceImpact: any;
  networkFee: any;
  compact?: boolean;
}) {
  const classes = useStyles();
  const wallet = useActiveWallet();
  const rows = [];
  rows.push([
    "Wallet",
    <WalletDrawerButton wallet={wallet} style={{ height: "20px" }} />,
  ]);
  if (!compact) {
    rows.push(["You Pay", youPay]);
  }
  rows.push(["Rate", rate]);
  rows.push(["Network Fee", networkFee]);
  rows.push(["Price Impact", priceImpact]);

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

function InputTokenSelectorButton() {
  const { fromToken, setFromMint } = useSwapContext();
  return (
    <TokenSelectorButton
      token={fromToken!}
      input
      setMint={setFromMint}
    />
  );
}

function OutputTokensSelectorButton() {
  const { toToken, setToMint } = useSwapContext();
  return (
    <TokenSelectorButton token={toToken!} setMint={setToMint} input={false} />
  );
}

function TokenSelectorButton({
  token,
  setMint,
  input,
}: {
  token: TokenData;
  setMint: (mint: string) => void;
  input: boolean;
}) {
  const classes = useStyles();
  const nav = useNavigation();

  return (
    <InputAdornment position="end">
      <XnftButton
        onClick={() =>
          nav.push("select-token", {
            // @ts-ignore
            setMint: (...args: any) => setMint(...args),
            input,
          })
        }
        style={{
          backgroundColor: "transparent",
          width: "auto",
          justifyContent: "right",
        }}
      >
        {token ? <img
          className={classes.tokenLogo}
          src={token.logo}
          onError={(event) => (event.currentTarget.style.display = "none")}
          /> : null}
        <Typography className={classes.tokenSelectorButtonLabel}>
          {token ? token.ticker : null}
        </Typography>
        <ExpandMore className={classes.expandMore} />
      </XnftButton>
    </InputAdornment>
  );
}

export function SwapSelectToken({
  setMint,
  customFilter,
  input,
}: {
  setMint: (mint: string) => void;
  customFilter: (token: Token) => boolean;
  input: boolean;
}) {
  const isDark = useDarkMode();
  const theme = useCustomTheme();
  const nav = useNavigation();
  const { fromTokens, toTokens } = useSwapContext();
  const tokenAccounts = (
    !input ? toTokens : fromTokens
  ) as Array<TokenDataWithPrice>;

  const onClickRow = (_blockchain: Blockchain, token: Token) => {
    setMint(token.mint!);
    nav.pop();
  };

  useEffect(() => {
    nav.setOptions({
      headerTitle: "Select Token",
      style: isDark
        ? { background: theme.custom.colors.background }
        : undefined,
    });
  }, [nav]);

  return (
    <SearchableTokenTable
      onClickRow={onClickRow}
      tokenAccounts={tokenAccounts}
      customFilter={customFilter}
    />
  );
}
