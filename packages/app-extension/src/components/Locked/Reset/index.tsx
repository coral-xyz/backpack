import { useEffect } from "react";
import { ResetWelcome } from "./ResetWelcome";
import { useNavStack } from "../../Layout/NavStack";
import { useDrawerContext } from "../../Layout/Drawer";

export function Reset() {
  const { close } = useDrawerContext();
  const nav = useNavStack();
  useEffect(() => {
    nav.setTitle("");
    nav.setStyle({ borderBottom: "none" });
  }, []);
  return <ResetWelcome onClose={close} />;
}
