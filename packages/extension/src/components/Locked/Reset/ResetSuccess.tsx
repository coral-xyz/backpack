import { Box } from "@mui/material";
import {
  Header,
  HeaderIcon,
  SubtextParagraph,
  PrimaryButton,
} from "../../common";
import { SuccessIcon } from "../../Icon";

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
      <Box sx={{ margin: "0 24px" }}>
        <HeaderIcon icon={<SuccessIcon />} />
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
