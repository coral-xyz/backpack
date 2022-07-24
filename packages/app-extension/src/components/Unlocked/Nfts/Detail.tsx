import { useEffect } from "react";
import { Typography } from "@mui/material";
import { useCustomTheme } from "@coral-xyz/themes";
import { useNftMetadata, useNavigation } from "@coral-xyz/recoil";

export function NftsDetail({ publicKey }: { publicKey: string }) {
  const theme = useCustomTheme();
  const nav = useNavigation();
  const nfts = useNftMetadata();
  const nft = nfts.get(publicKey);

  if (!publicKey) {
    return <></>;
  }

  return (
    <div
      style={{
        marginTop: "4px",
        paddingLeft: "16px",
        paddingRight: "16px",
      }}
    >
      <img
        style={{
          width: "100%",
          borderRadius: "8px",
        }}
        src={nft.tokenMetaUriData.image}
      />
      <Typography
        style={{
          color: theme.custom.colors.secondary,
          fontWeight: 500,
          fontSize: "16px",
          lineHeight: "24px",
        }}
      >
        Description
      </Typography>
    </div>
  );
}
