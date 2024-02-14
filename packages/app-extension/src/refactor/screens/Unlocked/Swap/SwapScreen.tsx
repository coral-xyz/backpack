import { useState } from "react";
import { toDisplayBalance, UNKNOWN_ICON_SRC } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { Loading, MaxLabel, TextFieldLabel } from "@coral-xyz/react-common";
import type { CachedTokenBalance } from "@coral-xyz/recoil";
import {
  QuoteProvider,
  useAvailableForSwap,
  useDisableSwapButton,
  useExecuteSwap,
  useFromToken,
  useQuoteContext,
  useSwapContext,
  useToToken,
} from "@coral-xyz/recoil";
import {
  BpDangerButton,
  BpPrimaryButton,
  temporarilyMakeStylesForBrowserExtension,
  useTheme,
  YStack,
} from "@coral-xyz/tamagui";
import { ExpandMore, SwapVert as SwitchIcon } from "@mui/icons-material";
import Info from "@mui/icons-material/Info";
import {
  IconButton,
  InputAdornment,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import { useNavigation } from "@react-navigation/native";
import type { BigNumberish } from "ethers";
import { ethers } from "ethers";

import { TextField } from "../../../../components/common";
import { TokenInputField } from "../../../../components/common/TokenInput";
import { Button as XnftButton } from "../../../../plugin/Component";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type { SwapScreenProps } from "../../../navigation/SwapNavigator";
import { Routes } from "../../../navigation/SwapNavigator";

export function SwapScreen(_props: SwapScreenProps) {
  return (
    <ScreenContainer loading={<LoadingContainer />}>
      <Container />
    </ScreenContainer>
  );
}

function Container() {
  return <_Swap />;
}

function LoadingContainer() {
  return null;
}

function _Swap() {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className={classes.topHalf}>
        <InputTextField />
      </div>
      <SwapBottom />
    </div>
  );
}

function SwapBottom() {
  return (
    <QuoteProvider>
      <_SwapBottom />
    </QuoteProvider>
  );
}

function _SwapBottom() {
  const classes = useStyles();

  return (
    <>
      <SwitchTokensButton />
      <div className={classes.bottomHalfWrapper}>
        <div className={classes.bottomHalf}>
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
          <YStack>
            <ConfirmSwapButton />
          </YStack>
        </div>
      </div>
    </>
  );
}

function InputTextField() {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const { from, to, fromAmount, setFromAmount } = useSwapContext();
  const { isLoading: isLoadingFromToken, fromToken } = useFromToken({
    from,
    to,
  });
  const { availableForSwap, isLoading: isLoadingAvailableForSwap } =
    useAvailableForSwap({ from, to });

  const isLoading = isLoadingFromToken || isLoadingAvailableForSwap;

  return (
    <>
      <TextFieldLabel
        leftLabel={t("sending")}
        rightLabelComponent={
          isLoading ? null : (
            <MaxLabel
              amount={availableForSwap}
              onSetAmount={setFromAmount}
              decimals={fromToken?.tokenListEntry?.decimals!}
            />
          )
        }
      />
      <TokenInputField
        type="number"
        placeholder="0"
        endAdornment={<InputTokenSelectorButton />}
        rootClass={classes.receiveFieldRoot}
        value={fromAmount}
        setValue={setFromAmount}
        decimals={fromToken?.tokenListEntry?.decimals}
        style={{
          backgroundColor: theme.baseBackgroundL0.val,
        }}
        inputProps={{
          style: {
            backgroundColor: theme.baseBackgroundL0.val,
          },
        }}
        isError={
          fromAmount && availableForSwap
            ? fromAmount.gt(availableForSwap)
            : undefined
        }
      />
    </>
  );
}

