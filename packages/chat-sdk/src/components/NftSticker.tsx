import { useEffect, useState } from "react";
import {
  BACKEND_API_URL,
  Blockchain,
  walletAddressDisplay,
} from "@coral-xyz/common";
import {
  List,
  ListItem,
  MaxLabel,
  PrimaryButton,
  TextFieldLabel,
  TextInput,
  toast,
} from "@coral-xyz/react-common";
import {
  blockchainTokenData,
  useActiveSolanaWallet,
  useAnchorContext,
  useBackgroundClient,
  useLoader,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import CheckIcon from "@mui/icons-material/Check";
import { IconButton , Tooltip } from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

import { useChatContext } from "./ChatContext";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 320,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export const NftSticker = ({
  buttonStyle,
  setAboveMessagePlugin,
}: {
  buttonStyle: any;
  setAboveMessagePlugin: any;
}) => {
  const theme = useCustomTheme();
  const { setOpenPlugin } = useChatContext();
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
          size="small"
          sx={{
            color: theme.custom.colors.icon,
            cursor: "pointer",
          }}
          style={buttonStyle}
        >
          <BrokenImageIcon
            style={{ fontSize: 20 }}
            onClick={() =>
              setOpenPlugin((x) => (x === "nft-sticker" ? "" : "nft-sticker"))
            }
          />
        </IconButton>
      </Tooltip>
    </div>
  );
};
