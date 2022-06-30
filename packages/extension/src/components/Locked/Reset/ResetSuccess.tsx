import { Box } from "@mui/material";
import { Header, SubtextParagraph, PrimaryButton } from "../../common";
import { SuccessIcon } from "../../Icon";
import { openOnboarding } from "@coral-xyz/common";

export function ResetSuccess({ onNext }: { onNext: () => void }) {
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
        <Box sx={{ display: "block", textAlign: "center", mb: "12px" }}>
          <SuccessIcon />
        </Box>
        <Header text="Secret recovery phrase reset" />
        <SubtextParagraph>
          You’re now ready to set up your Backpack.
        </SubtextParagraph>
      </Box>
      <Box
        sx={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "16px",
        }}
      >
        <PrimaryButton label="Done" onClick={onNext} />
      </Box>
    </Box>
  );
}