function OutputTextField() {
  const { t } = useTranslation();
  const theme = useTheme();
  const classes = useStyles();
  const { to, from, fromAmount } = useSwapContext();
  const {
    quoteResponseFormatter,
    isLoading: isLoadingQuote,
    isError: _isErrorQuote,
  } = useQuoteContext();
  const { toToken, isLoading: isLoadingToToken } = useToToken({ from, to });

  const isLoading = isLoadingQuote || isLoadingToToken;
  const value =
    !fromAmount || !fromAmount.gt(0) || isLoading
      ? ""
      : quoteResponseFormatter?.outAmount(toToken!);

  //
  // When loading, don't show a number, just show the loading indicator.
  //
  const placeholder = isLoading ? "" : "0";
  const startAdornment = isLoading ? (
    <Skeleton
      height={24}
      width={40}
      style={{
        backgroundColor: theme.baseBackgroundL1.val,
        borderRadius: 8,
      }}
    />
  ) : null;

  return (
    <>
      <TextFieldLabel leftLabel={t("receiving")} />
      <TextField
        placeholder={placeholder}
        startAdornment={startAdornment}
        endAdornment={<OutputTokensSelectorButton />}
        rootClass={classes.receiveFieldRoot}
        type="number"
        value={value}
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

const ConfirmSwapButton = () => {
  const navigation = useNavigation<any /*todo*/>();
  const { t } = useTranslation();
  const { fromAmount, from, to } = useSwapContext();
  const {
    quoteResponse,
    transaction,
    isLoading: isLoadingQuote,
    isError: isErrorQuote,
  } = useQuoteContext();
  const { executeSwap } = useExecuteSwap({
    from,
    to,
    fromAmount,
    quoteResponse,
  });
  const [isExecutingSwap, setIsExecutingSwap] = useState(false);

  const onSubmit = async (e?: any) => {
    e?.preventDefault();

    if (quoteResponse === null) {
      throw new Error("no quote found");
    }

    setIsExecutingSwap(true);
    try {
      const receipt = await executeSwap(transaction ?? undefined);
      navigation.push(Routes.SwapConfirmationScreen, {
        receipt,
        quoteResponse,
      });
    } catch (e) {
      //
    }
    setIsExecutingSwap(false);
  };

  if (isErrorQuote) {
    return <BpDangerButton label="Swaps unavailable" disabled />;
  }

  return (
    <BpPrimaryButton
      onPress={onSubmit}
      label={t("review")}
      disabled={!fromAmount || isLoadingQuote || quoteResponse === null}
      loading={isExecutingSwap}
    />
  );
};

function SwapInfo() {
  const compact = true;
  const { fromAmount, from, to } = useSwapContext();
  const {
    quoteResponseFormatter,
    isLoading: isLoadingQuote,
    isError: _isErrorQuote,
  } = useQuoteContext();
  const { isLoading: isLoadingFromToken, fromToken } = useFromToken({
    from,
    to,
  });
  const { isLoading: isLoadingToToken, toToken } = useToToken({ from, to });

  const toAmount = quoteResponseFormatter?.outAmountBigNumber();
  const isLoading = isLoadingQuote || isLoadingFromToken || isLoadingToToken;

  if (
    !fromToken ||
    !toToken ||
    !fromAmount ||
    !toAmount ||
    fromAmount.eq(0) ||
    toAmount.eq(0)
  ) {
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

  // Loading indicator when routes are being loaded due to polling
  if (isLoading) {
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

  const rate = quoteResponseFormatter?.exchangeRate({
    fromAmount,
    toAmount,
    fromToken,
    toToken,
  });
  const priceImpact = quoteResponseFormatter?.priceImpact();
  const swapFee = quoteResponseFormatter?.swapFee();
  const networkFee = quoteResponseFormatter?.networkFee();

  return (
    <SwapInfoRows
      {...{
        compact,
        youPay: `${toDisplayBalance(
          fromAmount!,
          fromToken.tokenListEntry!.decimals
        )} ${fromToken.tokenListEntry!.symbol}`,
        rate: `1 ${fromToken.tokenListEntry!.symbol} ≈ ${rate?.substring(
          0,
          10
        )} ${toToken.tokenListEntry?.symbol}`,
        priceImpact: `${priceImpact}`,
        networkFee: networkFee ?? "-",
        swapFee,
      }}
    />
  );
}

function SwitchTokensButton() {
  const classes = useStyles();
  const { swapToFrom } = useSwapContext();
  const { quoteResponseFormatter } = useQuoteContext();
  const toAmount = quoteResponseFormatter?.outAmountBigNumber();
  const disableSwapBtn = useDisableSwapButton();

  return (
    <div className={classes.switchTokensContainer}>
      <IconButton
        disableRipple
        className={classes.switchTokensButton}
        onClick={() => swapToFrom(toAmount ?? null)}
        disabled={disableSwapBtn}
      >
        <SwitchIcon className={classes.switchIcon} />
      </IconButton>
    </div>
  );
}

function InputTokenSelectorButton() {
  const { from, to } = useSwapContext();
  const { isLoading, fromToken } = useFromToken({ from, to });

  return (
    <TokenSelectorButton
      isLoading={isLoading}
      token={fromToken!}
      input
      isFromMint
    />
  );
}

function OutputTokensSelectorButton() {
  const { from, to } = useSwapContext();
  const { isLoading, toToken } = useToToken({ from, to });

  return (
    <TokenSelectorButton
      token={toToken}
      input={false}
      isFromMint={false}
      isLoading={isLoading}
    />
  );
}

function TokenSelectorButton({
  token,
  input,
  isFromMint,
  isLoading,
}: {
  token: CachedTokenBalance | null;
  input: boolean;
  isFromMint: boolean;
  isLoading?: boolean;
}) {
  const nav = useNavigation<any>();
  return (
    <_TokenSelectorButton
      isLoading={isLoading}
      token={token}
      push={() => {
        nav.push(Routes.SwapTokenSelectScreen, {
          isFromMint,
          input,
        });
      }}
    />
  );
}

function _TokenSelectorButton({
  token,
  push,
  isLoading,
}: {
  token?: CachedTokenBalance | null;
  push: () => void;
  isLoading?: boolean;
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
        {isLoading ? (
          <Skeleton
            height={24}
            width={50}
            style={{
              backgroundColor: theme.baseBackgroundL1.val,
              borderRadius: 8,
            }}
          />
        ) : (
          <>
            {token ? (
              <img
                className={classes.tokenLogo}
                src={token?.tokenListEntry?.logo ?? UNKNOWN_ICON_SRC}
                onError={(event) =>
                  (event.currentTarget.style.display = "none")
                }
              />
            ) : null}
            <Typography
              className={classes.tokenSelectorButtonLabel}
              style={{
                color: token
                  ? theme.baseTextHighEmphasis.val
                  : theme.baseTextMedEmphasis.val,
              }}
            >
              {token ? token?.tokenListEntry?.symbol : "Select"}
            </Typography>
          </>
        )}
        <ExpandMore className={classes.expandMore} />
      </XnftButton>
    </InputAdornment>
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
}: {
  youPay: any;
  rate: any;
  priceImpact: any;
  networkFee: string;
  compact?: boolean;
  swapFee?: any;
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
    tooltip: swapFee?.feeBps ? (
      <table className={classes.feesTooltipTable}>
        <tbody>
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

/**
 * Hides miniscule amounts of SOL
 * @example approximateAmount(0.00203928) = "0.002"
 * @param value BigNumberish amount of Solana Lamports
 */
export const approximateAmount = (value: BigNumberish, decimals = 5) => {
  const numStr = ethers.utils.formatUnits(value, 9);

  if (!numStr.includes(".")) {
    return numStr; // No decimal point, return as is
  }

  const [integerPart, decimalPart] = numStr.split(".");

  // Truncate to 5 digits or to the first non-zero after 5 digits
  let truncatedDecimal = decimalPart.slice(0, decimals);
  const remainingDecimal = decimalPart.slice(decimals);

  if (truncatedDecimal.match(/^0*$/)) {
    // Find the first non-zero digit after the 5th decimal
    const match = remainingDecimal.match(/[^0]/);
    if (match) {
      truncatedDecimal += remainingDecimal.slice(
        0,
        remainingDecimal.indexOf(match[0]) + 1
      );
    }
  }

  // Remove trailing zeros and decimal point if necessary
  truncatedDecimal = truncatedDecimal.replace(/0+$/, "");
  if (truncatedDecimal === "") {
    return integerPart;
  }

  return `${integerPart}.${truncatedDecimal}`;
};

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
    display: "flex",
    flexDirection: "column",
  },
  bottomHalf: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    margin: "0 16px 16px 16px",
    height: "100%",
    flex: 1,
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
