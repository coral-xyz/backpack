import { PluginManager } from "@coral-xyz/recoil";
import { NavTabs } from "../Layout/NavTabs";

export function Unlocked() {
  return (
    <PluginManager>
      <NavTabs />
    </PluginManager>
  );
}
