import { useCustomTheme } from "@coral-xyz/themes";
import { Box } from "@mui/material";
import { Header, PrimaryButton, SubtextParagraph } from "../../common";
import { HardwareWalletIcon } from "../../Icon";

export function ConnectHardware({ onNext }: { onNext: () => void }) {
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
        <Box sx={{ display: "block", textAlign: "center", mb: "24px" }}>
          <HardwareWalletIcon />
        </Box>
        <Header text="Connect a hardware wallet" />
        <SubtextParagraph>
          Use your hardware wallet with Backpack.
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
        <PrimaryButton label="Next" onClick={onNext} />
      </Box>
    </Box>
  );
}
