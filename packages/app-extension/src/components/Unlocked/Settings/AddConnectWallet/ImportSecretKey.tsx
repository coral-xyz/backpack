import { useEffect, useState } from "react";
import {
  Blockchain,
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

export function ImportSecretKey({
  blockchain,
  publicKey,
}: {
  blockchain: Blockchain;
  publicKey?: string;
}) {
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

  useEffect(() => {
    // Clear error on form input changes
    setError(null);
  }, [name, secretKey]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    let privateKey, _publicKey;
    try {
      ({ privateKey, publicKey: _publicKey } = validateSecretKey(
        blockchain,
        secretKey,
        existingPublicKeys
      ));
    } catch (e) {
      setLoading(false);
      setError((e as Error).message);
      return;
    }

    if (publicKey && publicKey !== _publicKey) {
      setLoading(false);
      setError(`Incorrect private key for ${walletAddressDisplay(publicKey)}`);
      return;
    }

    if (privateKey) {
      try {
        const newPublicKey = await background.request({
          method: UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
          params: [blockchain, privateKey, name],
        });
        setNewPublicKey(newPublicKey);
        setOpenDrawer(true);
      } catch (error) {
        setError("Wallet address is used by another Backpack account.");
      }
      setLoading(false);
    }
  };

  return (
    <>
      <form
        noValidate
        onSubmit={save}
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ margin: "24px 0" }}>
          <Box sx={{ margin: "0 24px" }}>
            <Header text="Import private key" />
            <SubtextParagraph style={{ marginBottom: "32px" }}>
              {publicKey ? (
                <>
                  Enter the private key for {walletAddressDisplay(publicKey)} to
                  recover the wallet.
                </>
              ) : (
                <>
                  Enter your private key. It will be encrypted and stored on
                  your device.
                </>
              )}
            </SubtextParagraph>
          </Box>
          <Box sx={{ margin: "0 16px" }}>
            <Box sx={{ marginBottom: "4px" }}>
              <TextInput
                autoFocus={true}
                placeholder="Name"
                value={name}
                setValue={(e) => setName(e.target.value)}
              />
            </Box>
            <TextInput
              placeholder="Enter private key"
              value={secretKey}
              setValue={(e) => {
                setSecretKey(e.target.value);
              }}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  await save(e);
                }
              }}
              rows={4}
              error={error ? true : false}
              errorMessage={error || ""}
            />
          </Box>
        </Box>
        <Box
          sx={{
            marginLeft: "16px",
            marginRight: "16px",
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <PrimaryButton
            type="submit"
            label="Import"
            disabled={secretKey.length === 0 || loading}
          />
        </Box>
      </form>
      <WithMiniDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
        <ConfirmCreateWallet
          blockchain={blockchain}
          publicKey={newPublicKey}
          onClose={() => {
            setOpenDrawer(false);
            closeParentDrawer();
          }}
        />
      </WithMiniDrawer>
    </>
  );
}

// Validate a secret key and return a normalised hex representation
function validateSecretKey(
  blockchain: Blockchain,
  secretKey: string,
  keyring: WalletPublicKeys
): { privateKey: string; publicKey: string } {
  // Extract public keys from keychain object into array of strings
  const existingPublicKeys = Object.values(keyring[blockchain])
    .map((k) => k.map((i) => i.publicKey))
    .flat();

  if (blockchain === Blockchain.SOLANA) {
    let keypair: Keypair | null = null;
    try {
      // Attempt to create a keypair from JSON secret key
      keypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(secretKey)));
    } catch (_) {
      try {
        // Attempt to create a keypair from bs58 decode of secret key
        keypair = Keypair.fromSecretKey(new Uint8Array(bs58.decode(secretKey)));
      } catch (_) {
        // Failure
        throw new Error("Invalid private key");
      }
    }

    if (existingPublicKeys.includes(keypair.publicKey.toString())) {
      throw new Error("Key already exists");
    }

    return {
      privateKey: Buffer.from(keypair.secretKey).toString("hex"),
      publicKey: keypair.publicKey.toString(),
    };
  } else if (blockchain === Blockchain.ETHEREUM) {
    let wallet;
    try {
      wallet = new ethers.Wallet(secretKey);
    } catch (_) {
      throw new Error("Invalid private key");
    }
    if (existingPublicKeys.includes(wallet.address)) {
      throw new Error("Key already exists");
    }
    return { privateKey: wallet.privateKey, publicKey: wallet.address };
  }
  throw new Error("secret key validation not implemented for blockchain");
}
