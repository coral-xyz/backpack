import { Box } from "@mui/material";
import {
  Header,
  SubtextParagraph,
  SecondaryButton,
  DangerButton,
} from "../../common";

export function ResetWelcome({
  onNext,
  onClose,
}: {
  onNext: () => void;
  onClose: () => void;
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
      <Box sx={{ margin: "24px" }}>
        <Header text="Forgot your password?" />
        <SubtextParagraph>
          We can’t recover your password as it is only stored on your computer.
          You can try more passwords or reset your wallet with the secret
          recovery phrase.
        </SubtextParagraph>
      </Box>
      <Box
        sx={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "16px",
        }}
      >
        <Box sx={{ mb: "16px" }}>
          <SecondaryButton label="Try More Passwords" onClick={onClose} />
        </Box>
        <DangerButton label="Reset Secret Recovery Phrase" onClick={onNext} />
      </Box>
    </Box>
  );
}
