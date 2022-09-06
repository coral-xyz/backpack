import { useCustomTheme, styles } from "@coral-xyz/themes";
import { WithMiniDrawer } from "./Layout/Drawer";
import { CloseButton } from "../Unlocked/Swap";

const useStyles = styles(() => ({
  paperAnchorBottom: {
    boxShadow: "none",
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
