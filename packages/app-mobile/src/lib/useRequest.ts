// @ts-nocheck
import type { Blockchain, DerivationPath } from "@coral-xyz/common";
import {
  UI_RPC_METHOD_BLOCKCHAINS_ENABLED_ADD,
  UI_RPC_METHOD_BLOCKCHAINS_ENABLED_DELETE,
  UI_RPC_METHOD_CONNECTION_URL_UPDATE,
  UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
  UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
  UI_RPC_METHOD_KEYRING_EXPORT_MNEMONIC,
  UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
  UI_RPC_METHOD_KEYRING_RESET,
  UI_RPC_METHOD_KEYRING_STORE_CHECK_PASSWORD,
  UI_RPC_METHOD_KEYRING_STORE_CREATE,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
  UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
  UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
  UI_RPC_METHOD_KEYRING_VALIDATE_MNEMONIC,
  UI_RPC_METHOD_LEDGER_IMPORT,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
  UI_RPC_METHOD_NAVIGATION_TO_ROOT,
  UI_RPC_METHOD_PASSWORD_UPDATE,
  UI_RPC_METHOD_PREVIEW_PUBKEYS,
  UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE,
  // UI_RPC_METHOD_ETHEREUM_SIGN_MESSAGE,
  // UI_RPC_METHOD_ETHEREUM_SIGN_TRANSACTION,
  // UI_RPC_METHOD_ETHEREUM_SIGN_AND_SEND_TRANSACTION,
  // UI_RPC_METHOD_SOLANA_SIGN_MESSAGE,
  // UI_RPC_METHOD_SOLANA_SIGN_TRANSACTION,
  // UI_RPC_METHOD_SOLANA_SIGN_AND_SEND_TRANSACTION,
  // UI_RPC_METHOD_SOLANA_SIGN_ALL_TRANSACTIONS,
} from "@coral-xyz/common";
import {
  backgroundClient as background,
  useBackgroundClient,
} from "@coral-xyz/recoil";
import { useEffect, useState } from "react";

import type { SelectedAccount } from "../../../../common/Account/ImportAccounts";

export const useRequest = (method: string, ...params: any) => {
  const background = useBackgroundClient();
  const [state, setState] = useState();
  useEffect(() => {
    background
      .request({
        method,
        params,
      })
      .then((result) => {
        setState(result);
      });
  }, []);
  return state;
};

async function makeRequest(background, request) {
  try {
    console.groupCollapsed(`makeRequest:${request.method}`);
    const res = await background.request(request);
    console.log(`%csuccess`, `color: green`);
    console.log("typeof res", typeof res);
    console.log(JSON.stringify(res));
    return res;
  } catch (error) {
    console.log(`%cfailure`, `color: red`);
    console.error(error);
    return { error: error.message };
  } finally {
    console.groupEnd();
  }
}

// TODO
export async function req_UI_RPC_METHOD_KEYRING_STORE_CREATE(
  background,
  {
    blockchain,
    mnemonic,
    derivationPath,
    password,
    accounts,
    username,
    inviteCode,
    usernameAndPubkey,
    waitlistId,
  }
) {
  return makeRequest(background, {
    method: UI_RPC_METHOD_KEYRING_STORE_CREATE,
    params: [
      blockchain, // params.blockchain
      mnemonic, // params.mnemonic
      derivationPath,
      password, // decodeURIComponent(params.password!)
      accounts,
      username, // _username
      inviteCode, // params.inviteCode
      waitlistId, // getWaitlistId?.(),
      usernameAndPubkey, // Boolean(params.usernameAndPubkey)
    ],
  });
}

// TODO these types are any in hooks/useTransactionData
export async function req_UI_RPC_METHOD_SOLANA_SIMULATE(
  background,
  {
    serializedTx,
    walletPublicKey,
  }: {
    serializedTx: any;
    walletPublicKey: any;
  }
) {
  // TODO const { connection, walletPublicKey } = useSolanaCtx(); hooks/useTransactionData

  return makeRequest(background, {
    method: UI_RPC_METHOD_SOLANA_SIMULATE,
    params: [serializedTx, walletPublicKey, true],
  });

  // TODO if (result.value.err) hooks/useTransactionData
}

export async function req_UI_RPC_METHOD_KEYRING_VALIDATE_MNEMONIC(
  background,
  {
    mnemonic,
  }: {
    mnemonic: string;
  }
) {
  return makeRequest(background, {
    method: UI_RPC_METHOD_KEYRING_VALIDATE_MNEMONIC,
    params: [mnemonic],
  });
}

export async function req_UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE(
  background,
  {
    mnemonicWords,
  }: {
    mnemonicWords: string[];
  }
) {
  return makeRequest(background, {
    method: UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE,
    params: [mnemonicWords.length === 12 ? 128 : 256],
  });
}

export async function req_UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS(
  background
) {
  return makeRequest(background, {
    method: UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
    params: [],
  });
}

