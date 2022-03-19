import { useBackgroundPoll } from "../../hooks/useWallet";
import { TabNavStack } from "../Layout/Nav";

export function Unlocked() {
  useBackgroundPoll();
  return <TabNavStack />;
}
