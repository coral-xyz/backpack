import { useEffect, useState } from "react";
import { useApolloClient } from "@apollo/client";
import {
  Blockchain,
  TAB_BALANCES,
  toDisplayBalance,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
  wait,
} from "@coral-xyz/common";
import {
  GET_TOKEN_BALANCES_QUERY,
  type ProviderId,
} from "@coral-xyz/data-components";
import { useTranslation } from "@coral-xyz/i18n";
import {
  CheckIcon,
  CrossIcon,
  EmptyState,
  Loading,
  MaxLabel,
  TextFieldLabel,
} from "@coral-xyz/react-common";
import type {
  SwapContext,
  TokenData,
  TokenDataWithPrice,
} from "@coral-xyz/recoil";
import {
  blockchainConfigAtom,
  solanaClientAtom,
  SwapState,
  useActiveWallet,
  useBackgroundClient,
  useDarkMode,
  useJupiterOutputTokens,
  useSwapContext,
} from "@coral-xyz/recoil";
import {
  SOL_NATIVE_MINT,
  WSOL_MINT,
} from "@coral-xyz/secure-clients/legacyCommon";
import {
  BpDangerButton,
  BpPrimaryButton,
  BpSecondaryButton,
  temporarilyMakeStylesForBrowserExtension,
  useTheme,
  YStack,
} from "@coral-xyz/tamagui";
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
import { useRecoilValue } from "recoil";

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

