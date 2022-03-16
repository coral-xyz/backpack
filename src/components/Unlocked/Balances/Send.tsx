import { useState } from "react";
import { makeStyles, Button, Typography } from "@material-ui/core";
import { WithDrawer } from "../../Layout/Drawer";

const useStyles = makeStyles((theme: any) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    //		backgroundColor: theme.custom.colors.background,
    backgroundColor: theme.custom.colors.nav,
    height: "100%",
  },
  headerButton: {
    borderRadius: "12px",
    width: "100px",
    height: "40px",
    backgroundColor: theme.custom.colors.nav,
    "&:hover": {
      backgroundColor: theme.custom.colors.nav,
    },
  },
  headerButtonLabel: {
    color: theme.custom.colors.fontColor,
    fontSize: "14px",
    lineHeight: "24px",
    fontWeight: 500,
    textTransform: "none",
  },
  topHalf: {
    height: "249px",
  },
  bottomHalf: {
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
    background: theme.custom.colors.sendGradient,
    height: "194px",
  },
  buttonContainer: {
    flex: 1,
    display: "flex",
    paddingLeft: "24px",
    paddingRight: "24px",
    paddingBottom: "24px",
    paddingTop: "25px",
    justifyContent: "space-between",
  },
  buttonLabel: {
    color: theme.custom.colors.fontColor,
    textTransform: "none",
    fontWeight: 500,
    fontSize: "16px",
    lineHeight: "24px",
  },
  button: {
    background: "transparent",
    width: "159px",
    height: "48px",
  },
}));

export function SendButton({ token }: any) {
  const classes = useStyles();
  const [openDrawer, setOpenDrawer] = useState(false);
  console.log("send token", token);
  return (
    <>
      <Button
        disableElevation
        variant="contained"
        className={classes.headerButton}
        disableRipple
        onClick={() => setOpenDrawer(true)}
      >
        <Typography className={classes.headerButtonLabel}>Send</Typography>
      </Button>
      <WithDrawer
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
        title={`${token.ticker} / Send`}
      >
        <Send onCancel={() => setOpenDrawer(false)} />
      </WithDrawer>
    </>
  );
}

function Send({ onCancel }: any) {
  const classes = useStyles() as any;
  return (
    <div className={classes.container}>
      <div className={classes.topHalf}></div>
      <div className={classes.bottomHalf}></div>
      <div className={classes.buttonContainer}>
        <Button
          variant="contained"
          disableRipple
          disableElevation
          className={classes.button}
          onClick={onCancel}
        >
          <Typography className={classes.buttonLabel}>Cancel</Typography>
        </Button>
        <Button
          variant="contained"
          disableRipple
          disableElevation
          className={classes.button}
        >
          <Typography className={classes.buttonLabel}>Next</Typography>
        </Button>
      </div>
    </div>
  );
}
