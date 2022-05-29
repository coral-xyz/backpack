import { useEffect } from "react";
import { Drawer, Button, IconButton } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Close } from "@mui/icons-material";
import { EXTENSION_HEIGHT } from "@200ms/common";
import { useEphemeralNav } from "@200ms/recoil";
import { WithEphemeralNav } from "../Layout/NavEphemeral";
import { NAV_BAR_HEIGHT, NAV_BUTTON_WIDTH } from "./Nav";

const MINI_DRAWER_HEIGHT = 295;

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
    display: "flex",
    flexDirection: "column",
  },
  drawerRoot: {
    top: `${NAV_BAR_HEIGHT}px !important`,
    zIndex: "2 !important" as any,
    flex: 1,
  },
  drawerPaper: {
    height: "100%",
  },
  miniDrawerRoot: {
    background: "transparent",
    zIndex: "1301 !important" as any,
    flex: 1,
  },
  miniDrawerPaper: {
    height: `${MINI_DRAWER_HEIGHT}px`,
    background: "transparent",
  },
  closeDrawerButton: {
    backgroundColor: theme.custom.colors,
    width: "100%",
  },
  rightButtonIcon: {
    color: theme.custom.colors.secondary,
  },
  rightButtonLabel: {
    display: "flex",
    flexDirection: "row-reverse",
    justifyContent: "end",
  },
}));

export function WithDrawer(props: any) {
  const { children, openDrawer, title, navbarStyle, setOpenDrawer } = props;
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
      <WithEphemeralNav title={title} navbarStyle={navbarStyle}>
        <WithDrawerContent setOpenDrawer={setOpenDrawer}>
          {children}
        </WithDrawerContent>
      </WithEphemeralNav>
    </Drawer>
  );
}

export function WithMiniDrawer(props: any) {
  const classes = useStyles();
  const { children, openDrawer, setOpenDrawer, paperAnchorBottom } = props;
  return (
    <Drawer
      anchor={"bottom"}
      open={openDrawer}
      onClose={() => setOpenDrawer(false)}
      classes={{
        root: classes.miniDrawerRoot,
        paper: classes.miniDrawerPaper,
        paperAnchorBottom: paperAnchorBottom,
      }}
      BackdropProps={{
        style: {
          background: "transparent",
        },
      }}
      ModalProps={{ onBackdropClick: () => setOpenDrawer(false) }}
    >
      {children}
    </Drawer>
  );
}

function WithDrawerContent({ children, setOpenDrawer }: any) {
  const classes = useStyles();
  const nav = useEphemeralNav();
  useEffect(() => {
    let previous = nav.navButtonRight;
    nav.setNavButtonRight(<RightButton onClick={() => setOpenDrawer(false)} />);
    return () => {
      nav.setNavButtonRight(previous);
    };
  }, []);
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
      classes={classes.rightButtonLabel}
      disableRipple
      style={{ padding: 0, width: `${NAV_BUTTON_WIDTH}px` }}
      onClick={onClick}
      size="large"
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
