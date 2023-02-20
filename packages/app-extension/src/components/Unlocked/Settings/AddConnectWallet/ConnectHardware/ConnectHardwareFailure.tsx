import { DISCORD_INVITE_LINK } from "@coral-xyz/common";
import {
  PrimaryButton,
  SadFaceIcon,
  SecondaryButton,
} from "@coral-xyz/react-common";
import { Box } from "@mui/material";

import { Header, HeaderIcon, SubtextParagraph } from "../../../../common";

export function ConnectHardwareFailure({ onRetry }: { onRetry: () => void }) {
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
        <HeaderIcon icon={<SadFaceIcon />} />
        <Header text="Unable to connect" />
        <SubtextParagraph>
          Check that your wallet is connected and unlocked, and your browser
          permissions are approved.
        </SubtextParagraph>
      </Box>
      <Box
        sx={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "16px",
        }}
      >
        <Box sx={{ marginBottom: "12px" }}>
          <SecondaryButton
            label="Help & Support"
            onClick={() => window.open(DISCORD_INVITE_LINK, "_blank")}
          />
        </Box>
        <PrimaryButton label="Retry" onClick={onRetry} />
      </Box>
    </Box>
  );
}
