import React, {
  useContext,
  useEffect,
  type CSSProperties,
  type Dispatch,
  type MutableRefObject,
  type PropsWithChildren,
  type SetStateAction,
} from "react";
import { Drawer, Button, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import { styles } from "@coral-xyz/themes";
import { EXTENSION_HEIGHT } from "@coral-xyz/common";
import { useEphemeralNav } from "@coral-xyz/recoil";
import { WithEphemeralNav } from "./NavEphemeral";
import { NAV_BAR_HEIGHT, NAV_BUTTON_WIDTH } from "./Nav";

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
    background: theme.custom.colors.backgroundBackdrop,
  },
  miniDrawerRoot: {
    background: "transparent",
    zIndex: "1301 !important" as any,
    flex: 1,
  },
  miniDrawerPaper: {
    backgroundColor: "transparent",
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
  },
  closeDrawerButton: {
    backgroundColor: theme.custom.colors.background,
    width: "100%",
  },
  rightButtonIcon: {
    color: theme.custom.colors.icon,
  },
  rightButtonLabel: {
    display: "flex",
    justifyContent: "start",
  },
}));

export function WithDrawer(props: any) {
  const classes = useStyles();
  const { children, openDrawer, setOpenDrawer } = props;
  return (
    <DrawerProvider setOpenDrawer={setOpenDrawer}>
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
    </DrawerProvider>
  );
}

export function WithEphemeralNavDrawer(props: any) {
  const {
    children,
    openDrawer,
    title,
    navbarStyle,
    navContentStyle,
    setOpenDrawer,
  } = props;
  return (
    <WithDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
      <WithEphemeralNav
        title={title}
        navbarStyle={{
          ...navbarStyle,
        }}
        navContentStyle={{
          ...navContentStyle,
        }}
      >
        <WithDrawerContent setOpenDrawer={setOpenDrawer}>
          {children}
        </WithDrawerContent>
      </WithEphemeralNav>
    </WithDrawer>
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
    modalProps,
    paperProps,
    onClose,
  } = props;
  return (
    <DrawerProvider setOpenDrawer={setOpenDrawer}>
      <Drawer
        anchor={"bottom"}
        open={openDrawer}
        onClose={() => (onClose ? onClose() : setOpenDrawer(false))}
        classes={{
          root: classes.miniDrawerRoot,
          paper: classes.miniDrawerPaper,
          paperAnchorBottom: paperAnchorBottom,
        }}
        BackdropProps={{
          style: {
            background: "transparent",
          },
          ...backdropProps,
        }}
        ModalProps={{
          ...modalProps,
        }}
        PaperProps={{
          ...paperProps,
        }}
      >
        {children}
      </Drawer>
    </DrawerProvider>
  );
}

function WithDrawerContent({ children, setOpenDrawer }: any) {
  const classes = useStyles();
  const nav = useEphemeralNav();
  useEffect(() => {
    let previous = nav.navButtonLeft;
    nav.setNavButtonLeft(<CloseButton onClick={() => setOpenDrawer(false)} />);
    return () => {
      nav.setNavButtonLeft(previous);
    };
  }, []);
  return (
    <div className={classes.withDrawer}>
      <div className={classes.withDrawerContent}>{children}</div>
    </div>
  );
}

export function CloseButton({ onClick, buttonStyle }: any) {
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
          ...buttonStyle,
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

export function WithContaineredDrawer(
  props: PropsWithChildren<{
    backdropStyles?: CSSProperties;
    containerRef: MutableRefObject<any>;
    openDrawer: boolean;
    paperStyles?: CSSProperties;
    setOpenDrawer: Dispatch<SetStateAction<boolean>>;
  }>
) {
  const {
    children,
    backdropStyles,
    containerRef,
    openDrawer,
    setOpenDrawer,
    paperStyles,
  } = props;

  return (
    <Drawer
      anchor="bottom"
      open={openDrawer}
      onClose={() => setOpenDrawer(false)}
      PaperProps={{
        style: {
          position: "absolute",
          ...paperStyles,
        },
      }}
      BackdropProps={{
        style: {
          position: "absolute",
          ...backdropStyles,
        },
      }}
      ModalProps={{
        container: containerRef.current,
        style: { position: "absolute" },
        disableAutoFocus: true,
      }}
    >
      {children}
    </Drawer>
  );
}

type DrawerContext = {
  close: () => void;
};
const _DrawerContext = React.createContext<DrawerContext | null>(null);

function DrawerProvider({ children, setOpenDrawer }: any) {
  const close = () => setOpenDrawer(false);
  return (
    <_DrawerContext.Provider
      value={{
        close,
      }}
    >
      {children}
    </_DrawerContext.Provider>
  );
}

export function useDrawerContext(): DrawerContext {
  const ctx = useContext(_DrawerContext);
  if (ctx === null) {
    throw new Error("Context not available");
  }
  return ctx;
}
