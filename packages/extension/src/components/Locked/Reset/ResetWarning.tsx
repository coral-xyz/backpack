import { Box, Grid } from "@mui/material";
import {
  Header,
  SubtextParagraph,
  PrimaryButton,
  SecondaryButton,
} from "../../common";
import { WarningLogo } from "../../Icon";

export function ResetWarning({
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
      <Box
        sx={{
          marginTop: "16px",
          marginLeft: "24px",
          marginRight: "24px",
        }}
      >
        <WarningLogo />
        <Header text="Reset your secret recovery phrase" />
        <SubtextParagraph>
          This will remove all wallets and replace them with a new wallet.
          Ensure you have your existing secret recovery phrase and private keys
          saved.
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
        <Box sx={{ width: "167.5px" }}>
          <SecondaryButton label="Cancel" onClick={onClose} />
        </Box>
        <Box sx={{ width: "167.5px" }}>
          <PrimaryButton label="Next" onClick={() => onNext()} />
        </Box>
      </Box>
    </Box>
  );
}
