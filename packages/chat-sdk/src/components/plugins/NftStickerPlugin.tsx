import type { Nft } from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import CloseIcon from "@mui/icons-material/Close";

import { Nfts } from "../barter/SelectPage";

export const NftStickerPlugin = ({
  setAboveMessagePlugin,
  setPluginMenuOpen,
  sendMessage,
}: {
  setAboveMessagePlugin: any;
  setPluginMenuOpen: any;
  sendMessage: any;
}) => {
  const theme = useCustomTheme();

  return (
    <div style={{ maxHeight: "40vh" }}>
      <div style={{ display: "flex" }}>
        <div style={{ margin: 4 }}>
          <CloseIcon
            style={{ color: theme.custom.colors.icon, cursor: "pointer" }}
            onClick={() => {
              setAboveMessagePlugin("");
              setPluginMenuOpen(false);
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              fontSize: 20,
              color: theme.custom.colors.fontColor,
              marginTop: 10,
            }}
          >
            Show off your NFT
          </div>
        </div>
      </div>
      <div style={{ overflowY: "scroll" }}>
        <div>
          <Nfts
            localSelection={[]}
            onSelect={(nft: Nft) => {
              sendMessage("NFT Sticker", "nft-sticker", {
                mint: nft.mint,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};
