import makeStyles from "@mui/styles/makeStyles";
import { Box, Button, Grid } from "@mui/material";
import { Header, SubtextParagraph } from "../../common";

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
        <Grid></Grid>
      </Box>
      <Box>
        <Button onClick={closeDrawer}>Done</Button>
      </Box>
    </Box>
  );
}
