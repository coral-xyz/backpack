import { useEffect } from "react";
import { Drawer, Button, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { EXTENSION_HEIGHT } from "@coral-xyz/common";
import { useEphemeralNav } from "@coral-xyz/recoil";
import { WithEphemeralNav } from "../Layout/NavEphemeral";
import { NAV_BAR_HEIGHT, NAV_BUTTON_WIDTH } from "./Nav";

const MINI_DRAWER_HEIGHT = 295;

const useStyles = styles((theme) => ({
  withDrawer: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  withDrawerNoHeader: {
    height: EXTENSION_HEIGHT - NAV_BAR_HEIGHT,
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
    backgroundColor: theme.custom.colors.background,
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
  const classes = useStyles();
  const theme = useCustomTheme();
  const {
    children,
    openDrawer,
    title,
    navbarStyle,
    navContentStyle,
    setOpenDrawer,
  } = props;
  return (
    <Drawer
      anchor={"bottom"}
      open={openDrawer}
      onClose={() => setOpenDrawer(false)}
      classes={{
        root: classes.drawerRoot,
        paper: classes.drawerPaper,
      }}
      id="drawer"
    >
      {children}
    </Drawer>
  );
}

export function WithEphemeralNavDrawer(props: any) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const {
    children,
    openDrawer,
    title,
    navbarStyle,
    navContentStyle,
    setOpenDrawer,
  } = props;
  return (
    <Drawer
      anchor={"bottom"}
      open={openDrawer}
      onClose={() => setOpenDrawer(false)}
      classes={{
        root: classes.drawerRoot,
        paper: classes.drawerPaper,
      }}
      id="drawer"
    >
      <WithEphemeralNav
        title={title}
        navbarStyle={{
          background: theme.custom.colors.background,
          ...navbarStyle,
        }}
        navContentStyle={{
          background: theme.custom.colors.background,
          ...navContentStyle,
        }}
      >
        <WithDrawerContent setOpenDrawer={setOpenDrawer}>
          {children}
        </WithDrawerContent>
      </WithEphemeralNav>
    </Drawer>
  );
}

export function WithMiniDrawer(props: any) {
  const classes = useStyles();
  const {
    children,
    openDrawer,
    setOpenDrawer,
    paperAnchorBottom,
    backdropProps,
  } = props;
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
          ...backdropProps,
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
    <div
      style={{
        position: "relative",
        width: `${NAV_BUTTON_WIDTH}px`,
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <IconButton
        classes={{ root: classes.rightButtonLabel }}
        disableRipple
        style={{
          padding: 0,
          position: "absolute",
          right: 0,
        }}
        onClick={onClick}
        size="large"
      >
        <Close className={classes.rightButtonIcon} />
      </IconButton>
    </div>
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
