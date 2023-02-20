import { BarterUi } from "./components/barter/BarterUi";
import { useChatContext } from "./components/ChatContext";

export const MessagePluginRenderer = () => {
  const { openPlugin } = useChatContext();
  const { roomId } = useChatContext();
  if (!openPlugin) {
    return <></>;
  }

  return <>{openPlugin === "barter" && <BarterUi roomId={roomId} />}</>;
};
