import type { Blockchain } from "@coral-xyz/common";
import { toTitleCase, walletAddressDisplay } from "@coral-xyz/common";
import { ProxyImage } from "@coral-xyz/react-common";
import { useActiveWallets, useBlockchainLogo } from "@coral-xyz/recoil";
import { styled, useCustomTheme } from "@coral-xyz/themes";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { CardHeader, Typography } from "@mui/material";

import { Button } from "../../../../plugin";

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
    <Button
      fullWidth={true}
      style={{
        width: "100%",
        borderRadius: 0,
        padding: 0,
      }}
    >
      <StyledCardHeader
        onClick={() => setShowContent(!showContent)}
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
              <Title>{title}</Title>
              {wallet && (
                <Wallet>{walletAddressDisplay(wallet.publicKey)}</Wallet>
              )}
            </div>
            {showContent ? <StyledExpandLess /> : <StyledExpandMore />}
          </div>
        }
      />
    </Button>
  );
}
const StyledExpandLess = styled(ExpandLess)(({ theme }) => ({
  width: "18px",
  color: theme.custom.colors.secondary,
}));

const StyledExpandMore = styled(ExpandMore)(({ theme }) => ({
  width: "18px",
  color: theme.custom.colors.secondary,
}));

const Title = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  lineHeight: "24px",
  fontSize: "14px",
  display: "flex",
  justifyContent: "center",
  flexDirection: "column",
  marginLeft: "0px",
  color: theme.custom.colors.fontColor,
}));
const Wallet = styled(Typography)(({ theme }) => ({
  color: theme.custom.colors.secondary,
  textTransform: "none",
  fontWeight: 500,
  lineHeight: "24px",
  fontSize: "14px",
  marginLeft: "8px",
}));

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  padding: "6px 16px",
  cursor: "pointer",
  width: "100%",
}));
