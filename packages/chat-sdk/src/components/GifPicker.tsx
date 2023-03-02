import { useEffect, useState } from "react";
import { TextInput } from "@coral-xyz/react-common";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { Carousel } from "@giphy/react-components";
import GifIcon from "@mui/icons-material/GifBoxOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton, Tooltip } from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import Popover from "@mui/material/Popover";

// use @giphy/js-fetch-api to fetch gifs, instantiate with your api key
const gf = new GiphyFetch("SjZwwCn1e394TKKjrMJWb2qQRNcqW8ro");

let debouncedTimer;

export const useStyles = styles((theme) => ({
  searchField: {
    width: "inherit",
    display: "flex",
    marginTop: 0,
    "& .MuiOutlinedInput-root": {
      "& input": {
        paddingTop: 10,
        paddingBottom: 10,
      },
    },
  },
}));

export const GifPicker = ({
  setGifPicker,
  gifPicker,
  setEmojiPicker,
  sendMessage,
  buttonStyle,
}: any) => {
  const theme = useCustomTheme();
  const [anchorEl, setAnchorEl] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const fetchGifs = (offset: number) =>
    searchFilter
      ? gf.search(searchFilter, { limit: 10, offset })
      : gf.trending({ limit: 10, offset });
  const classes = useStyles();

  const refreshSearch = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 250);
  };

  const debouncedInit = () => {
    clearTimeout(debouncedTimer);
    debouncedTimer = setTimeout(() => {
      refreshSearch();
    }, 400);
  };

  useEffect(() => {
    debouncedInit();
  }, [searchFilter]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <Tooltip title="GIF">
        <IconButton
          size="small"
          sx={{
            color: theme.custom.colors.icon,
            "&:hover": {
              background: `${theme.custom.colors.avatarIconBackground} !important`,
            },
          }}
          style={buttonStyle}
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
      </Tooltip>
      <Popover
        id="popover2"
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
        <div
          style={{
            maxWidth: 400,
            background: theme.custom.colors.background,
            padding: 5,
          }}
        >
          <TextInput
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon style={{ color: theme.custom.colors.icon }} />
              </InputAdornment>
            }
            placeholder="Search for GIFs"
            className={classes.searchField}
            value={searchFilter}
            setValue={(e) => setSearchFilter(e.target.value)}
          />
          {loading ? <div style={{ height: 100 }} /> : null}
          {!loading ? <Carousel
            onGifClick={(x, e) => {
                  sendMessage(x.id, "gif");
                  setGifPicker(false);
                  e.preventDefault();
                }}
            gifHeight={100}
            gutter={6}
            fetchGifs={fetchGifs}
              /> : null}
        </div>
      </Popover>
    </div>
  );
};
