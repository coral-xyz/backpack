import makeStyles from "@mui/styles/makeStyles";
import { useEphemeralNav } from "@coral-xyz/recoil";
import { Box, Button, Grid } from "@mui/material";
import { Header, SubtextParagraph } from "../../common";
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
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Button onClick={closeDrawer} color="secondary">
            Try More Passwords
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button
            onClick={() => nav.push(<ResetWarning closeDrawer={closeDrawer} />)}
            color="error"
          >
            Reset Secret Recovery Phrase
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
