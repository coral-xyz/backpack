import { type ChangeEvent,useRef } from "react";
import type { Blockchain } from "@coral-xyz/common";
import {
  decimalNumberStringIntoBigNumber,
  toDisplayBalance,
} from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  CheckIcon,
  CrossIcon,
  Loading,
  PrimaryButton,
  SecondaryButton,
} from "@coral-xyz/react-common";
import {
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
} from "@coral-xyz/recoil";
import { explorerUrl } from "@coral-xyz/secure-background/legacyCommon";
import {
  temporarilyMakeStylesForBrowserExtension,
  useAutoFocusDelay,
  useTheme,
} from "@coral-xyz/tamagui";
import { Typography } from "@mui/material";
import { useNavigation } from "@react-navigation/native";
import type { BigNumber } from "ethers";

import { TokenAmountHeader } from "../../../common/TokenAmountHeader";

export const useStyles = temporarilyMakeStylesForBrowserExtension((theme) => ({
  topImageOuter: {
    width: 80,
    height: 80,
  },
  horizontalCenter: {
    display: "flex",
    justifyContent: "center",
  },
  container: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  topHalf: {
    paddingTop: "24px",
    flex: 1,
  },
  textRoot: {
    marginTop: "0 !important",
    marginBottom: "0 !important",
    "& .MuiOutlinedInput-root": {
      backgroundColor: `${theme.custom?.colors.nav} !important`,
    },
  },
}));

export function MaxAmountButton({
  decimals,
  ticker,
  maxAmount,
  setStrAmount,
  setAmount,
}: {
  decimals: number;
  ticker?: string;
  maxAmount: BigNumber;
  setStrAmount: (strAmount: string) => void;
  setAmount: (amount: BigNumber | null) => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <div
      style={{
        display: "inline-flex",
        color: theme.baseTextHighEmphasis.val,
        cursor: "pointer",
        fontSize: 14,
        border: `2px solid ${theme.baseBackgroundL2.val}`,
        padding: "4px 12px",
        borderRadius: 8,
        marginTop: 5,
        background: theme.baseBackgroundL2.val,
      }}
      onClick={() => {
        const a = toDisplayBalance(maxAmount, decimals);
        setStrAmount(a);
        setAmount(maxAmount);
      }}
    >
      {t("max")}:{" "}
      {[toDisplayBalance(maxAmount, decimals), ticker]
        .filter(Boolean)
        .join(" ")}
    </div>
  );
}

export function LargeNumericInput({
  decimals = 9,
  strAmount,
  setStrAmount,
  setAmount,
}: {
  decimals?: number;
  strAmount: string;
  setStrAmount: (amount: string) => void;
  setAmount: (amount: BigNumber | null) => void;
}) {
  const theme = useTheme();
  const ref = useRef(null);

  // TODO: if this is ever rewritten, try to remove this third 400ms delay
  //       param (or even better, remove the hook, but not holding my breath
  //       for the removal).
  useAutoFocusDelay(ref, true, 400);

  return (
    <input
      ref={ref}
      placeholder="0"
      type="text"
      style={{
        marginTop: "40px",
        outline: "none",
        background: "transparent",
        border: "none",
        fontWeight: 600,
        fontSize: 48,
        height: 48,
        color: theme.baseTextHighEmphasis.val,
        textAlign: "center",
        width: "100%",
        fontFamily: "Inter, sans-serif",
      }}
      value={strAmount}
      onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
        decimalNumberStringIntoBigNumber({
          strAmount: value,
          setStrAmount,
          tokenDecimals: decimals,
          setAmount,
        });
      }}
    />
  );
}

export function Sending({
  blockchain,
  amount,
  token,
  signature,
  isComplete,
  titleOverride,
  onViewBalances,
}: {
  blockchain: Blockchain;
  amount: BigNumber;
  token: any;
  signature?: string;
  isComplete: boolean;
  titleOverride?: string;
  onViewBalances?: () => void;
}) {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const explorer = useBlockchainExplorer(blockchain);
  const connectionUrl = useBlockchainConnectionUrl(blockchain);
  const { t } = useTranslation();
  return (
    <div
      style={{
        height: "264px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", marginTop: "30px" }}>
          <Typography
            style={{
              textAlign: "center",
              color: theme.baseTextMedEmphasis.val,
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            {titleOverride
              ? titleOverride
              : isComplete
              ? t("sent")
              : t("sending_dots")}
          </Typography>
          {isComplete ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                marginLeft: "8px",
              }}
            >
              <CheckIcon style={{ height: "16px", width: "16px" }} />
            </div>
          ) : null}
        </div>
        <div style={{ flex: 1 }} />
      </div>
      <TokenAmountHeader
        style={{
          marginTop: "16px",
          marginBottom: "0px",
        }}
        amount={amount}
        token={token}
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        {!isComplete ? (
          <Loading
            size={48}
            iconStyle={{
              color: theme.baseTextHighEmphasis.val,
              display: "flex",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />
        ) : null}
      </div>
      <div
        style={{
          marginBottom: "16px",
          marginLeft: "16px",
          marginRight: "16px",
        }}
      >
        {signature && explorer && connectionUrl && isComplete ? (
          <PrimaryButton
            onClick={async () => {
              navigation.popToTop();
              navigation.popToTop();
              if (onViewBalances) onViewBalances();
            }}
            label={t("view_balances")}
            style={{
              marginBottom: "8px",
            }}
          />
        ) : null}
        {signature && explorer && connectionUrl ? (
          <SecondaryButton
            onClick={async () => {
              window.open(explorerUrl(explorer, signature, connectionUrl));
            }}
            label={t("view_explorer")}
          />
        ) : null}
      </div>
    </div>
  );
}

export function Error({
  blockchain,
  signature,
  onRetry,
  error,
}: {
  blockchain: Blockchain;
  signature: string;
  error: string;
  onRetry: () => void;
}) {
  const explorer = useBlockchainExplorer(blockchain);
  const connectionUrl = useBlockchainConnectionUrl(blockchain);
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <div
      style={{
        height: "340px",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        padding: "16px",
      }}
    >
      <div
        style={{
          marginTop: "8px",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        <Typography
          style={{
            marginBottom: "16px",
            color: theme.baseTextHighEmphasis.val,
          }}
        >
          {t("error")}
        </Typography>
        <div
          style={{
            height: "48px",
          }}
        >
          <CrossIcon />
        </div>
        <Typography
          style={{
            marginTop: "16px",
            marginBottom: "16px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: theme.baseTextHighEmphasis.val,
          }}
        >
          {error}
        </Typography>
        {explorer && connectionUrl && signature ? (
          <SecondaryButton
            style={{
              height: "40px",
              width: "147px",
            }}
            buttonLabelStyle={{
              fontSize: "14px",
            }}
            label={t("view_explorer")}
            onClick={() =>
              window.open(
                explorerUrl(explorer, signature, connectionUrl),
                "_blank"
              )
            }
          />
        ) : null}
      </div>
      <PrimaryButton label={t("retry")} onClick={() => onRetry()} />
    </div>
  );
}
