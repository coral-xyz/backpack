import { Blockchain, DerivationPath } from "@coral-xyz/common";
import {
  useBackgroundClient,
  useSolanaConnectionUrl,
  // useTotal,
} from "@coral-xyz/recoil";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import {
  req_UI_RPC_METHOD_BLOCKCHAINS_ENABLED_ADD,
  req_UI_RPC_METHOD_BLOCKCHAINS_ENABLED_DELETE,
  req_UI_RPC_METHOD_CONNECTION_URL_UPDATE,
  req_UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
  req_UI_RPC_METHOD_KEYRING_EXPORT_MNEMONIC,
  req_UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
  req_UI_RPC_METHOD_KEYRING_RESET,
  req_UI_RPC_METHOD_KEYRING_STORE_CHECK_PASSWORD,
  req_UI_RPC_METHOD_KEYRING_STORE_LOCK,
  req_UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE,
  req_UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
  req_UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
  req_UI_RPC_METHOD_KEYRING_VALIDATE_MNEMONIC,
  req_UI_RPC_METHOD_PASSWORD_UPDATE,
  req_UI_RPC_METHOD_PREVIEW_PUBKEYS,
  req_UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE,
} from "./lib/useRequest";

const TEST_MNEMONIC =
  "cruel repair valve zone rookie silver dilemma finger holiday size certain fly";

export default function AppRPCCallTesting() {
  const background = useBackgroundClient();
  const connectionUrl = useSolanaConnectionUrl();
  const [res, setRes] = useState("");
  const [responses, setResponses] = useState(new Map());

  useEffect(() => {
    async function testRpcMethods() {
      const keyRingReset = await req_UI_RPC_METHOD_KEYRING_RESET(background);
      responses.set("keyring-reset", keyRingReset);

      const keyringStoreUnlock = await req_UI_RPC_METHOD_KEYRING_STORE_UNLOCK(
        background,
        {
          password: "backpack",
        }
      );

      responses.set("keyring-store-unlock", keyringStoreUnlock);

      const previewPubkeys = await req_UI_RPC_METHOD_PREVIEW_PUBKEYS(
        background,
        {
          mnemonic: TEST_MNEMONIC,
          derivationPath: DerivationPath.Bip44,
          blockchain: Blockchain.ETHEREUM,
        }
      );

      responses.set("preview-pubkeys", previewPubkeys);

      // TODO app-extensions (validateSecretKey)
      // await req_UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY(background, {
      //   blockchain: Blockchain.SOLANA,
      //   secretKeyHex: "",
      //   name: "peter6969",
      // });

      const keyringCheckPassword =
        await req_UI_RPC_METHOD_KEYRING_STORE_CHECK_PASSWORD(background, {
          password: "backpack",
        });

      responses.set("check-password", keyringCheckPassword);

      const exportMnemonic = await req_UI_RPC_METHOD_KEYRING_EXPORT_MNEMONIC(
        background,
        {
          password: "backpack",
        }
      );

      responses.set("export-mnemonic", exportMnemonic);

      const createMnemonic =
        await req_UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE(background, {
          mnemonicWords: TEST_MNEMONIC.split(" "),
        });

      responses.set("create-mnemonic", exportMnemonic);

      const testMnemonic = await req_UI_RPC_METHOD_KEYRING_VALIDATE_MNEMONIC(
        background,
        {
          mnemonic: TEST_MNEMONIC,
        }
      );

      responses.set("create-mnemonic", testMnemonic);

      const updatePassword = await req_UI_RPC_METHOD_PASSWORD_UPDATE(
        background,
        {
          currentPassword: "backpack",
          newPassword: "backpack",
        }
      );

      responses.set("update-password", updatePassword);

      const readAllPubKeys =
        await req_UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS(background);

      responses.set("read-all-pubkeys", readAllPubKeys);

      // console.log("key ring derive");
      // const keyringDeriveWallet = await req_UI_RPC_METHOD_KEYRING_DERIVE_WALLET(
      //   background,
      //   {
      //     blockchain: Blockchain.ETHEREUM,
      //   }
      // );
      // console.log("key ring derive END", keyringDeriveWallet);
      //
      // responses.set("keyring-derive-wallet", keyringDeriveWallet);

      await req_UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE(background, {
        isDarkMode: true,
      });

      // await req_UI_RPC_METHOD_BLOCKCHAINS_ENABLED_DELETE(background, {
      //   blockchain: Blockchain.ETHEREUM,
      // });
      //
      // await req_UI_RPC_METHOD_BLOCKCHAINS_ENABLED_ADD(background, {
      //   blockchain: Blockchain.ETHEREUM,
      // });

      // await req_UI_RPC_METHOD_CONNECTION_URL_UPDATE(background, {
      //   url: connectionUrl,
      // });

      const keyringLock = await req_UI_RPC_METHOD_KEYRING_STORE_LOCK(
        background
      );

      responses.set("keyring-lock", keyringLock);
      console.log("hi");

      setResponses(responses);
    }

    testRpcMethods();
  });

  console.log("responses", responses);
  console.log("responses.entries()", responses.entries());
  console.log("array.from", Array.from(responses.entries()));
  const strResult = "";
  console.log("strResult", strResult);

  return (
    <View style={{ backgroundColor: "white", flex: 1 }}>
      <Text style={{ color: "black" }}>{strResult}</Text>
      <Text style={{ color: "black" }}>{res}</Text>
    </View>
  );
}
