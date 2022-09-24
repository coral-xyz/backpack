import { useEffect } from "react";
import { ResetWelcome } from "./ResetWelcome";
import { useNavStack } from "../../common/Layout/NavStack";
import { useDrawerContext } from "../../common/Layout/Drawer";

export function Reset() {
  const { close } = useDrawerContext();
  const nav = useNavStack();
  useEffect(() => {
    nav.setTitle("");
  }, []);
  return <ResetWelcome onClose={close} />;
}
