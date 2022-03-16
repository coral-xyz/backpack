import { useState } from "react";
import { makeStyles, Button, Typography } from "@material-ui/core";
import { WithDrawer } from "../../Layout/Drawer";

const useStyles = makeStyles((theme: any) => ({
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
        <Send />
      </WithDrawer>
    </>
  );
}

function Send() {
  return <div>Send</div>;
}
