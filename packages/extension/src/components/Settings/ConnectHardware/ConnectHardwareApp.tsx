import { useCustomTheme } from "@coral-xyz/themes";
import { Box } from "@mui/material";
import { Header, PrimaryButton, SubtextParagraph } from "../../common";
import { SolanaIcon } from "../../Icon";

export function ConnectHardwareApp({ onNext }: { onNext: () => void }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ margin: "0 24px" }}>
        <Box sx={{ display: "block", textAlign: "center", mb: "12px" }}>
          <SolanaIcon />
        </Box>
        <Header text="Open the Solana app" />
        <SubtextParagraph>
          Make sure your wallet remains connected.
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
