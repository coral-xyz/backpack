import { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import {
  UI_RPC_METHOD_FIND_SERVER_PUBLIC_KEY_CONFLICTS,
  validatePrivateKey,
  walletAddressDisplay,
} from "@coral-xyz/common";
import { PrimaryButton, TextInput } from "@coral-xyz/react-common";
import { useBackgroundClient, useWalletPublicKeys } from "@coral-xyz/recoil";
import { Box } from "@mui/material";

import { Header, SubtextParagraph } from "../../common";

export const PrivateKeyInput = ({
  blockchain,
  onNext,
  publicKey,
}: {
  blockchain: Blockchain;
  onNext: (publicKey: string, privateKey: string) => void;
  publicKey?: string;
}) => {
  const background = useBackgroundClient();
  const existingPublicKeys = useWalletPublicKeys();
  const [name, setName] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear error on form input changes
    setError(null);
  }, [name, privateKey, setError]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Do some validation of the private key
    let _privateKey, _publicKey;
    try {
      ({ privateKey: _privateKey, publicKey: _publicKey } = validatePrivateKey(
        blockchain,
        privateKey,
        existingPublicKeys
      ));
    } catch (e) {
      setLoading(false);
      setError((e as Error).message);
      return;
    }

    // Check if the public key we have is the public key we wanted (if we were
    // looking for a specific public key)
    if (publicKey && publicKey !== _publicKey) {
      setLoading(false);
      setError(`Incorrect private key for ${walletAddressDisplay(publicKey)}`);
      return;
    } else {
      // If we aren't searching for a public key we are adding it to the account,
      // check for conflicts.
      const response = await background.request({
        method: UI_RPC_METHOD_FIND_SERVER_PUBLIC_KEY_CONFLICTS,
        params: [[{ blockchain, publicKey: _publicKey }]],
      });
      if (response.length > 0) {
        setError("Wallet address is used by another Backpack account");
        return;
      }
    }

    onNext(_privateKey, _publicKey);
  };

  return (
    <form
      noValidate
      onSubmit={onSave}
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
                Enter your private key. It will be encrypted and stored on your
                device.
              </>
            )}
          </SubtextParagraph>
        </Box>
        <Box sx={{ margin: "0 16px" }}>
          <Box sx={{ marginBottom: "4px" }}>
            <TextInput
              autoFocus
              placeholder="Name"
              value={name}
              setValue={(e) => setName(e.target.value)}
            />
          </Box>
          <TextInput
            placeholder="Enter private key"
            value={privateKey}
            setValue={(e) => {
              setPrivateKey(e.target.value);
            }}
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                await onSave(e);
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
          disabled={privateKey.length === 0 || loading}
        />
      </Box>
    </form>
  );
};
