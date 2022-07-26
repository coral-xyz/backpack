import { useState } from "react";
import {
  InputAdornment,
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
import { WithMiniDrawer, useDrawerContext } from "../Layout/Drawer";
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
  paperAnchorBottom: {
    height: "402px",
  },
  confirmationTitle: {
    color: theme.custom.colors.secondary,
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: "20px",
    marginTop: "32px",
    textAlign: "center",
  },
  confirmationAmount: {
    color: theme.custom.colors.fontColor,
    fontSize: "24px",
    fontWeight: 500,
    lineHeight: "32px",
    marginTop: "8px",
    textAlign: "center",
    marginBottom: "38px",
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
    fromMintInfo,
    toMint,
    toMintInfo,
    swapToFromMints,
    executeSwap,
    route,
    isLoadingRoutes,
    transactions,
    isLoadingTransactions,
  } = useSwapContext();
  const fromTokenData = useBlockchainTokenAccount(blockchain, fromToken);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [isConfirmingSwap, setIsConfirmingSwap] = useState(false);

  const onConfirm = async () => {
    setIsConfirmingSwap(true);
    const result = await executeSwap();
    setIsConfirmingSwap(false);
    setOpenDrawer(false);
    console.log("result", result);
    // todo: do something with the swap here.
  };

  const onSwapButtonClick = () => {
    if (openDrawer) {
      setOpenDrawer(false);
    } else {
      swapToFromMints();
    }
  };

  console.log(transactions);

  const swapInfoRows = toAmount
    ? [
        [
          "Rate",
          `1 ${fromMintInfo.symbol} ≈ ${(toAmount / fromAmount).toFixed(4)} ${
            toMintInfo.symbol
          }`,
        ],
        ["Network Fee", `${transactions ? transactions.length : "-"}`],
        [
          "Price Impact",
          `${route.priceImpactPct > 0.5 ? route.priceImpactPct : "< 0.5"}%`,
        ],
      ]
    : [];

  return (
    <div className={classes.container}>
      <div className={classes.topHalf}>
        <SwapTokensButton
          isLoading={isConfirmingSwap}
          onClick={onSwapButtonClick}
          isSwap={!openDrawer}
        />
        <TextFieldLabel
          leftLabel={"You Pay"}
          rightLabel={`Max: ${
            fromTokenData ? fromTokenData.nativeBalance.toString() : "-"
          }`}
        />
        <TextField
          startAd
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
              endAdornment={
                <TokenSelectorButton
                  blockchain={blockchain}
                  mint={toMint}
                  isFrom={false}
                />
              }
              rootClass={classes.receiveFieldRoot}
              type={"number"}
              value={toAmount}
              disabled={true}
              inputProps={{
                style: {
                  textFill: `${theme.custom.colors.fontColor} !important`,
                },
              }}
            />
            {swapInfoRows && (
              <div
                style={{
                  marginTop: "24px",
                  marginLeft: "8px",
                  marginRight: "8px",
                }}
              >
                <SwapInfo rows={swapInfoRows} />
              </div>
            )}
          </div>
          <div>
            {cancel && <DangerButton onClick={onCancel} />}
            <PrimaryButton
              label="Review"
              onClick={() => setOpenDrawer(true)}
              disabled={!fromAmount || !toAmount}
            />
          </div>
        </div>
      </div>
      <WithMiniDrawer
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
        paperAnchorBottom={classes.paperAnchorBottom}
      >
        <SwapConfirmation onConfirm={onConfirm} />
      </WithMiniDrawer>
    </div>
  );
}

function SwapConfirmation({ onConfirm }: any) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const { fromAmount, toAmount, fromMintInfo, toMintInfo, route } =
    useSwapContext();
  const rate = toAmount! / fromAmount;
  const rows = [
    ["You Pay", `${fromAmount} ${fromMintInfo.symbol}`],
    [
      "Rate",
      `1 ${fromMintInfo.symbol} = ${rate.toFixed(4)} ${toMintInfo.symbol}`,
    ],
    ["Network Fee", "-"], // todo
    [
      "Backpack Fee",
      <span style={{ color: theme.custom.colors.secondary }}>FREE</span>,
    ],
    [
      "Price Impact",
      `${route.priceImpactPct > 0.5 ? route.priceImpactPct : "< 0.5"}%`,
    ],
  ];
  const logoUri = toMintInfo ? toMintInfo.logoURI : "-";

  return (
    <BottomCard onButtonClick={onConfirm} buttonLabel={"Confirm"}>
      <Typography className={classes.confirmationTitle}>You Receive</Typography>
      <Typography className={classes.confirmationAmount}>
        <img className={classes.tokenLogo} src={logoUri} />
        {toAmount}{" "}
        <span style={{ color: theme.custom.colors.secondary }}>
          {toMintInfo?.symbol}
        </span>
      </Typography>
      <div style={{ margin: "24px" }}>
        <SwapInfo rows={rows} />
      </div>
    </BottomCard>
  );
}

function SwapInfo({ rows }: any) {
  const classes = useStyles();
  return rows.map((r: any) => (
    <div className={classes.swapInfoRow} key={r[0]}>
      <Typography className={classes.swapInfoTitleLeft}>{r[0]}</Typography>
      <Typography className={classes.swapInfoTitleRight}>{r[1]}</Typography>
    </div>
  ));
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
  const { setFromMint, setToMint } = useSwapContext();
  const tokenInfo = tokenRegistry.get(mint); // todo handle null case
  const symbol = tokenInfo ? tokenInfo.symbol : "-";
  const logoUri = tokenInfo ? tokenInfo.logoURI : "-";

  const setMint = isFrom ? setFromMint : setToMint;
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
              component: (props: any) => <SelectToken {...props} />,
              props: {
                setMint,
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

function SelectToken({
  setMint,
  customFilter,
}: {
  setMint: (mint: string) => void;
  customFilter: (token: Token) => boolean;
}) {
  const { close } = useDrawerContext();

  const onClickRow = (_blockchain: Blockchain, token: Token) => {
    setMint(token.mint);
    close();
  };

  return (
    <SearchableTokenTable onClickRow={onClickRow} customFilter={customFilter} />
  );
}
