import { useEffect } from "react";
import { Typography } from "@mui/material";
import { useCustomTheme } from "@coral-xyz/themes";
import { useNftMetadata, useNavigation } from "@coral-xyz/recoil";
import { PrimaryButton } from "../../common";

export function NftsDetail({ publicKey }: { publicKey: string }) {
  const theme = useCustomTheme();
  const nav = useNavigation();
  const nfts = useNftMetadata();
  const nft = nfts.get(publicKey);

  // Hack: needed because this is undefined due to framer-motion animation.
  if (!publicKey) {
    return <></>;
  }

  console.log("NFT HERE", nft);
  const send = () => {};

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
          height: "343px",
          borderRadius: "8px",
        }}
        src={nft.tokenMetaUriData.image}
      />
      <Typography
        style={{
          marginTop: "20px",
          marginBottom: "4px",
          color: theme.custom.colors.secondary,
          fontWeight: 500,
          fontSize: "16px",
          lineHeight: "24px",
        }}
      >
        Description
      </Typography>
      <Typography
        style={{
          color: theme.custom.colors.fontColor,
          fontWeight: 500,
          fontSize: "16px",
        }}
      >
        {nft.tokenMetaUriData.description}
      </Typography>
      <PrimaryButton
        style={{
          marginBottom: "24px",
          marginTop: "24px",
        }}
        onClick={() => send()}
        label={"Send"}
      />
    </div>
  );
}
