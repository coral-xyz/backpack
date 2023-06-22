import { useEffect, useState } from "react";
import {
  Blockchain,
  SOL_NATIVE_MINT,
  TAB_BALANCES,
  toDisplayBalance,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
  WSOL_MINT,
} from "@coral-xyz/common";
import {
  CheckIcon,
  CrossIcon,
  DangerButton,
  EmptyState,
  Loading,
  MaxLabel,
  PrimaryButton,
  SecondaryButton,
  TextFieldLabel,
} from "@coral-xyz/react-common";
import type {
  SwapContext,
  TokenData,
  TokenDataWithPrice,
} from "@coral-xyz/recoil";
import {
  SwapProvider,
  SwapState,
  useActiveWallet,
  useBackgroundClient,
  useDarkMode,
  useJupiterOutputTokens,
  useNavigation,
  useSwapContext,
} from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { ExpandMore, SwapVert as SwitchIcon } from "@mui/icons-material";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import Info from "@mui/icons-material/Info";
import {
  IconButton,
  InputAdornment,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import type { BigNumberish } from "ethers";
import { ethers, FixedNumber } from "ethers";

import { Button as XnftButton } from "../../plugin/Component";
import { TextField } from "../common";
import { ApproveTransactionDrawer } from "../common/ApproveTransactionDrawer";
import { BottomCard } from "../common/Layout/BottomCard";
import {
  CloseButton,
  useDrawerContext,
  WithDrawer,
} from "../common/Layout/Drawer";
import {
  NavStackEphemeral,
  NavStackScreen,
  useNavigation as useNavigationDrawer,
} from "../common/Layout/NavStack";
import { TokenAmountHeader } from "../common/TokenAmountHeader";
import { TokenInputField } from "../common/TokenInput";
import type { Token } from "../common/TokenTable";
import { SearchableTokenTable } from "../common/TokenTable";

const { Zero } = ethers.constants;

const useStyles = styles((theme) => ({
  tooltipIcon: {
    color: theme.custom.colors.secondary,
    height: 14,
  },
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
  switchTokensContainer: {
    backgroundColor: theme.custom.colors.switchTokensButton,
    width: "44px",
    height: "44px",
    zIndex: 2,
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    borderRadius: "22px",
    position: "absolute",
    top: 120,
    left: 24,
  },
  switchTokensButton: {
    border: `${theme.custom.colors.borderFull}`,
    width: "44px",
    height: "44px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  switchIcon: {
    color: theme.custom.colors.icon,
  },
  cannotSwitch: {
    border: "2px solid red",
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
    display: "flex",
    alignItems: "center",
  },
  swapInfoTitleRight: {
    color: theme.custom.colors.fontColor,
    lineHeight: "20px",
    fontSize: "14px",
    fontWeight: 500,
  },
  feesTooltipTable: {
    tableCollapse: "collapse",
  },
  feesTooltipTableHeading: {
    fontWeight: 500,
    textAlign: "left",
    paddingRight: 10,
  },
  feesTooltipTableValue: {
    textAlign: "right",
  },
}));

export function Swap({ blockchain }: { blockchain: Blockchain }) {
  const { close } = useDrawerContext();
  const isDark = useDarkMode();
  const nav = useNavigationDrawer();

  useEffect(() => {
    nav.setOptions({
      headerTitle: "Swap",
      style: isDark ? { background: "#1D1D20" } : undefined,
    });
  }, [nav, isDark]);

  if (blockchain && blockchain !== Blockchain.SOLANA) {
    throw new Error("only Solana swaps are supported currently");
  }

  return <_Swap isInDrawer close={close} />;
}

export function _Swap({
  isInDrawer,
  close = () => {},
}: {
  isInDrawer?: boolean;
  close?: () => void;
}) {
  const isDark = useDarkMode();
  const classes = useStyles();
  const { swapToFromMints, fromToken, canSwitch } = useSwapContext();
  const [openDrawer, setOpenDrawer] = useState(false);
  const { blockchain } = useActiveWallet();
  const background = useBackgroundClient();

  const isLoading = !fromToken;

  const onSubmit = (e: any) => {
    e.preventDefault();
    setOpenDrawer(true);
  };

  const onViewBalances = () => {
    if (!isInDrawer) {
      background.request({
        method: UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
        params: [TAB_BALANCES],
      });
    } else {
      setOpenDrawer(false);
      close();
    }
  };

  if (blockchain === Blockchain.ETHEREUM) {
    return (
      <EmptyState
        icon={(props: any) => <DoNotDisturbIcon {...props} />}
        title="Ethereum Swaps Soon"
        subtitle="For now, please use a Solana wallet to swap"
      />
    );
  }

  return (
    <>
      <form
        onSubmit={onSubmit}
        className={classes.container}
        style={isDark ? { background: "#1D1D20" } : undefined}
        noValidate
      >
        <div className={classes.topHalf}>
          <SwitchTokensButton disabled={!canSwitch} onClick={swapToFromMints} />
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
      {swapState === SwapState.CONFIRMATION ? (
        <SwapConfirmation onConfirm={onConfirm} />
      ) : null}
      {swapState === SwapState.CONFIRMING ? (
        <SwapConfirming isConfirmed={false} onViewBalances={onViewBalances} />
      ) : null}
      {swapState === SwapState.CONFIRMED ? (
        <SwapConfirming isConfirmed onViewBalances={onViewBalances} />
      ) : null}
      {swapState === SwapState.ERROR ? (
        <SwapError onCancel={() => onClose()} onRetry={onConfirm} />
      ) : null}
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
          isLoadingRoutes ? (
            <Loading
              iconStyle={{
                display: "flex",
                color: theme.custom.colors.secondary,
                marginRight: "10px",
              }}
              size={24}
              thickness={5}
            />
          ) : null
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
      {isConfirmed ? (
        <div
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
        </div>
      ) : null}
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
    transactionFees,
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
          FixedNumber.from(toAmount).divUnsafe(FixedNumber.from(fromAmount)),
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
        rate: `1 ${fromToken.ticker} ≈ ${rate.substring(0, 10)} ${
          toToken.ticker
        }`,
        priceImpact: `${
          priceImpactPct === 0
            ? 0
            : priceImpactPct > 0.1
            ? priceImpactPct.toFixed(2)
            : "< 0.1"
        }%`,
        networkFee: transactionFees
          ? `~ ${approximateAmount(transactionFees.total)} SOL`
          : "-",
        swapFee,
        transactionFees,
      }}
    />
  );
}

