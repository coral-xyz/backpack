import { toDisplayBalance } from "@coral-xyz/common";
import { ProxyImage } from "@coral-xyz/react-common";
import { useTheme } from "@coral-xyz/tamagui";
import { Typography } from "@mui/material";
import type { BigNumber } from "ethers";

//
// Displays token amount header with logo.
//
export const TokenAmountHeader: React.FC<{
  style?: React.CSSProperties;
  token: {
    logo?: string;
    ticker?: string;
    decimals: number;
  };
  amount: BigNumber;
  displayLogo?: boolean;
}> = ({ style, token, amount, displayLogo = true }) => {
  const theme = useTheme();

  const formattedAmount = toDisplayBalance(amount, token.decimals, false);
  const maxChars = displayLogo ? 10 : 12;
  const maybeTruncatedAmount =
    formattedAmount.length > maxChars
      ? formattedAmount.slice(0, maxChars) + "..."
      : formattedAmount;

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        ...style,
      }}
    >
      {/* Dummy padding to center flex content */}
      <div style={{ flex: 1 }} />
      {displayLogo ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            marginRight: "8px",
          }}
        >
          <ProxyImage
            src={token.logo}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "16px",
            }}
            removeOnError
          />
        </div>
      ) : null}
      <Typography
        style={{
          color: theme.baseTextHighEmphasis.val,
          fontWeight: 500,
          fontSize: "30px",
          lineHeight: "36px",
          textAlign: "center",
          display: "flex",
        }}
      >
        {maybeTruncatedAmount}
        <span
          style={{ marginLeft: "8px", color: theme.baseTextMedEmphasis.val }}
        >
          {token.ticker}
        </span>
      </Typography>
      {/* Dummy padding to center flex content */}
      <div style={{ flex: 1 }} />
    </div>
  );
};
