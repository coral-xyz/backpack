import { useEffect, useState } from "react";
import type { Blockchain, ServerPublicKey } from "@coral-xyz/common";
import { formatWalletAddress, validatePrivateKey } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { TextInput } from "@coral-xyz/react-common";
import { BpPrimaryButton } from "@coral-xyz/tamagui";
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
  const [name, setName] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    // Clear error on form input changes
    setError(null);
  }, [name, privateKey, setError]);

  const onSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const result = validatePrivateKey(privateKey.trim(), blockchain);

    if (result) {
      onNext({
        name,
        ...result,
      });
    }
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
          <Header text={t("enter_private_key")} />
          <SubtextParagraph style={{ marginBottom: "32px" }}>
            {serverPublicKeys && serverPublicKeys.length === 1 ? (
              <>
                Enter the private key for{" "}
                {formatWalletAddress(serverPublicKeys[0].publicKey)} to recover
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
              setPrivateKey(e.target.value.trim());
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
        <BpPrimaryButton
          onPress={() => onSave()}
          label="Import"
          disabled={privateKey.length === 0 || loading}
        />
      </Box>
    </form>
  );
};
