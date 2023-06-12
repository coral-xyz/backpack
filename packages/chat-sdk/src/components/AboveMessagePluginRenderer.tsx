import React, { useEffect, useState } from "react";
import {
  BACKEND_API_URL,
  Blockchain,
  formatWalletAddress,
  toDisplayBalance,
} from "@coral-xyz/common";
import {
  List,
  ListItem,
  MaxLabel,
  PrimaryButton,
  SecondaryButton,
  TextFieldLabel,
  TextInput,
  toast,
  useBreakpoints,
} from "@coral-xyz/react-common";
import {
  blockchainTokenData,
  useActiveSolanaWallet,
  useAnchorContext,
  useBackgroundClient,
  useLoader,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import CloseIcon from "@mui/icons-material/Close";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { TextField } from "@mui/material";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

import { createEscrow } from "../utils/secure-transfer/secureTransfer";

import { CheckMark } from "./barter/CheckMark";
import { ExplorerLink, RemoteNftWithSuspense } from "./barter/SwapPage";
import { NftStickerPlugin } from "./plugins/NftStickerPlugin";
import { useChatContext } from "./ChatContext";

export const AboveMessagePluginRenderer = ({
  sendMessage,
  setAboveMessagePlugin,
  setPluginMenuOpen,
}) => {
  const { aboveMessagePlugin } = useChatContext();
  const theme = useCustomTheme();
  return (
    <div
      style={{
        background: theme.custom.colors.bg3,
        borderRadius: 12,
        boxShadow: `0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)`,
      }}
    >
      {aboveMessagePlugin.type === "secure-transfer" ? (
        <SecureTransferPlugin
          sendMessage={sendMessage}
          setAboveMessagePlugin={setAboveMessagePlugin}
        />
      ) : null}
      {aboveMessagePlugin.type === "nft-sticker" ? (
        <AboveNftStickerPlugin setPluginMenuOpen={setPluginMenuOpen} />
      ) : null}
    </div>
  );
};

function AboveNftStickerPlugin({ setPluginMenuOpen }) {
  return (
    <div>
      <NftStickerPlugin setPluginMenuOpen={setPluginMenuOpen} />
    </div>
  );
}

function SecureTransferPlugin({ sendMessage, setAboveMessagePlugin }) {
  const { provider, connection } = useAnchorContext();
  const { remoteUserId } = useChatContext();
  const background = useBackgroundClient();
  const { publicKey } = useActiveSolanaWallet();
  const [publicKeysLoading, setPublicKeysLoading] = useState(true);
  const [publicKeys, setPublicKeys] = useState<string[]>([]);
  const theme = useCustomTheme();
  const [selectedPublicKey, setSelectedPublickey] = useState("");
  const [amount, setAmount] = useState("0");
  const [submitting, setSubmitting] = useState(false);
  const [token] = useLoader(
    blockchainTokenData({
      publicKey,
      blockchain: Blockchain.SOLANA,
      tokenAddress: publicKey,
    }),
    null
  );

  const refreshUserPubkeys = async (remoteUserId) => {
    setPublicKeysLoading(true);
    try {
      const res = await fetch(
        `${BACKEND_API_URL}/users/userById?remoteUserId=${remoteUserId}`
      );
      const data = await res.json();
      const publicKeys = data.user.publicKeys
        .filter((x) => x.blockchain === Blockchain.SOLANA)
        .map((x) => x.publicKey);
      setPublicKeys(publicKeys);
      setSelectedPublickey(publicKeys[0]);
    } catch (e) {
      console.error(e);
    }
    setPublicKeysLoading(false);
  };

  useEffect(() => {
    if (remoteUserId) {
      refreshUserPubkeys(remoteUserId);
    }
  }, [remoteUserId]);

  return (
    <div
      style={{
        background: theme.custom.colors.invertedPrimary,
        padding: 10,
        borderRadius: 12,
        marginBottom: 3,
      }}
    >
      {/*<div style={{display: "flex", marginBottom: 5, height: 20}}>*/}
      {/*    {publicKeysLoading && <div style={{display: "flex", marginRight: 4}}> <div style={{display: "flex", justifyContent: "center", flexDirection: "column", marginRight: 3}}> <FiberManualRecordIcon style={{fontSize: 15, color: "yellow", marginTop: 2}} /> </div> <div style={{color: theme.custom.colors.background}}> Loading public key </div> </div>}*/}
      {/*</div>*/}
      <div style={{ marginBottom: 10 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: 5,
            fontSize: 13,
          }}
        >
          <div style={{ color: theme.custom.colors.background }}>Amount</div>
          <div
            style={{ color: theme.custom.colors.background, cursor: "pointer" }}
            onClick={() => {
              setAmount(
                (
                  parseInt(token?.nativeBalance?.toString() || "0") /
                  LAMPORTS_PER_SOL
                ).toString()
              );
            }}
          >
            Max:{" "}
            {token?.nativeBalance
              ? toDisplayBalance(token?.nativeBalance, token?.decimals || 0)
              : "-"}
          </div>
        </div>
        <TextField
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: theme.custom.colors.invertedSecondary,
                borderRadius: 6,
              },
              "&:hover fieldset": {
                borderColor: theme.custom.colors.invertedSecondary,
              },
              "&.Mui-focused fieldset": {
                borderColor: "#4C94FF",
              },
            },
            input: {
              padding: "12px 12px",
              color: theme.custom.colors.background,
              background: theme.custom.colors.invertedSecondary,
              borderRadius: 6,
            },
          }}
          fullWidth
          margin="none"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <SecondaryButton
        label={
          !publicKeysLoading && !selectedPublicKey
            ? "User doesn't have an active pubkey set"
            : submitting
            ? "Sending Secure transfer..."
            : "Secure transfer SOL"
        }
        disabled={publicKeysLoading || !selectedPublicKey || submitting}
        onClick={async () => {
          if (
            !selectedPublicKey ||
            !publicKeys.includes(selectedPublicKey) ||
            !amount
          ) {
            return;
          }
          setSubmitting(true);
          try {
            const { signature, counter, escrow } = await createEscrow(
              provider,
              background,
              connection,
              // @ts-ignore
              amount,
              new PublicKey(publicKey),
              new PublicKey(selectedPublicKey)
            );
            sendMessage("Secure transfer", "secure-transfer", {
              signature,
              counter,
              escrow,
              current_state: "pending",
            });
            toast.success("", `Created secure transfer for ${amount} SOL`);
          } catch (e) {
            console.error(e);
          }
          setSubmitting(false);
          setAboveMessagePlugin("");
        }}
      />
    </div>
  );
}
