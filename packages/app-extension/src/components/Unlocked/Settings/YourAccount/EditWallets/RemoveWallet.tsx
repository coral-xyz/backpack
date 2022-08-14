import React, { useEffect } from "react";
import { Typography } from "@mui/material";
import { useCustomTheme } from "@coral-xyz/themes";
import { useNavStack } from "../../../../common/Layout/NavStack";
import { WarningIcon } from "../../../../common/Icon";

export const RemoveWallet: React.FC = () => {
  const theme = useCustomTheme();
  const nav = useNavStack();
  useEffect(() => {
    nav.setTitle("Remove Wallet");
  }, [nav]);

  return (
    <div>
      <WarningIcon
        fill={theme.custom.colors.negative}
        style={{
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
          marginTop: "45px",
        }}
      />
      <Typography
        style={{
          fontWeight: 500,
          fontSize: "24px",
          lineHeight: "32px",
          textAlign: "center",
          marginTop: "30px",
        }}
      >
        Are you sure you want to remove wallet?
      </Typography>
      <Typography
        style={{
          textAlign: "center",
          color: theme.custom.colors.secondary,
          fontSize: "16px",
          lineHeight: "24px",
          fontWeight: 500,
        }}
      >
        Removing the wallet from Backpack will not delete the wallet’s contents.
        It will still be available to access by selecting “Add an account” from
        Backpack.
      </Typography>
    </div>
  );
};
