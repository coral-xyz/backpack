import { useEffect, useState } from "react";
import type { Blockchain, ServerPublicKey } from "@coral-xyz/common";
import { formatWalletAddress } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { userClientAtom } from "@coral-xyz/recoil";
import type {
  BlockchainWalletDescriptor,
  BlockchainWalletDescriptorType,
} from "@coral-xyz/secure-background/types";
import { BlockchainWalletPreviewType } from "@coral-xyz/secure-background/types";
import { safeClientResponse } from "@coral-xyz/secure-clients";
import {
  BpInputInner,
  BpPrimaryButton,
  StyledText,
  YStack,
} from "@coral-xyz/tamagui";
import { useRecoilValue } from "recoil";

export const PrivateKeyInput = ({
  blockchain,
  onNext,
  serverPublicKeys,
  fullscreen = true,
}: {
  blockchain: Blockchain;
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
  fullscreen?: boolean;
}) => {
  const { t } = useTranslation();
  const [privateKey, setPrivateKey] = useState("");
  const userClient = useRecoilValue(userClientAtom);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear error on form input changes
    setError(null);
  }, [privateKey, setError]);

  const onSave = async (e?: any) => {
    e?.preventDefault();
    try {
      const wallets = await safeClientResponse(
        userClient.previewWallets({
          type: BlockchainWalletPreviewType.PRIVATEKEY,
          privateKey,
          blockchain,
        })
      );

      const validated = wallets.wallets[0]
        .walletDescriptors[0] as BlockchainWalletDescriptor<BlockchainWalletDescriptorType.PRIVATEKEY>;

      if (validated.imported) {
        // handle already imported
      }

      onNext({
        name: "",
        blockchain,
        publicKey: validated.publicKey,
        privateKey,
      });
    } catch (err: any) {
      console.error("failed to import private key", err.message);
      setError(err.message ?? "");
    }
  };

  return (
    <YStack
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        gap: fullscreen ? 40 : 20,
        padding: fullscreen ? undefined : "0 16px 20px",
      }}
    >
      <YStack gap={16}>
        <StyledText fontSize={36} fontWeight="$semiBold" textAlign="center">
          {t("enter_private_key")}
        </StyledText>
        <StyledText color="$baseTextMedEmphasis" textAlign="center">
          {serverPublicKeys && serverPublicKeys.length === 1 ? (
            <>
              Enter the private key for{" "}
              {formatWalletAddress(serverPublicKeys[0].publicKey)} to recover
              the wallet.
            </>
          ) : (
            <>{t("enter_private_key_description")}</>
          )}
        </StyledText>
      </YStack>
      <BpInputInner
        autoFocus
        role="presentation"
        autoComplete="off"
        autoCorrect={false}
        multiline
        hasError={!!error}
        padding={8}
        placeholder={t("enter_private_key")}
        rows={6}
        value={privateKey}
        wrapperProps={{ flex: 1, justifyContent: "flex-start" }}
        onChangeText={(val) => setPrivateKey(val.trim())}
        onKeyPress={async (e) => {
          if (e.nativeEvent.key === "Enter") {
            await onSave(e);
          }
        }}
      />
      <YStack maxWidth={420}>
        <BpPrimaryButton
          onPress={onSave}
          flex={0}
          disabled={privateKey.length === 0}
          label={t("import")}
        />
      </YStack>
      {/* NOTE: added inline password text security properties to private key text area since Tamagui feature (secureTextEntry) wasn't working */}
      <style>
        {`
        #private-key-input {
          -webkit-text-security: disc;
          -moz-text-security: disc;
          text-security: disc;
        }
      `}
      </style>
    </YStack>
  );
};