type SwapInfoRowProps = {
  label: string;
  value: string | React.ReactElement;
  tooltip?: string;
};

function SwapInfoRows({
  youPay,
  rate,
  networkFee,
  priceImpact,
  compact,
  swapFee,
  transactionFees,
}: {
  youPay: any;
  rate: any;
  priceImpact: any;
  networkFee: any;
  compact?: boolean;
  swapFee?: SwapContext["swapFee"];
  transactionFees?: SwapContext["transactionFees"];
}) {
  const classes = useStyles();

  const rows: Array<SwapInfoRowProps> = [];

  if (!compact) {
    rows.push({ label: "You Pay", value: youPay });
  }

  rows.push({ label: "Rate", value: rate });
  rows.push({
    label: "Estimated Fees",
    value: networkFee,
    // @ts-ignore - tooltip's supposed to be a string, can be a component for now
    tooltip:
      transactionFees && swapFee ? (
        <table className={classes.feesTooltipTable}>
          <tbody>
            {Object.entries(transactionFees?.fees ?? {}).map(
              ([description, value]) => (
                <tr key={description}>
                  <th className={classes.feesTooltipTableHeading}>
                    {description}
                  </th>
                  <td className={classes.feesTooltipTableValue}>
                    {approximateAmount(value)} SOL
                  </td>
                </tr>
              )
            )}
            {swapFee.pct > 0 ? (
              <tr>
                <td colSpan={2} style={{ opacity: 0.5 }}>
                  Quote includes a {swapFee.pct}% Backpack fee
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      ) : null,
  });
  rows.push({ label: "Price Impact", value: priceImpact });

  return (
    <>
      {rows.map((row) => (
        <SwapInfoRow key={row.label} {...row} />
      ))}
    </>
  );
}

const SwapInfoRow = ({ label, value, tooltip }: SwapInfoRowProps) => {
  const classes = useStyles();
  // show tooltip when user hovers on the label text, not just the icon
  const [tooltipVisible, setTooltipVisible] = useState(false);
  return (
    <div className={classes.swapInfoRow}>
      <div
        onMouseOver={() => setTooltipVisible(true)}
        onMouseOut={() => setTooltipVisible(false)}
      >
        <Typography className={classes.swapInfoTitleLeft}>
          {label}
          {tooltip ? (
            <Tooltip title={tooltip} arrow open={tooltipVisible}>
              <Info className={classes.tooltipIcon} />
            </Tooltip>
          ) : null}
        </Typography>
      </div>
      <Typography className={classes.swapInfoTitleRight}>{value}</Typography>
    </div>
  );
};

function SwitchTokensButton({
  onClick,
  disabled = false,
}: {
  onClick: () => void;
  disabled?: Boolean;
}) {
  const classes = useStyles();

  return (
    <div className={classes.switchTokensContainer}>
      <IconButton
        disableRipple
        className={classes.switchTokensButton}
        onClick={onClick}
        disabled={Boolean(disabled)}
      >
        <SwitchIcon className={classes.switchIcon} />
      </IconButton>
    </div>
  );
}

function InputTokenSelectorButton() {
  const { fromToken, isInDrawer } = useSwapContext();
  return isInDrawer ? (
    <TokenSelectorButtonInDrawer token={fromToken!} input isFromMint />
  ) : (
    <TokenSelectorButton token={fromToken!} input isFromMint />
  );
}

function OutputTokensSelectorButton() {
  const { toToken, isInDrawer } = useSwapContext();
  return isInDrawer ? (
    <TokenSelectorButtonInDrawer
      token={toToken!}
      input={false}
      isFromMint={false}
    />
  ) : (
    <TokenSelectorButton token={toToken!} input={false} isFromMint={false} />
  );
}

function TokenSelectorButtonInDrawer({
  token,
  input,
  isFromMint,
}: {
  token: TokenData;
  input: boolean;
  isFromMint: boolean;
}) {
  const nav = useNavigationDrawer();
  return (
    <_TokenSelectorButton
      token={token}
      push={() => {
        nav.push("select-token", {
          isFromMint,
          input,
        });
      }}
    />
  );
}

function TokenSelectorButton({
  token,
  input,
  isFromMint,
}: {
  token: TokenData;
  input: boolean;
  isFromMint: boolean;
}) {
  const nav = useNavigation();
  const [openDrawer, setOpenDrawer] = useState(false);
  return (
    <>
      <_TokenSelectorButton
        token={token}
        push={() => {
          setOpenDrawer(true);
        }}
      />
      <WithDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
        <NavStackEphemeral
          initialRoute={{ name: "root" }}
          options={() => ({ title: "" })}
          navButtonLeft={
            <CloseButton
              onClick={() => {
                setOpenDrawer(false);
              }}
            />
          }
        >
          <NavStackScreen
            name="root"
            component={() => (
              <SwapSelectTokenInDrawer
                isFromMint={isFromMint}
                input={input}
                close={() => setOpenDrawer(false)}
              />
            )}
          />
        </NavStackEphemeral>
      </WithDrawer>
    </>
  );
}

function _TokenSelectorButton({
  token,
  push,
}: {
  token: TokenData;
  push: () => void;
}) {
  const classes = useStyles();

  return (
    <InputAdornment position="end">
      <XnftButton
        onClick={() => push()}
        style={{
          backgroundColor: "transparent",
          width: "auto",
          justifyContent: "right",
        }}
      >
        {token ? (
          <img
            className={classes.tokenLogo}
            src={token.logo}
            onError={(event) => (event.currentTarget.style.display = "none")}
          />
        ) : null}
        <Typography className={classes.tokenSelectorButtonLabel}>
          {token ? token.ticker : null}
        </Typography>
        <ExpandMore className={classes.expandMore} />
      </XnftButton>
    </InputAdornment>
  );
}

export function SwapSelectTokenInDrawer({
  customFilter = () => true,
  input,
  isFromMint,
  close,
}: {
  customFilter?: (token: Token) => boolean;
  input: boolean;
  isFromMint: boolean;
  close?: () => void;
}) {
  const nav = useNavigationDrawer();
  const isDark = useDarkMode();
  const theme = useCustomTheme();

  const { fromTokens, toTokens, setFromMint, setToMint } = useSwapContext();
  const setMint = isFromMint ? setFromMint : setToMint;

  useEffect(() => {
    nav.setOptions({
      headerTitle: "Select Token",
      style: isDark
        ? { background: theme.custom.colors.background }
        : undefined,
    });
  }, [nav, isDark, theme]);

  const tokenAccounts = (
    !input ? toTokens : fromTokens
  ) as Array<TokenDataWithPrice>;

  const onClickRow = (_blockchain: Blockchain, token: Token) => {
    setMint(token.mint!);
    close ? close() : nav.pop();
  };

  return (
    <SearchableTokenTable
      onClickRow={onClickRow}
      tokenAccounts={tokenAccounts}
      customFilter={customFilter}
    />
  );
}

/**
 * Hides miniscule amounts of SOL
 * @example approximateAmount(0.00203928) = "0.002"
 * @param value BigNumberish amount of Solana Lamports
 */
const approximateAmount = (value: BigNumberish) =>
  ethers.utils.formatUnits(value, 9).replace(/(0.0{2,}[1-9])(\d+)/, "$1");
