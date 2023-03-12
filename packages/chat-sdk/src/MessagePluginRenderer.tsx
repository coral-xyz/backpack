import { useCustomTheme } from "@coral-xyz/themes";

import { BarterUi } from "./components/barter/BarterUi";
import { useChatContext } from "./components/ChatContext";

export const MessagePluginRenderer = () => {
  const { openPlugin } = useChatContext();
  const { roomId } = useChatContext();
  const theme = useCustomTheme();
  if (!openPlugin) {
    return <div />;
  }

  return (
    <>{openPlugin.type === "barter" ? <BarterUi roomId={roomId} /> : null}</>
  );
};
