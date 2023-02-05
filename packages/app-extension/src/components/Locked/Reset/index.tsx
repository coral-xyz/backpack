import { useEffect } from "react";

import { useDrawerContext } from "../../common/Layout/Drawer";
import { useNavigation } from "../../common/Layout/NavStack";

import { ResetWelcome } from "./ResetWelcome";

export function Reset() {
  const { close } = useDrawerContext();
  const nav = useNavigation();
  useEffect(() => {
    nav.setOptions({ headerTitle: "" });
  }, []);
  return <ResetWelcome onClose={close} />;
}
