import { useCustomTheme } from "@coral-xyz/themes";

import { BarterUi } from "./components/barter/BarterUi";
import { useChatContext } from "./components/ChatContext";
import { NftSticker } from "./components/NftSticker";
import { NftStickerPlugin } from "./components/plugins/NftStickerPlugin";
import { ScrollBarImpl } from "./components/ScrollbarImpl";
import { PLUGIN_HEIGHT_PERCENTAGE } from "./utils/constants";

export const MessagePluginRenderer = () => {
  const { openPlugin } = useChatContext();
  const { roomId } = useChatContext();
  const theme = useCustomTheme();
  if (!openPlugin) {
    return <div />;
  }

  return (
    <>
      {openPlugin === "barter" ? <BarterUi roomId={roomId} /> : null}
      {openPlugin === "nft-sticker" ? (
        <ScrollBarImpl height={`${PLUGIN_HEIGHT_PERCENTAGE}vh`}>
          <div
            style={{
              height: "calc(100% - 56px)",
              overflow: "scroll",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <NftStickerPlugin />
          </div>
        </ScrollBarImpl>
      ) : null}
    </>
  );
};
