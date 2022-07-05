import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { HeaderIcon, Header, SecondaryButton } from "../../common";
import { WarningIcon } from "../../Icon";

export function ShowRecoveryPhraseMnemonic({ onNext }: { onNext: () => void }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ margin: "32px 24px 0 24px" }}>
        <HeaderIcon
          icon={<WarningIcon fill="#E95050" width="40px" height="40px" />}
        />
        <Header text="Recovery phrase" style={{ textAlign: "center" }} />
        <Box sx={{ marginTop: "24px" }}>Hello</Box>
      </Box>
      <Box
        sx={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "16px",
        }}
      >
        <SecondaryButton label="Close" onClick={close} />
      </Box>
    </Box>
  );
}
