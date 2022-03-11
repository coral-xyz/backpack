import { makeStyles } from "@material-ui/core";
import { EXTENSION_WIDTH, EXTENSION_HEIGHT } from "../../common";
import { KeyringStoreStateEnum } from "../../keyring/store";
import { useKeyringStoreState } from "../../context/KeyringStoreState";
import { TabProvider } from "../../context/Tab";
import { NavBar } from "./Nav";
import { TabBar } from "./Tab";
import Scrollable from "./Scrollable";

const useStyles = makeStyles((theme: any) => ({
  layoutContainer: {
    width: `${EXTENSION_WIDTH}px`,
    height: `${EXTENSION_HEIGHT}px`,
    backgroundColor: theme.custom.colors.background,
    display: "flex",
    flexDirection: "column",
    borderRadius: "4px",
  },
}));

export function Layout(props: any) {
  const classes = useStyles();
  const keyringStoreState = useKeyringStoreState();
  return (
    <TabProvider>
      <div className={classes.layoutContainer}>
        <NavBar />
        <Scrollable>{props.children}</Scrollable>
        {keyringStoreState === KeyringStoreStateEnum.Unlocked && <TabBar />}
      </div>
    </TabProvider>
  );
}
