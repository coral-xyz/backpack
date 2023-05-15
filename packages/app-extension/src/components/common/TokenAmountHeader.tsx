import { toDisplayBalance } from "@coral-xyz/common";
import { ProxyImage } from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";
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
    listPrice?: number; //listed or not
    name?: string;
  };
  amount: BigNumber;
  displayLogo?: boolean;
}> = ({ style, token, amount, displayLogo = true }) => {
  const theme = useCustomTheme();

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
        justifyContent: "center",
        width: "100%",
        ...style,
      }}
    >
      {/* Dummy padding to center flex content */}
      {/* <div style={{ flex: 1 }} /> */}
      {displayLogo && !(token?.decimals === 0) ? (
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
      {!(token?.decimals === 0) ? (
        <div>
          <Typography
            style={{
              color: theme.custom.colors.fontColor,
              fontWeight: 500,
              fontSize: "30px",
              lineHeight: "36px",
              textAlign: "center",
              display: "flex",
            }}
          >
            {maybeTruncatedAmount}
            <span
              style={{
                marginLeft: "8px",
                color: theme.custom.colors.secondary,
              }}
            >
              {token.ticker}
            </span>
          </Typography>
        </div>
      ) : null}

      {/* Dummy padding to center flex content */}
      {/* <div style={{ flex: 1 }} /> */}
      {displayLogo && token?.decimals === 0 ? (
        <NonFungibleTokenHeader token={token} />
      ) : null}
    </div>
  );
};

// displays header for nfts/sfts
export function NonFungibleTokenHeader({
  token,
  style,
}: {
  token: any;
  style?: React.CSSProperties;
}) {
  const theme = useCustomTheme();
  return (
    <div style={{ ...style }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          marginRight: "8px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <ProxyImage
            src={token.logo}
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "10px",
            }}
            removeOnError
          />
        </div>
        <div style={{ color: theme.custom.colors.fontColor, margin: "15px 0" }}>
          <Typography
            style={{
              color: theme.custom.colors.fontColor,
              fontWeight: 500,
              fontSize: "18px",
              lineHeight: "24px",
              textAlign: "center",
            }}
          >
            {token?.name}
          </Typography>
        </div>
        {token?.listPrice ? (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <ProxyImage
              src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png" //SOLANA ONLY
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "16px",
              }}
              removeOnError
            />
            <Typography
              style={{
                color: theme.custom.colors.fontColor3,
                fontWeight: 500,
                fontSize: "18px",
                margin: "auto 12px",
                lineHeight: "24px",
                textAlign: "center",
              }}
            >
              {token?.listPrice}
            </Typography>
          </div>
        ) : null}
      </div>
    </div>
  );
}
