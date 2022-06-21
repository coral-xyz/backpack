import makeStyles from "@mui/styles/makeStyles";
import { useEphemeralNav } from "@coral-xyz/recoil";
import { Box } from "@mui/material";
import {
  Header,
  SubtextParagraph,
  SecondaryButton,
  DangerButton,
} from "../../common";
import { ResetWarning } from "./ResetWarning";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    justifyContent: "space-between",
  },
}));

export function Reset({ closeDrawer }: { closeDrawer: () => void }) {
  const classes = useStyles();
  const nav = useEphemeralNav();
  return (
    <Box className={classes.root}>
      <Box>
        <Header text="Forgot your password?" />
        <SubtextParagraph>
          We can’t recover your password as it is only stored on your computer.
          You can try more passwords or reset your wallet with the secret
          recovery phrase.
        </SubtextParagraph>
      </Box>
      <Box>
        <div style={{ marginBottom: "12px" }}>
          <SecondaryButton label="Try More Passwords" onClick={closeDrawer} />
        </div>
        <DangerButton
          label="Reset Secret Recovery Phrase"
          onClick={() => nav.push(<ResetWarning closeDrawer={closeDrawer} />)}
        />
      </Box>
    </Box>
  );
}
