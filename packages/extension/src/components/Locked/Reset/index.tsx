import { useEphemeralNav } from "@coral-xyz/recoil";
import { Box } from "@mui/material";
import {
  Header,
  SubtextParagraph,
  SecondaryButton,
  DangerButton,
} from "../../common";
import { ResetWarning } from "./ResetWarning";

export function Reset({ closeDrawer }: { closeDrawer: () => void }) {
  const nav = useEphemeralNav();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Header text="Forgot your password?" />
        <SubtextParagraph>
          We can’t recover your password as it is only stored on your computer.
          You can try more passwords or reset your wallet with the secret
          recovery phrase.
        </SubtextParagraph>
      </Box>
      <Box>
        <Box sx={{ mb: "12px" }}>
          <SecondaryButton label="Try More Passwords" onClick={closeDrawer} />
        </Box>
        <DangerButton
          label="Reset Secret Recovery Phrase"
          onClick={() => nav.push(<ResetWarning closeDrawer={closeDrawer} />)}
        />
      </Box>
    </Box>
  );
}
