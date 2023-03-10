import { styles as makeStyles, useCustomTheme } from "@coral-xyz/themes";
import { Close } from "@mui/icons-material";
import { IconButton } from "@mui/material";

import { WithMiniDrawer } from "./Layout/Drawer";

const useStyles = makeStyles((theme) => ({
  paperAnchorBottom: {
    boxShadow: "none",
  },
  closeConfirmButton: {
    width: "38px",
    height: "38px",
    marginLeft: "auto",
    marginRight: "auto",
    border: "none !important",
    background: theme.custom.colors.nav,
  },
  approveTransactionCloseContainer: {
    backgroundColor: theme.custom.colors.approveTransactionCloseBackground,
    width: "44px",
    height: "44px",
    zIndex: 2,
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    borderRadius: "22px",
  },
  closeIcon: {
    color: theme.custom.colors.icon,
  },
}));

export const ApproveTransactionDrawer: React.FC<{
  openDrawer: boolean;
  setOpenDrawer: (b: boolean) => void;
  children: React.ReactNode;
}> = ({ openDrawer, setOpenDrawer, children }) => {
  const classes = useStyles();
  const theme = useCustomTheme();
  return (
    <WithMiniDrawer
      openDrawer={openDrawer}
      setOpenDrawer={setOpenDrawer}
      backdropProps={{
        style: {
          opacity: 0.8,
          background: "#18181b",
        },
      }}
      paperAnchorBottom={classes.paperAnchorBottom}
    >
      <div
        onClick={() => setOpenDrawer(false)}
        style={{
          height: "50px",
          zIndex: 1,
          backgroundColor: "transparent",
        }}
      >
        <CloseButton
          onClick={() => setOpenDrawer(false)}
          style={{
            marginTop: "28px",
            marginLeft: "24px",
            zIndex: 1,
          }}
        />
      </div>
      <div
        style={{
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
          height: "100%",
          background: theme.custom.colors.background,
        }}
      >
        <div
          style={{
            height: "100%",
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
            background: theme.custom.colors.drawerGradient,
          }}
        >
          {children}
        </div>
      </div>
    </WithMiniDrawer>
  );
};

export function CloseButton({
  onClick,
  style,
}: {
  onClick: () => void;
  style?: React.CSSProperties;
}) {
  const classes = useStyles();
  return (
    <div className={classes.approveTransactionCloseContainer} style={style}>
      <IconButton
        disableRipple
        className={`${classes.closeConfirmButton}`}
        onClick={onClick}
      >
        <Close className={classes.closeIcon} />
      </IconButton>
    </div>
  );
}
