import { useEffect, useState } from "react";
import { useApolloClient } from "@apollo/client";
import { UNKNOWN_ICON_SRC, wait } from "@coral-xyz/common";
import {
  GET_TOKEN_BALANCES_QUERY,
  type ProviderId,
} from "@coral-xyz/data-components";
import { useTranslation } from "@coral-xyz/i18n";
import { CheckIcon, CrossIcon, Loading } from "@coral-xyz/react-common";
import type { SwapQuoteResponse } from "@coral-xyz/recoil";
import {
  solanaClientAtom,
  SwapState,
  useActiveWallet,
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
  useToToken,
} from "@coral-xyz/recoil";
import { explorerUrl } from "@coral-xyz/secure-background/legacyCommon";
import {
  BpPrimaryButton,
  BpSecondaryButton,
  temporarilyMakeStylesForBrowserExtension,
  YStack,
} from "@coral-xyz/tamagui";
import { Typography } from "@mui/material";
import { BigNumber } from "ethers";
import { useRecoilValue } from "recoil";

import { BottomCard } from "../../../../components/common/Layout/BottomCard";
import { TokenAmountHeader } from "../../../../components/common/TokenAmountHeader";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type { SwapConfirmationScreenProps } from "../../../navigation/SwapNavigator";

import { SwapQuoteResponseFormatter, useSwapContext } from "./Context";

export function SwapConfirmationScreen(props: SwapConfirmationScreenProps) {
  return (
    <ScreenContainer loading={<LoadingContainer />}>
      <Container {...props} />
    </ScreenContainer>
  );
}

function LoadingContainer() {
  return null;
}

function Container({ route, navigation }: SwapConfirmationScreenProps) {
  const { signature, quoteResponse } = route.params;

  const { t } = useTranslation();
  const active = useActiveWallet();
  const apollo = useApolloClient();
  const solanaClient = useRecoilValue(solanaClientAtom);
  const { to } = useSwapContext();
  const explorer = useBlockchainExplorer(to!.blockchain);
  const connectionUrl = useBlockchainConnectionUrl(to!.blockchain);
  const [swapState, setSwapState] = useState(SwapState.CONFIRMING);

  const onViewBalances = () => {
    navigation.popToTop();
    navigation.popToTop();
  };
  const onViewExplorer = () => {
    const url = explorerUrl(explorer, signature!, connectionUrl);
    window.open(url);
    navigation.popToTop();
    navigation.popToTop();
  };

  const confirmTx = async () => {
    try {
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
        navigation.pop();
      } else if (
        error?.message?.includes("Approval Denied") ||
        error?.message?.includes("Closed")
      ) {
        navigation.pop();
      } else {
        // show error for anything unexpected
        setSwapState(SwapState.ERROR);
      }
    }
  };

  useEffect(() => {
    // confirm immediately, user confirmation now happens via secureUI
    confirmTx().catch((e) => console.error(e));
  }, []);

  return (
    <YStack jc="space-between" height="100%">
      {swapState === SwapState.CONFIRMING ? (
        <SwapConfirming isConfirmed={false} quoteResponse={quoteResponse} />
      ) : swapState === SwapState.CONFIRMED ? (
        <SwapConfirming isConfirmed quoteResponse={quoteResponse} />
      ) : swapState === SwapState.ERROR ? (
        <SwapError />
      ) : null}
      <YStack
        space="$3"
        style={{
          marginBottom: "24px",
          marginLeft: "16px",
          marginRight: "16px",
        }}
      >
        {swapState === SwapState.ERROR ? (
          <BpPrimaryButton
            onPress={() => {
              navigation.pop();
            }}
            label={t("retry")}
          />
        ) : signature ? (
          <BpPrimaryButton
            onPress={onViewExplorer}
            label={t("view_explorer")}
          />
        ) : null}
        <BpSecondaryButton
          onPress={onViewBalances}
          label={t("view_balances")}
        />
      </YStack>
    </YStack>
  );
}

//
// Bottom drawer displayed so the user can confirm the swap parameters.
//

//
// Bottom card that is displayed while the swap is confirming (i.e. transactions
// are being submitted/confirmed)
//
function SwapConfirming({
  isConfirmed,
  quoteResponse,
}: {
  isConfirmed: boolean;
  quoteResponse: SwapQuoteResponse;
}) {
  const { from, to } = useSwapContext();
  const { toToken } = useToToken({ from, to });
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
                symbol: toToken?.tokenListEntry?.symbol,
              })}
        </Typography>
        <div style={{ marginTop: "8px", marginBottom: "16px" }}>
          <SwapReceiveAmount quoteResponse={quoteResponse} />
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
    </div>
  );
}

function SwapReceiveAmount({
  quoteResponse,
}: {
  quoteResponse: SwapQuoteResponse;
}) {
  const { to, from } = useSwapContext();
  const { toToken, isLoading: isLoadingToToken } = useToToken({ to, from });
  const quoteResponseFormatter = new SwapQuoteResponseFormatter(quoteResponse);
  return (
    <TokenAmountHeader
      displayLogo={!isLoadingToToken}
      token={{
        logo: toToken?.tokenListEntry?.logo ?? UNKNOWN_ICON_SRC,
        ticker: toToken?.tokenListEntry?.symbol,
        decimals: toToken?.tokenListEntry?.decimals ?? 0,
      }}
      amount={quoteResponseFormatter?.outAmountBigNumber() ?? BigNumber.from(0)}
    />
  );
}

//
// Bottom card displayed on swap error.
//
function SwapError() {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <BottomCard>
      <Typography
        className={classes.confirmationTitle}
        style={{ marginTop: "40px", marginBottom: "16px" }}
      >
        {t("error")}
      </Typography>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <CrossIcon />
      </div>
    </BottomCard>
  );
}

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
