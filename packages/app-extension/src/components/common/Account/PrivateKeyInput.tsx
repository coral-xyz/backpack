import { useEffect, useState } from "react";
import type { Blockchain, ServerPublicKey } from "@coral-xyz/common";
import {
  UI_RPC_METHOD_FIND_SERVER_PUBLIC_KEY_CONFLICTS,
  validatePrivateKey,
  walletAddressDisplay,
} from "@coral-xyz/common";
import { PrimaryButton, TextInput } from "@coral-xyz/react-common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { Box } from "@mui/material";

import { Header, SubtextParagraph } from "../../common";

export const PrivateKeyInput = ({
  blockchain,
  onNext,
  serverPublicKeys,
  displayNameInput = false,
}: {
  blockchain?: Blockchain;
  onNext: ({
    blockchain,
    publicKey,
    privateKey,
    name,
  }: {
    blockchain: Blockchain;
    publicKey: string;
    privateKey: string;
    name: string;
  }) => void;
  serverPublicKeys?: Array<ServerPublicKey>;
  displayNameInput?: boolean;
}) => {
  const background = useBackgroundClient();
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
    let _privateKey: string, _publicKey: string, _blockchain: Blockchain;
    try {
      ({
        privateKey: _privateKey,
        publicKey: _publicKey,
        blockchain: _blockchain,
      } = validatePrivateKey(privateKey, blockchain));
    } catch (e) {
      setLoading(false);
      setError((e as Error).message);
      return;
    }

    // Check if the public key we have is the public key we wanted (if we were
    // looking for a specific public key)
    if (serverPublicKeys && serverPublicKeys.length > 0) {
      setLoading(false);
      const found = !!serverPublicKeys.find(
        (s: { publicKey: string; blockchain: Blockchain }) =>
          s.publicKey === _publicKey && s.blockchain === _blockchain
      );
      if (!found) {
        if (serverPublicKeys.length === 1) {
          setError(
            `Incorrect private key for ${walletAddressDisplay(
              serverPublicKeys[0].publicKey
            )}. The public key was ${walletAddressDisplay(_publicKey)}.`
          );
        } else {
          setError(
            `Public key ${walletAddressDisplay(
              _publicKey
            )} not found on your Backpack account.`
          );
        }
      }
    } else {
      // If we aren't searching for a public key we are adding it to the account,
      // check for conflicts.
      const response = await background.request({
        method: UI_RPC_METHOD_FIND_SERVER_PUBLIC_KEY_CONFLICTS,
        params: [[{ blockchain: _blockchain, publicKey: _publicKey }]],
      });
      if (response.length > 0) {
        setError("Wallet address is used by another Backpack account");
        return;
      }
    }

    onNext({
      blockchain: _blockchain,
      publicKey: _publicKey,
      privateKey: _privateKey,
      name,
    });
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
          <Header text="Enter private key" />
          <SubtextParagraph style={{ marginBottom: "32px" }}>
            {serverPublicKeys && serverPublicKeys.length === 1 ? (
              <>
                Enter the private key for{" "}
                {walletAddressDisplay(serverPublicKeys[0].publicKey)} to recover
                the wallet.
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
          {displayNameInput ? (
            <Box sx={{ marginBottom: "4px" }}>
              <TextInput
                autoFocus
                placeholder="Name"
                value={name}
                setValue={(e) => setName(e.target.value)}
              />
            </Box>
          ) : null}
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
