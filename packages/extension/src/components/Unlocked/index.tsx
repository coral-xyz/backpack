import { PluginManager } from "@coral-xyz/recoil";
import { TabNavStack } from "../Layout/Nav";

export function Unlocked() {
  return (
    <PluginManager>
      <TabNavStack />
    </PluginManager>
  );
}
