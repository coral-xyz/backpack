import { useEffect } from "react";

import { useDrawerContext } from "../../common/Layout/Drawer";
import { useNavStack } from "../../common/Layout/NavStack";

import { ResetWelcome } from "./ResetWelcome";

export function Reset() {
  const { close } = useDrawerContext();
  const nav = useNavStack();
  useEffect(() => {
    nav.setTitle("");
  }, []);
  return <ResetWelcome onClose={close} />;
}
