import type { Nft } from "@coral-xyz/common";
import { useBreakpoints } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import Info from "@mui/icons-material/Info";
import { Tooltip } from "@mui/material";

import { Nfts } from "../barter/SelectPage";
import { useChatContext } from "../ChatContext";
import { ScrollBarImpl } from "../ScrollbarImpl";

export const NftStickerPlugin = ({ setPluginMenuOpen }) => {
  const { setOpenPlugin, setAboveMessagePlugin, sendMessage } =
    useChatContext();
  const theme = useCustomTheme();
  const { isXs } = useBreakpoints();

  return (
    <div style={{ padding: isXs ? 10 : 20 }}>
      <div style={{ display: "flex" }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            marginTop: 10,
            paddingLeft: isXs ? 10 : 0,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              fontSize: 18,
              color: theme.custom.colors.fontColor,
            }}
          >
            NFT Stickers
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <Tooltip title="Made from your NFTs">
              <Info
                style={{
                  fontSize: "1.2rem",
                  marginLeft: 4,
                  color: theme.custom.colors.icon,
                }}
              />
            </Tooltip>
          </div>
        </div>
      </div>
      <div style={{ position: "relative", height: 200 }}>
        <ScrollBarImpl height="100%">
          <div style={{ height: "100%" }}>
            <div>
              <Nfts
                localSelection={[]}
                rounded
                onSelect={(nft: Nft) => {
                  sendMessage("NFT Sticker", "nft-sticker", {
                    mint: nft.mint || "",
                  });
                  setAboveMessagePlugin({
                    type: "",
                    metadata: {},
                  });
                  setOpenPlugin("");
                  setPluginMenuOpen(false);
                }}
              />
            </div>
          </div>
        </ScrollBarImpl>
      </div>
    </div>
  );
};
