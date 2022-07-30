import { Box } from "@mui/material";
import {
  Header,
  HeaderIcon,
  PrimaryButton,
  SubtextParagraph,
} from "../../../common";
import { SadFaceIcon } from "../../../Icon";

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
        <SubtextParagraph style={{ marginTop: "24px" }}>
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
        <PrimaryButton label="Retry" onClick={onRetry} />
      </Box>
    </Box>
  );
}
