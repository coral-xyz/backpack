import { useEffect, useState } from "react";
import {
  Blockchain,
  ETH_NATIVE_MINT,
  SOL_NATIVE_MINT,
  toDisplayBalance,
  WSOL_MINT,
} from "@coral-xyz/common";
import {
  CheckIcon,
  CrossIcon,
  DangerButton,
  Loading,
  PrimaryButton,
  SecondaryButton,
} from "@coral-xyz/react-common";
import {
  isAggregateWallets,
  useJupiterOutputMints,
  useSplTokenRegistry,
  useSwapContext,
  useWalletName,
} from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { ExpandMore, SwapVert } from "@mui/icons-material";
import type { Button } from "@mui/material";
import { IconButton, InputAdornment, Typography } from "@mui/material";
import { ethers, FixedNumber } from "ethers";
import { useRecoilValue } from "recoil";

import { Button as XnftButton } from "../../plugin/Component";
import { TextField, TextFieldLabel } from "../common";
import { ApproveTransactionDrawer } from "../common/ApproveTransactionDrawer";
import { BottomCard } from "../common/Layout/BottomCard";
import { useDrawerContext } from "../common/Layout/Drawer";
import { useNavStack } from "../common/Layout/NavStack";
import { MaxLabel } from "../common/MaxLabel";
import { TokenAmountHeader } from "../common/TokenAmountHeader";
import { TokenInputField } from "../common/TokenInput";
import type { Token } from "../common/TokenTable";
import { SearchableTokenTable } from "../common/TokenTable";

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
  const nav = useNavStack();
  useEffect(() => {
    nav.setTitle("Swap");
  }, [nav]);

  if (blockchain && blockchain !== Blockchain.SOLANA) {
    throw new Error("only Solana swaps are supported currently");
  }

  return <_Swap blockchain={blockchain ?? Blockchain.SOLANA} />;
}

function _Swap({ blockchain }: { blockchain: Blockchain }) {
  const classes = useStyles();
  const { toAmount, swapToFromMints } = useSwapContext();
  const [openDrawer, setOpenDrawer] = useState(false);
  const { close } = useDrawerContext();

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
            <ConfirmSwapButton type="submit" blockchain={blockchain} />
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
      {swapState === SwapState.CONFIRMATION && (
        <SwapConfirmation onConfirm={onConfirm} />
      )}
      {swapState === SwapState.CONFIRMING && (
        <SwapConfirming isConfirmed={false} onViewBalances={onViewBalances} />
      )}
      {swapState === SwapState.CONFIRMED && (
        <SwapConfirming isConfirmed={true} onViewBalances={onViewBalances} />
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
        leftLabel={"Sending"}
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
      <TextFieldLabel leftLabel={"Receiving"} />
      <TextField
        placeholder={"0"}
        startAdornment={
          isLoadingRoutes && (
            <Loading
              iconStyle={{
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

const SwapInvalidButton = () => {
  return <DangerButton label="Invalid swap" disabled={true} />;
};

const InsufficientBalanceButton = () => {
  return <DangerButton label="Insufficient balance" disabled={true} />;
};

const ConfirmSwapButton = ({
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
  const tokenAccounts = useJupiterOutputMints(fromMint);

  if (fromMint === toMint) {
    return <SwapInvalidButton />;
  } else if (exceedsBalance) {
    return <InsufficientBalanceButton />;
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
      {isConfirmed && (
        <div
          style={{
            marginBottom: "16px",
            marginLeft: "16px",
            marginRight: "16px",
          }}
        >
          <SecondaryButton
            onClick={() => onViewBalances()}
            label={"View Balances"}
          />
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

function SwapReceiveAmount() {
  const { toAmount, toMintInfo } = useSwapContext();
  return (
    <TokenAmountHeader
      token={{
        logo: toMintInfo.logoURI,
        ticker: toMintInfo.symbol,
        decimals: toMintInfo.decimals,
      }}
      amount={toAmount!}
    />
  );
}

function SwapInfo({ compact = true }: { compact?: boolean }) {
  const {
    publicKey,
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

  const name = useWalletName(publicKey);

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

  if (!fromAmount || !toAmount) {
    return (
      <SwapInfoRows
        {...{
          compact,
          from: name,
          youPay: "-",
          rate: "-",
          priceImpact: "-",
          networkFee: "-",
        }}
      />
    );
  }

  const decimalDifference = fromMintInfo.decimals - toMintInfo.decimals;
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
        from: name,
        youPay: `${toDisplayBalance(fromAmount, fromMintInfo.decimals)} ${
          fromMintInfo.symbol
        }`,
        rate: `1 ${fromMintInfo.symbol} = ${rate} ${toMintInfo.symbol}`,
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
  from,
  youPay,
  rate,
  networkFee,
  priceImpact,
  compact,
}: {
  from: string;
  youPay: any;
  rate: any;
  priceImpact: any;
  networkFee: any;
  compact?: boolean;
}) {
  const classes = useStyles();

  const rows = [];
  rows.push(["From", from]);
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
  const { inputTokenAccounts, fromMint, setFromMint } = useSwapContext();
  return (
    <TokenSelectorButton
      selectedMint={fromMint}
      input={true}
      setMint={setFromMint}
    />
  );
}

function OutputTokenSelectorButton() {
  const { fromMint, toMint, setToMint } = useSwapContext();
  return (
    <TokenSelectorButton
      selectedMint={toMint}
      setMint={setToMint}
      input={false}
    />
  );
}

function TokenSelectorButton({ selectedMint, setMint, input }: any) {
  const classes = useStyles();
  const nav = useNavStack();
  const tokenRegistry = useSplTokenRegistry();
  const tokenInfo = tokenRegistry.get(selectedMint); // TODO handle null case
  const symbol = tokenInfo ? tokenInfo.symbol : "-";
  const logoUri = tokenInfo ? tokenInfo.logoURI : "-";

  return (
    <InputAdornment position="end">
      <XnftButton
        onClick={() =>
          nav.push("select-token", {
            setMint: (...args: any) => setMint(...args),
            input,
          })
        }
        style={{
          backgroundColor: "transparent",
        }}
      >
        <img
          className={classes.tokenLogo}
          src={logoUri}
          onError={(event) => (event.currentTarget.style.display = "none")}
        />
        <Typography className={classes.tokenSelectorButtonLabel}>
          {symbol}
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
  const nav = useNavStack();
  const { fromMint, isAggregateSwapper, publicKey, inputTokenAccounts } =
    useSwapContext();
  const tokenAccounts = !input
    ? useJupiterOutputMints(fromMint)
    : inputTokenAccounts.filter((token: Token) => {
        if (token.mint && token.mint === SOL_NATIVE_MINT) {
          return true;
        }
        if (token.address && token.address === ETH_NATIVE_MINT) {
          return true;
        }
        return !token.nativeBalance.isZero();
      });
  const walletFilter = isAggregateSwapper ? undefined : publicKey;
  const onClickRow = (_blockchain: Blockchain, token: Token) => {
    setMint(token.mint!);
    nav.pop();
  };

  useEffect(() => {
    nav.setTitle("Select Token");
  }, [nav]);

  // TODO: add an on cilck handler that changes the swap provider's publicKey.

  return (
    <SearchableTokenTable
      onClickRow={onClickRow}
      tokenAccounts={tokenAccounts}
      customFilter={customFilter}
      publicKey={walletFilter}
    />
  );
}