// TODO response: Promise<PublicKey[]> (i think)
export async function req_UI_RPC_METHOD_PREVIEW_PUBKEYS(
  background,
  {
    mnemonic,
    derivationPath,
    blockchain,
  }: {
    blockchain: Blockchain;
    mnemonic: string;
    derivationPath: DerivationPath;
  }
) {
  const LOAD_PUBKEY_AMOUNT = 20;

  return makeRequest(background, {
    method: UI_RPC_METHOD_PREVIEW_PUBKEYS,
    params: [blockchain, mnemonic, derivationPath, LOAD_PUBKEY_AMOUNT],
  });
}

// used inside settings -> show secret recovery phrase
export async function req_UI_RPC_METHOD_KEYRING_EXPORT_MNEMONIC(
  background,
  { password }: { password: string }
) {
  return makeRequest(background, {
    method: UI_RPC_METHOD_KEYRING_EXPORT_MNEMONIC,
    params: [password],
  });
}

export async function req_UI_RPC_METHOD_KEYRING_DERIVE_WALLET(
  background,
  {
    blockchain,
  }: {
    blockchain: Blockchain;
  }
) {
  return makeRequest(background, {
    method: UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
    params: [blockchain],
  });
}

export async function req_UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE(
  background,
  {
    publicKey,
    blockchain,
  }: {
    publicKey: any;
    blockchain: Blockchain;
  }
) {
  return makeRequest(background, {
    method: UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
    params: [publicKey, blockchain],
  });
}

// TODO wtf
export async function req_UI_RPC_METHOD_LEDGER_IMPORT(
  background,
  {
    blockchain,
    derivationPath,
    account,
  }: {
    blockchain: Blockchain;
    derivationPath: DerivationPath;
    account: SelectedAccount;
  }
) {
  return makeRequest(background, {
    method: UI_RPC_METHOD_LEDGER_IMPORT,
    params: [
      blockchain,
      derivationPath,
      account.index,
      account.publicKey.toString(),
    ],
  });
}

export async function req_UI_RPC_METHOD_KEYRING_STORE_CHECK_PASSWORD(
  background,
  { password }: { password: string }
) {
  return makeRequest(background, {
    method: UI_RPC_METHOD_KEYRING_STORE_CHECK_PASSWORD,
    params: [password],
  });
}

export async function req_UI_RPC_METHOD_PASSWORD_UPDATE(
  background,
  {
    currentPassword,
    newPassword,
  }: { currentPassword: string; newPassword: string }
) {
  return makeRequest(background, {
    method: UI_RPC_METHOD_PASSWORD_UPDATE,
    params: [currentPassword, newPassword],
  });
}

// TODO secretKeyHex = validateSecretKey(blockchain, secretKey, existingPublicKeys)
// TODO response Promise<PublicKey> maybe?
export async function req_UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY(
  background,
  {
    blockchain,
    secretKeyHex,
    name,
  }: { blockchain: Blockchain; secretKeyHex: string; name: string }
) {
  return makeRequest(background, {
    method: UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
    params: [blockchain, secretKeyHex, name],
  });
}

export async function req_UI_RPC_METHOD_KEYRING_RESET(
  background
): Promise<string> {
  return makeRequest(background, {
    method: UI_RPC_METHOD_KEYRING_RESET,
    params: [],
  });
}

export async function req_UI_RPC_METHOD_KEYRING_STORE_LOCK(
  background
): Promise<string> {
  return makeRequest(background, {
    method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
    params: [],
  });
}

export async function req_UI_RPC_METHOD_KEYRING_STORE_UNLOCK(
  background,
  { password }: { password: string }
) {
  return makeRequest(background, {
    method: UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
    params: [password],
  });
}

export async function req_UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE(
  background,
  { isDarkMode }: { isDarkMode: boolean }
) {
  return makeRequest(background, {
    method: UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE,
    params: [isDarkMode],
  });
}

export async function req_UI_RPC_METHOD_BLOCKCHAINS_ENABLED_DELETE(
  background,
  { blockchain }: { blockchain: Blockchain }
) {
  return makeRequest(background, {
    method: UI_RPC_METHOD_BLOCKCHAINS_ENABLED_DELETE,
    params: [blockchain],
  });
}

export async function req_UI_RPC_METHOD_BLOCKCHAINS_ENABLED_ADD(
  background,
  { blockchain }: { blockchain: Blockchain }
) {
  return makeRequest(background, {
    method: UI_RPC_METHOD_BLOCKCHAINS_ENABLED_ADD,
    params: [blockchain],
  });
}

// TBD since we need to pass a connectionUrl
export async function req_UI_RPC_METHOD_CONNECTION_URL_UPDATE(
  background,
  { url }: { url: string }
) {
  return makeRequest(background, {
    method: UI_RPC_METHOD_CONNECTION_URL_UPDATE,
    params: [
      url.includes("devnet")
        ? "https://api.mainnet-beta.solana.com"
        : "https://api.devnet.solana.com",
    ],
  });
}

// PROBABLY NOT NECESSARY SECTION
export async function req_UI_RPC_METHOD_NAVIGATION_TO_ROOT() {
  return background.request({
    method: UI_RPC_METHOD_NAVIGATION_TO_ROOT,
    params: [],
  });
}

export async function req_UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE() {
  return background.request({
    method: UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
    params: [tabValue],
  });
}
