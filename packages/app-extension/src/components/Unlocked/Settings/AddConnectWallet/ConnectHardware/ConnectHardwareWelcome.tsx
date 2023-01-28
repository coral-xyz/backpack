import { HardwareWalletIcon, PrimaryButton } from "@coral-xyz/react-common";
import { Box } from "@mui/material";

import { Header, HeaderIcon, SubtextParagraph } from "../../../../common";
import { HardwareType } from "../../../../Onboarding/pages/HardwareOnboard";

export function ConnectHardwareWelcome({
  onNext,
}: {
  onNext: (type: HardwareType) => void;
}) {
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
          flexDirection: "column",
        }}
      >
        <PrimaryButton label="USB" onClick={() => onNext(HardwareType.USB)} />
        <PrimaryButton
          label="Keystone"
          sx={{ mt: "10px" }}
          onClick={() => onNext(HardwareType.Keystone)}
        />
      </Box>
    </Box>
  );
}
