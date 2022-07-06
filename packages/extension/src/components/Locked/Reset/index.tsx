import { useEffect } from "react";
import { useEphemeralNav } from "@coral-xyz/recoil";
import { ResetWelcome } from "./ResetWelcome";

export function Reset({ closeDrawer }: { closeDrawer?: () => void }) {
  const nav = useEphemeralNav();
  useEffect(() => {
    nav.setTitle("");
    nav.setStyle({ borderBottom: "none" });
  }, []);
  return <ResetWelcome onClose={closeDrawer} />;
}
