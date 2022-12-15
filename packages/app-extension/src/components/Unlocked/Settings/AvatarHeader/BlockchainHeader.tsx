import type { Blockchain } from "@coral-xyz/common";
import { toTitleCase, walletAddressDisplay } from "@coral-xyz/common";
import { useActiveWallets, useBlockchainLogo } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { CardHeader, Typography } from "@mui/material";

import { ProxyImage } from "../../../common/ProxyImage";

export function BlockchainHeader({
  setShowContent,
  showContent,
  blockchain,
}: {
  setShowContent: (showContent: boolean) => void;
  showContent: boolean;
  blockchain: Blockchain;
}) {
  const blockchainLogo = useBlockchainLogo(blockchain);
  const title = toTitleCase(blockchain);
  const theme = useCustomTheme();
  const wallets = useActiveWallets();
  const wallet = wallets.find((wallet) => wallet.blockchain === blockchain);

  return (
    <CardHeader
      onClick={() => setShowContent(!showContent)}
      style={{
        padding: "8px 16px",
        cursor: "pointer",
      }}
      avatar={
        blockchainLogo && (
          <ProxyImage
            src={blockchainLogo}
            style={{
              width: "12px",
              borderRadius: "2px",
              color: theme.custom.colors.secondary,
            }}
          />
        )
      }
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
            }}
          >
            <Typography
              style={{
                fontWeight: 500,
                lineHeight: "24px",
                fontSize: "14px",
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              {title}
            </Typography>
            {wallet && (
              <Typography
                style={{
                  fontWeight: 500,
                  lineHeight: "24px",
                  fontSize: "14px",
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  marginLeft: "8px",
                }}
              >
                {walletAddressDisplay(wallet.publicKey)}
              </Typography>
            )}
          </div>
          {showContent ? (
            <ExpandLess sx={{ width: "18px" }} />
          ) : (
            <ExpandMore sx={{ width: "18px" }} />
          )}
        </div>
      }
    />
  );
}
