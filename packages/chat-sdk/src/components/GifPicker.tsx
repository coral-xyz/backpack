import { useState } from "react";
import { useCustomTheme } from "@coral-xyz/themes";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { Carousel } from "@giphy/react-components";
import GifIcon from "@mui/icons-material/Gif";
import { IconButton } from "@mui/material";
import Popover from "@mui/material/Popover";

// use @giphy/js-fetch-api to fetch gifs, instantiate with your api key
const gf = new GiphyFetch("SjZwwCn1e394TKKjrMJWb2qQRNcqW8ro");
const fetchGifs = (offset: number) => gf.trending({ offset, limit: 10 });

export const GifPicker = ({
  setGifPicker,
  gifPicker,
  setEmojiPicker,
  sendMessage,
  buttonStyle,
}: any) => {
  const theme = useCustomTheme();
  const [anchorEl, setAnchorEl] = useState<any | null>(null);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <IconButton
        size={"small"}
        style={{ color: theme.custom.colors.icon, ...buttonStyle }}
        onClick={(e) => {
          setGifPicker((x) => !x);
          if (!gifPicker) {
            setEmojiPicker(false);
          }
          setAnchorEl(e.currentTarget);
        }}
      >
        {" "}
        <GifIcon
          style={{ color: theme.custom.colors.icon, fontSize: 20 }}
        />{" "}
      </IconButton>
      <Popover
        id={"popover2"}
        open={gifPicker}
        anchorEl={anchorEl}
        onClose={() => setGifPicker(false)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <div style={{ width: 400 }}>
          <Carousel
            onGifClick={(x, e) => {
              sendMessage(x.id, "gif");
              setGifPicker(false);
              e.preventDefault();
            }}
            gifHeight={100}
            gutter={6}
            fetchGifs={fetchGifs}
          />
        </div>
      </Popover>
    </div>
  );
};
