import { PluginManager } from "@coral-xyz/recoil";
import { NavTabs } from "../common/Layout/NavTabs";

export function Unlocked() {
  return (
    <PluginManager>
      <NavTabs />
    </PluginManager>
  );
}
