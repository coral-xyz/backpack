import React, {
  type CSSProperties,
  type Dispatch,
  type MutableRefObject,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
} from "react";
import { EXTENSION_HEIGHT } from "@coral-xyz/common";
import { styles as makeStyles } from "@coral-xyz/themes";
import { Close } from "@mui/icons-material";
import { Drawer, IconButton } from "@mui/material";

import { NAV_BAR_HEIGHT, NAV_BUTTON_WIDTH } from "./Nav";

const useStyles = makeStyles((theme) => ({
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
    "& .MuiBackdrop-root": {
      opacity: 0.8,
      background: `${theme.custom.colors.miniDrawerBackdrop} !important`,
    },
  },
  miniDrawerPaper: {
    backgroundColor: "transparent",
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
  },
  rightButtonIcon: {
    color: theme.custom.colors.icon,
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
  const classes = useStyles();
  const { backdropStyles, children, openDrawer, paperStyles, setOpenDrawer } =
    props;
  return (
    <DrawerProvider setOpenDrawer={setOpenDrawer}>
      <Drawer
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
        anchor="bottom"
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
