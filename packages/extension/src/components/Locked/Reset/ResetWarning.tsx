import makeStyles from "@mui/styles/makeStyles";
import { useEphemeralNav } from "@coral-xyz/recoil";
import { Box, Button, Grid } from "@mui/material";
import { Header, SubtextParagraph } from "../../common";
import { MnemonicInput } from "./MnemonicInput";

const useStyles = makeStyles((theme: any) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    justifyContent: "space-between",
  },
  icon: {
    display: "block",
    margin: "0 auto 24px auto",
  },
}));

export function ResetWarning({ closeDrawer }: { closeDrawer: () => void }) {
  const classes = useStyles();
  const nav = useEphemeralNav();

  const next = () => {
    nav.push(<MnemonicInput closeDrawer={closeDrawer} />);
  };

  return (
    <Box className={classes.root}>
      <Box>
        <WarningLogo className={classes.icon} />
        <Header text="Reset your secret recovery phrase" />
        <SubtextParagraph>
          This will remove all wallets and replace them with a new wallet.
          Ensure you have you existing secret recovery phrase and private keys
          saved.
        </SubtextParagraph>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Button onClick={closeDrawer} color="secondary">
            Cancel
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button onClick={next}>Next</Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export function WarningLogo({ className }: { className?: string }) {
  return (
    <svg
      width="46"
      height="40"
      viewBox="0 0 46 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M5.43 39.8421H40.57C44.1633 39.8421 46.4033 35.9455 44.6067 32.8421L27.0367 2.48546C25.24 -0.617874 20.76 -0.617874 18.9633 2.48546L1.39333 32.8421C-0.403335 35.9455 1.83666 39.8421 5.43 39.8421ZM23 23.5088C21.7167 23.5088 20.6667 22.4588 20.6667 21.1755V16.5088C20.6667 15.2255 21.7167 14.1755 23 14.1755C24.2833 14.1755 25.3333 15.2255 25.3333 16.5088V21.1755C25.3333 22.4588 24.2833 23.5088 23 23.5088ZM25.3333 32.8421H20.6667V28.1755H25.3333V32.8421Z"
        fill="#A1A1AA"
      />
    </svg>
  );
}
