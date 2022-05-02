import { PluginManager } from "@200ms/recoil";
import { TabNavStack } from "../Layout/Nav";

export function Unlocked() {
  return (
    <PluginManager>
      <TabNavStack />
    </PluginManager>
  );
}
