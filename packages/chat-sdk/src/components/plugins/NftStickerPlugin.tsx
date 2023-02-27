import type { Nft } from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import CloseIcon from "@mui/icons-material/Close";

import { Nfts } from "../barter/SelectPage";
import { useChatContext } from "../ChatContext";

export const NftStickerPlugin = () => {
  const { setOpenPlugin, setAboveMessagePlugin } = useChatContext();
  const theme = useCustomTheme();

  return (
    <div style={{ height: "100%" }}>
      <div style={{ display: "flex" }}>
        <div style={{ margin: 4 }}>
          <CloseIcon
            style={{ color: theme.custom.colors.icon, cursor: "pointer" }}
            onClick={() => {
              setAboveMessagePlugin({ type: "", metadata: {} });
              setOpenPlugin("");
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              fontSize: 18,
              color: theme.custom.colors.fontColor,
              marginTop: 10,
            }}
          >
            Send Stickers
          </div>
        </div>
      </div>
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <Nfts
            localSelection={[]}
            onSelect={(nft: Nft) => {
              setAboveMessagePlugin({
                type: "nft-sticker",
                metadata: {
                  mint: nft.mint || "",
                },
              });
              setOpenPlugin("");
            }}
          />
        </div>
      </div>
    </div>
  );
};
