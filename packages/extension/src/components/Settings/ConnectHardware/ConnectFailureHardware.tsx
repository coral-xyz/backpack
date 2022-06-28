import { useCustomTheme } from "@coral-xyz/themes";
import { Box } from "@mui/material";
import { Header, PrimaryButton, SubtextParagraph } from "../../common";
import { HardwareWalletIcon } from "./";

export function ConnectFailureHardware() {
  const retry = () => {};

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box
        sx={{
          marginTop: "16px",
          marginLeft: "24px",
          marginRight: "24px",
        }}
      >
        <HardwareWalletIcon />
        <Header text="Unable to connect" />
        <SubtextParagraph>
          Check that your wallet is connected and unlocked, and your browser
          permissions are approved.
          <br />
          Help & support
        </SubtextParagraph>
      </Box>
      <Box
        sx={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <PrimaryButton label="Retry" onClick={retry} />
      </Box>
    </Box>
  );
}
