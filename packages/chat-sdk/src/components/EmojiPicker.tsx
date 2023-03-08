import { useState } from "react";
import { useCustomTheme } from "@coral-xyz/themes";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticonRounded";
import { IconButton } from "@mui/material";
import Popover from "@mui/material/Popover";
import Tooltip from "@mui/material/Tooltip";
import EmojiPicker, { Theme } from "emoji-picker-react";

import { useChatContext } from "./ChatContext";

export const EmojiPickerComponent = ({
  setEmojiPicker,
  emojiPicker,
  setGifPicker,
  buttonStyle,
  inputRef,
}) => {
  const theme = useCustomTheme();
  const [anchorEl, setAnchorEl] = useState<any | null>(null);
  const { isDarkMode } = useChatContext();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Tooltip title="Emoji">
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
            setEmojiPicker((x) => !x);
            if (!emojiPicker) {
              setGifPicker(false);
            }
            setAnchorEl(e.currentTarget);
          }}
        >
          {" "}
          <InsertEmoticonIcon
            style={{ color: theme.custom.colors.icon, fontSize: 20 }}
          />{" "}
        </IconButton>
      </Tooltip>
      <Popover
        id="popover"
        open={emojiPicker}
        anchorEl={anchorEl}
        onClose={() => setEmojiPicker(false)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        style={{ marginBottom: 10 }}
      >
        <EmojiPicker
          previewConfig={{ showPreview: false }}
          theme={isDarkMode ? Theme.DARK : Theme.LIGHT}
          height={400}
          width="100%"
          onEmojiClick={(e) => {
            inputRef.current.setValue(
              `${inputRef.current.getTransformedValue()} ${e.emoji}`
            );
          }}
        />
      </Popover>
    </div>
  );
};
