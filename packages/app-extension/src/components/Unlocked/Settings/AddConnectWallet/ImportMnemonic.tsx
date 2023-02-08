import { useEffect, useState } from "react";
import type {
  Blockchain} from "@coral-xyz/common";
import {
  UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
  walletAddressDisplay,
} from "@coral-xyz/common";
import { PrimaryButton, TextInput } from "@coral-xyz/react-common";
import type { WalletPublicKeys } from "@coral-xyz/recoil";
import { useBackgroundClient, useWalletPublicKeys } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Box } from "@mui/material";
import { Keypair } from "@solana/web3.js";
import * as bs58 from "bs58";
import { ethers } from "ethers";

import { Header, SubtextParagraph } from "../../../common";
import {
  useDrawerContext,
  WithMiniDrawer,
} from "../../../common/Layout/Drawer";
import { useNavigation } from "../../../common/Layout/NavStack";

import { ConfirmCreateWallet } from ".";

export function ImportMnemonic({ blockchain }: { blockchain: Blockchain }) {
  const background = useBackgroundClient();
  const existingPublicKeys = useWalletPublicKeys();
  const nav = useNavigation();
  const theme = useCustomTheme();
  const [name, setName] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [newPublicKey, setNewPublicKey] = useState("");
  const [loading, setLoading] = useState(false);
  const { close: closeParentDrawer } = useDrawerContext();

  useEffect(() => {
    const prevTitle = nav.title;
    nav.setOptions({ headerTitle: "" });
    return () => {
      nav.setOptions({ headerTitle: prevTitle });
    };
  }, [theme]);

  return <></>;
}