const useStyles = temporarilyMakeStylesForBrowserExtension((theme) => ({
  tooltipIcon: {
    color: theme.baseTextMedEmphasis.val,
    height: 14,
  },
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  topHalf: {
    backgroundColor: theme.baseBackgroundL0.val,
    paddingTop: "24px",
    paddingBottom: "38px",
    paddingLeft: "16px",
    paddingRight: "16px",
  },
  bottomHalfWrapper: {
    borderTop: `solid 1pt ${theme.baseBorderMed.val}`,
    backgroundColor: theme.baseBackgroundL1.val,
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

  receiveFieldRoot: {
    marginTop: 0,
    marginBottom: 0,
    "& .MuiOutlinedInput-root": {
      backgroundColor: `${theme.baseBackgroundL0.val}  !important`,

      "& fieldset": {
        border: `${theme.baseBorderMed.val} !important`,
      },
      "&:hover fieldset": {
        border: theme.baseBorderMed.val, // Prevent hover from changing border.
      },
      "& input": {
        backgroundColor: theme.baseBackgroundL0.val,
        border: "none",
      },
    },
    "& .MuiInputBase-input": {
      borderRadius: "12px",
    },
    "& .MuiInputBase-input.Mui-disabled": {
      // Override disabled font color
      WebkitTextFillColor: `${theme.baseTextMedEmphasis.val} !important`,
    },
  },
  switchTokensContainer: {
    backgroundColor: theme.baseBackgroundL1.val,
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
    border: `solid 1pt ${theme.baseBorderMed.val}`,
  },
  switchTokensButton: {
    border: theme.baseBorderMed.val,
    width: "44px",
    height: "44px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  switchIcon: {
    color: theme.baseIcon.val,
  },
  tokenSelectorButtonLabel: {
    color: theme.baseTextHighEmphasis.val,
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: "24px",
  },
  expandMore: {
    color: theme.baseTextMedEmphasis.val,
    fontSize: "18px",
    marginLeft: "6px",
  },
  tokenLogo: {
    marginRight: "8px",
    width: "20px",
    height: "20px",
    borderRadius: "10px",
  },
  confirmationTitle: {
    color: theme.baseTextMedEmphasis.val,
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: "20px",
    textAlign: "center",
  },
  swapInfoRow: {
    marginBottom: "8px",
    display: "flex",
    justifyContent: "space-between",
  },
  swapInfoTitleLeft: {
    color: theme.baseTextMedEmphasis.val,
    lineHeight: "20px",
    fontSize: "14px",
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
  },
  swapInfoTitleRight: {
    color: theme.baseTextHighEmphasis.val,
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
  skeleton: {
    borderRadius: 12,
    height: 80,
  },
}));

export function Swap({ blockchain }: { blockchain: Blockchain }) {
  const { close } = useDrawerContext();
  const theme = useTheme();
  const nav = useNavigationDrawer();

  useEffect(() => {
    nav.setOptions({
      headerTitle: "Swap",
      // do not set style here. this will break swap. (Secure-ui wont popup.)
      // maybe because of a race condition due to full app rerendering(?).
      // cost me hours to figure out.
      // style: { backgroundColor: theme.baseBackgroundL1.val },
    });
  }, [nav, theme]);

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
  const theme = useTheme();
  const classes = useStyles();
  const { swapToFromMints, fromToken, canSwitch } = useSwapContext();
  const [submitted, setSubmitted] = useState(false);
  const { blockchain } = useActiveWallet();
  const background = useBackgroundClient();
  const blockchainConfig = useRecoilValue(blockchainConfigAtom(blockchain));

  const isLoading = !fromToken;

  const onSubmit = (e?: any) => {
    e?.preventDefault();
    setSubmitted(true);
  };

  const onViewBalances = () => {
    if (!isInDrawer) {
      background.request({
        method: UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
        params: [TAB_BALANCES],
      });
    } else {
      setSubmitted(false);
      close();
    }
  };

  if (blockchain !== Blockchain.SOLANA) {
    return (
      <YStack padding="$4" flex={1} justifyContent="center" alignItems="center">
        <EmptyState
          icon={(props: any) => <DoNotDisturbIcon {...props} />}
          title={`${blockchainConfig.Name} Swaps Soon`}
          subtitle="For now, please use a Solana wallet to swap"
        />
      </YStack>
    );
  }

  return (
    <>
      <form onSubmit={onSubmit} className={classes.container} noValidate>
        <div className={classes.topHalf}>
          <SwitchTokensButton disabled={!canSwitch} onClick={swapToFromMints} />
          {isLoading ? (
            <Skeleton
              className={classes.skeleton}
              style={{ backgroundColor: theme.baseBackgroundL1.val }}
            />
          ) : (
            <InputTextField />
          )}
        </div>
        <div className={classes.bottomHalfWrapper}>
          <div className={classes.bottomHalf}>
            {isLoading ? (
              <Skeleton
                className={classes.skeleton}
                style={{ backgroundColor: theme.baseBackgroundL0.val }}
              />
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
            <YStack>
              <ConfirmSwapButton onPress={onSubmit} />
            </YStack>
          </div>
        </div>
      </form>
      {submitted ? (
        <SwapConfirmationDrawer
          onViewBalances={() => onViewBalances()}
          onCancel={() => {
            setSubmitted(false);
          }}
          onClose={() => {
            setSubmitted(false);
            close();
          }}
        />
      ) : null}
    </>
  );
}

const SwapConfirmationDrawer: React.FC<{
  onViewBalances: () => void;
  onCancel: () => void;
  onClose: () => void;
}> = ({ onCancel, onClose, onViewBalances }) => {
  const active = useActiveWallet();
  const { executeSwap } = useSwapContext();
  const apollo = useApolloClient();
  const solanaClient = useRecoilValue(solanaClientAtom);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [swapState, setSwapState] = useState(SwapState.CONFIRMING);

  const close = () => {
    onClose();
    setOpenDrawer(false);
  };

  const cancel = () => {
    onCancel();
    setOpenDrawer(false);
  };

  const submit = async () => {
    try {
      setOpenDrawer(true);
      const signature = await executeSwap(false);

      await solanaClient!.confirmTransaction(signature);

      // Allow asynchronous refetch without awaiting to unblock UI interactions
      await wait(2);
      await apollo.query({
        query: GET_TOKEN_BALANCES_QUERY,
        fetchPolicy: "network-only",
        variables: {
          address: active.publicKey,
          providerId: active.blockchain.toUpperCase() as ProviderId,
        },
      });
      setSwapState(SwapState.CONFIRMED);
    } catch (e) {
      const error = e as Error | undefined;
      if (error?.message?.includes("Quote Expired")) {
        // when quote expired, resend the current quote
        submit().catch((e) => console.error(e));
      } else if (
        error?.message?.includes("Approval Denied") ||
        error?.message?.includes("Closed")
      ) {
        // close when user rejected / closed drawer
        cancel();
        setOpenDrawer(false);
      } else {
        // show error for anything unexpected
        setSwapState(SwapState.ERROR);
      }
    }
  };

  useEffect(() => {
    // confirm immediately, user confirmation now happens via secureUI
    submit().catch((e) => console.error(e));
  }, []);

  return (
    <ApproveTransactionDrawer
      openDrawer={openDrawer}
      setOpenDrawer={setOpenDrawer}
    >
      {swapState === SwapState.CONFIRMING ? (
        <SwapConfirming isConfirmed={false} onViewBalances={onViewBalances} />
      ) : null}
      {swapState === SwapState.CONFIRMED ? (
        <SwapConfirming
          isConfirmed
          onViewBalances={() => {
            close();
            onViewBalances();
          }}
        />
      ) : null}
      {swapState === SwapState.ERROR ? (
        <SwapError error onCancel={() => close()} onRetry={submit} />
      ) : null}
    </ApproveTransactionDrawer>
  );
};

function InputTextField() {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
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
        leftLabel={t("sending")}
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
        rootClass={classes.receiveFieldRoot}
        value={fromAmount}
        setValue={setFromAmount}
        decimals={fromToken!.decimals}
        style={{
          backgroundColor: theme.baseBackgroundL0.val,
        }}
        inputProps={{
          style: {
            backgroundColor: theme.baseBackgroundL0.val,
          },
        }}
        isError={exceedsBalance}
      />
    </>
  );
}

function OutputTextField() {
  const theme = useTheme();
  const classes = useStyles();
  const { toAmount, toToken, isLoadingRoutes } = useSwapContext();
  const { t } = useTranslation();

  return (
    <>
      <TextFieldLabel leftLabel={t("receiving")} />
      <TextField
        placeholder="0"
        startAdornment={
          isLoadingRoutes ? (
            <Loading
              iconStyle={{
                display: "flex",
                color: theme.baseTextMedEmphasis.val,
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
        style={{
          backgroundColor: theme.baseBackgroundL0.val,
        }}
        inputProps={{
          style: {
            textFill: `${theme.baseTextHighEmphasis.val} !important`,
          },
        }}
      />
    </>
  );
}

const SwapUnavailableButton = () => {
  return <BpDangerButton label="Swaps unavailable" disabled />;
};

const SwapInvalidButton = () => {
  return <BpDangerButton label="Invalid swap" disabled />;
};

const InsufficientBalanceButton = () => {
  return <BpDangerButton label="Insufficient balance" disabled />;
};

const InsufficientFeeButton = () => {
  return <BpDangerButton label="Insufficient balance for fee" disabled />;
};

const ConfirmSwapButton = ({ onPress }: { onPress: () => void }) => {
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
  const { t } = useTranslation();

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
    label = t("wrap");
  } else if (fromMint === WSOL_MINT && toMint === SOL_NATIVE_MINT) {
    label = t("unwrap");
  } else {
    label = t("review");
  }

  return (
    <BpPrimaryButton
      onPress={() => {
        onPress();
      }}
      label={label}
      disabled={isIncomplete}
    />
  );
};

//
// Bottom drawer displayed so the user can confirm the swap parameters.
//

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
  const { toToken } = useSwapContext();
  const classes = useStyles();
  const { t } = useTranslation();

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
          {isConfirmed
            ? t("swap_confirmed")
            : t("swapping", {
                symbol: toToken?.ticker,
              })}
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
          <BpSecondaryButton
            onPress={() => onViewBalances()}
            label={t("view_balances")}
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
  const { t } = useTranslation();
  return (
    <BottomCard
      buttonLabel={t("retry")}
      onButtonClick={onRetry}
      cancelButtonLabel={t("back")}
      onCancelButtonClick={onCancel}
    >
      <Typography
        className={classes.confirmationTitle}
        style={{ marginTop: "40px", marginBottom: "16px" }}
      >
        {t("error")} :(
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
  const { t } = useTranslation();

  const rows: Array<SwapInfoRowProps> = [];

  if (!compact) {
    rows.push({ label: t("you_pay"), value: youPay });
  }

  rows.push({ label: t("rate"), value: rate });
  rows.push({
    label: t("estimated_fees"),
    value: networkFee,
    // @ts-expect-error - tooltip expects a string, but JSX works for now
    tooltip:
      transactionFees?.fees || swapFee?.feeBps ? (
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
            {swapFee?.feeBps ? (
              <tr>
                <td colSpan={2} style={{ opacity: 0.5 }}>
                  {t("swap_fees_warning", { pct: swapFee.feeBps / 100 })}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      ) : null,
  });
  rows.push({ label: t("price_impact"), value: priceImpact });

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
  const theme = useTheme();

  return (
    <InputAdornment position="end">
      <XnftButton
        onClick={() => push()}
        style={{
          backgroundColor: theme.baseBackgroundL0.val,
          width: "auto",
          justifyContent: "right",
          marginRight: "-14px",
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
  const theme = useTheme();
  const { t } = useTranslation();

  const { fromTokens, toTokens, setFromMint, setToMint } = useSwapContext();
  const setMint = isFromMint ? setFromMint : setToMint;

  useEffect(() => {
    nav.setOptions({
      headerTitle: t("select_token"),
      // style: isDark ? { background: theme.baseBackgroundL1.val } : undefined,
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
