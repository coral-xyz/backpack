import { useEffect } from "react";
import { makeStyles, Drawer, Button, IconButton } from "@material-ui/core";
import { Close } from "@material-ui/icons";
import { EXTENSION_HEIGHT } from "../../common";
import { NAV_BAR_HEIGHT, NAV_BUTTON_WIDTH } from "./Nav";
import { WithEphemeralNav } from "./NavEphemeral";
import { useEphemeralNav } from "../../context/NavEphemeral";

const useStyles = makeStyles((theme: any) => ({
  withDrawer: {
    backgroundColor: theme.custom.colors.background,
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  withDrawerNoHeader: {
    height: EXTENSION_HEIGHT - NAV_BAR_HEIGHT,
    backgroundColor: theme.custom.colors.background,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },
  withDrawerContent: {
    flex: 1,
  },
  drawerRoot: {
    top: `${NAV_BAR_HEIGHT}px !important`,
    zIndex: "1 !important" as any,
    flex: 1,
  },
  drawerPaper: {
    height: "100%",
  },
  closeDrawerButton: {
    backgroundColor: theme.custom.colors,
    width: "100%",
  },
  rightButton: {
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
  rightButtonIcon: {
    color: theme.custom.colors.secondary,
  },
  rightButtonLabel: {
    display: "flex",
    flexDirection: "row-reverse",
    justifyContent: "end",
  },
  navContainer: {
    display: "flex",
    justifyContent: "space-between",
    background: theme.custom.colors.nav,
    borderBottom: `solid 1pt ${theme.custom.colors.border}`,
  },
}));

export function WithDrawer(props: any) {
  const { children, openDrawer, title, setOpenDrawer } = props;
  const classes = useStyles();
  return (
    <Drawer
      anchor={"bottom"}
      open={openDrawer}
      onClose={() => setOpenDrawer(false)}
      classes={{
        root: classes.drawerRoot,
        paper: classes.drawerPaper,
      }}
    >
      <WithEphemeralNav title={title}>
        <WithDrawerContent setOpenDrawer={setOpenDrawer}>
          {children}
        </WithDrawerContent>
      </WithEphemeralNav>
    </Drawer>
  );
}

function WithDrawerContent({ children, setOpenDrawer }: any) {
  const classes = useStyles();
  const { setNavButtonRight } = useEphemeralNav();
  useEffect(() => {
    setNavButtonRight(<RightButton onClick={() => setOpenDrawer(false)} />);
  }, [setNavButtonRight]);
  return (
    <div className={classes.withDrawer}>
      <div className={classes.withDrawerContent}>{children}</div>
    </div>
  );
}

function RightButton({ onClick }: any) {
  const classes = useStyles();
  return (
    <IconButton
      classes={{
        label: classes.rightButtonLabel,
      }}
      disableRipple
      style={{ padding: 0, width: `${NAV_BUTTON_WIDTH}px` }}
      onClick={onClick}
    >
      <Close className={classes.rightButtonIcon} />
    </IconButton>
  );
}

export function WithDrawerNoHeader(props: any) {
  const { children, openDrawer, setOpenDrawer } = props;
  const classes = useStyles();
  return (
    <Drawer
      BackdropProps={{
        style: {
          position: "absolute",
          top: NAV_BAR_HEIGHT,
          height: EXTENSION_HEIGHT - NAV_BAR_HEIGHT,
        },
      }}
      anchor={"bottom"}
      open={openDrawer}
      onClose={() => setOpenDrawer(false)}
      classes={{
        root: classes.drawerRoot,
      }}
    >
      <div className={classes.withDrawerNoHeader}>
        <div className={classes.withDrawerContent}>{children}</div>
        {!props.skipFooter && (
          <Button
            onClick={() => setOpenDrawer(false)}
            variant="contained"
            className={classes.closeDrawerButton}
          >
            Close
          </Button>
        )}
      </div>
    </Drawer>
  );
}
