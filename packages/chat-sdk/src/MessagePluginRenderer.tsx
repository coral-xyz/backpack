import { BarterUi } from "./components/barter/BarterUi";
import { useChatContext } from "./components/ChatContext";

export const MessagePluginRenderer = () => {
  const { openPlugin } = useChatContext();
  if (!openPlugin) {
    return <></>;
  }

  return <>{openPlugin === "barter" && <BarterUi />}</>;
};
