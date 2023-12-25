import React, {
  type CSSProperties,
  type Dispatch,
  type MutableRefObject,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
} from "react";
import {
  temporarilyMakeStylesForBrowserExtension,
  useTheme,
} from "@coral-xyz/tamagui";
import { Close } from "@mui/icons-material";
import { Drawer, IconButton } from "@mui/material";

import { NAV_BAR_HEIGHT, NAV_BUTTON_WIDTH } from "./Nav";

const useStyles = temporarilyMakeStylesForBrowserExtension((theme) => ({
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
    "& .MuiBackdrop-root": {
      opacity: 0.4,
      background: `${theme.baseBackgroundL1.val} !important`,
    },
  },
  miniDrawerPaper: {
    backgroundColor: "transparent",
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
  },
  rightButtonIcon: {
    color: theme.baseIcon.val,
  },
  rightButtonLabel: {
    display: "flex",
    justifyContent: "start",
  },
}));

export function WithDrawer(
  props: PropsWithChildren<{
    backdropStyles?: CSSProperties;
    openDrawer: boolean;
    paperStyles?: CSSProperties;
    setOpenDrawer: Dispatch<SetStateAction<boolean>>;
  }>
) {
  const theme = useTheme();
  const classes = useStyles();
  const { backdropStyles, children, openDrawer, paperStyles, setOpenDrawer } =
    props;
  return (
    <DrawerProvider setOpenDrawer={setOpenDrawer}>
      <Drawer
        disableEnforceFocus
        anchor="bottom"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        classes={{
          root: classes.drawerRoot,
          paper: classes.drawerPaper,
        }}
        PaperProps={{
          style: {
            ...paperStyles,
            backgroundColor: theme.baseBackgroundL0.val,
          },
        }}
        BackdropProps={{
          style: {
            ...backdropStyles,
          },
        }}
        id="drawer"
      >
        {children}
      </Drawer>
    </DrawerProvider>
  );
}

export function WithMiniDrawer(props: any) {
  const theme = useTheme();
  const classes = useStyles();
  const {
    children,
    openDrawer,
    setOpenDrawer,
    paperAnchorBottom,
    modalProps,
    paperProps,
    onClose,
  } = props;
  return (
    <DrawerProvider setOpenDrawer={setOpenDrawer}>
      <Drawer
        id="with-mini-drawer"
        disableEnforceFocus
        anchor="bottom"
        open={openDrawer}
        onClose={() => (onClose ? onClose() : setOpenDrawer(false))}
        classes={{
          root: classes.miniDrawerRoot,
          paper: classes.miniDrawerPaper,
          paperAnchorBottom: paperAnchorBottom,
        }}
        slotProps={{
          backdrop: {
            style: {
              opacity: 0.4,
              backgroundColor: theme.baseBackgroundL1.val,
            },
          },
        }}
        ModalProps={{
          ...modalProps,
          backgroundColor: theme.baseBackgroundL0.val,
        }}
        PaperProps={{
          style: {
            backgroundColor: theme.baseBackgroundL0.val,
          },
          ...paperProps,
        }}
      >
        {children}
      </Drawer>
    </DrawerProvider>
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
  const theme = useTheme();
  return (
    <Drawer
      disableEnforceFocus
      anchor="bottom"
      open={openDrawer}
      onClose={() => setOpenDrawer(false)}
      PaperProps={{
        style: {
          position: "absolute",
          backgroundColor: theme.baseBackgroundL0.val,
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
        style: {
          position: "absolute",
        },
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
