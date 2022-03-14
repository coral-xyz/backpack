import { makeStyles } from "@material-ui/core";
import { EXTENSION_WIDTH, EXTENSION_HEIGHT } from "../../common";
import { KeyringStoreStateEnum } from "../../keyring/store";
import { useKeyringStoreState } from "../../context/KeyringStoreState";
import { TabBar } from "./Tab";

const useStyles = makeStyles((theme: any) => ({
  layoutContainer: {
    width: `${EXTENSION_WIDTH}px`,
    height: `${EXTENSION_HEIGHT}px`,
    backgroundColor: theme.custom.colors.background,
    display: "flex",
    flexDirection: "column",
  },
  scrollbarThumb: {
    backgroundColor: "red !important",
    color: "red",
  },
  scrollbarTrack: {
    backgroundColor: "red !important",
    color: "red",
  },
}));

export function Layout(props: any) {
  const classes = useStyles();
  const keyringStoreState = useKeyringStoreState();
  return (
    <div className={classes.layoutContainer}>
      {props.children}
      {keyringStoreState === KeyringStoreStateEnum.Unlocked && <TabBar />}
    </div>
  );
}
