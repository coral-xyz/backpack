import { useEffect, useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Box, Grid } from "@mui/material";
import { Header, SubtextParagraph, PrimaryButton } from "../../common";
import {
  getBackgroundClient,
  UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
} from "@coral-xyz/common";

const useStyles = makeStyles((theme: any) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    justifyContent: "space-between",
    color: theme.custom.colors.nav,
  },
}));

export function SetupComplete({ closeDrawer }: { closeDrawer: () => void }) {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box>
        <Header text="You’ve set up Backpack!" />
        <SubtextParagraph>
          Now get started exploring what your Backpack can do.
        </SubtextParagraph>
      </Box>
      <Box>
        <PrimaryButton label="Done" onClick={closeDrawer} />
      </Box>
    </Box>
  );
}
