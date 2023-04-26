import { StickerIcon } from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";
import { IconButton, Tooltip } from "@mui/material";

export const NftSticker = ({
  buttonStyle,
  setAboveMessagePlugin,
  setPluginMenuOpen,
}: {
  buttonStyle: any;
  setAboveMessagePlugin: any;
  setPluginMenuOpen: any;
}) => {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <Tooltip title="NFT stickers">
        <IconButton
          onClick={() => {
            setAboveMessagePlugin((x) =>
              x.type === "nft-sticker"
                ? {
                    type: "",
                    metadata: {},
                  }
                : { type: "nft-sticker", metadata: {} }
            );
          }}
          size="small"
          sx={{
            color: theme.custom.colors.icon,
            cursor: "pointer",
          }}
          style={buttonStyle}
        >
          <StickerIcon fill={theme.custom.colors.icon} />
        </IconButton>
      </Tooltip>
    </div>
  );
};
