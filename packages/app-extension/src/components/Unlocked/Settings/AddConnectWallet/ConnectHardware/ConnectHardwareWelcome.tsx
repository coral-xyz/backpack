import { HardwareWalletIcon, PrimaryButton } from "@coral-xyz/react-common";
import { Box } from "@mui/material";

import { Header, HeaderIcon, SubtextParagraph } from "../../../../common";

export function ConnectHardwareWelcome({ onNext }: { onNext: () => void }) {
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
        <HeaderIcon icon={<HardwareWalletIcon />} />
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
