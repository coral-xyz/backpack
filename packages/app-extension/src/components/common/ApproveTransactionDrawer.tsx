import { temporarilyMakeStylesForBrowserExtension } from "@coral-xyz/tamagui";
import { Close } from "@mui/icons-material";
import { IconButton } from "@mui/material";

import { WithMiniDrawer } from "./Layout/Drawer";

const useStyles = temporarilyMakeStylesForBrowserExtension((theme) => ({
  paperAnchorBottom: {
    boxShadow: "none",
  },
  closeConfirmButton: {
    width: "38px",
    height: "38px",
    marginLeft: "auto",
    marginRight: "auto",
    border: "none !important",
    background: theme.baseBackgroundL1.val,
  },
  approveTransactionCloseContainer: {
    backgroundColor: theme.baseBackgroundL1.val,
    width: "44px",
    height: "44px",
    zIndex: 2,
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    borderRadius: "22px",
  },
  closeIcon: {
    color: theme.baseIcon.val,
  },
}));

export const ApproveTransactionDrawer: React.FC<{
  openDrawer: boolean;
  setOpenDrawer: (b: boolean) => void;
  children: React.ReactNode;
}> = ({ openDrawer, setOpenDrawer, children }) => {
  const classes = useStyles();
  return (
    <WithMiniDrawer
      openDrawer={openDrawer}
      setOpenDrawer={setOpenDrawer}
      paperAnchorBottom={classes.paperAnchorBottom}
    >
      {children}
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
