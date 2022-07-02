import { useEffect, useState } from "react";
import { Box, List, ListItemButton, ListItemText } from "@mui/material";
import Transport from "@ledgerhq/hw-transport";
import * as ledgerCore from "@coral-xyz/ledger-core";
import {
  Checkbox,
  Header,
  Loading,
  PrimaryButton,
  SubtextParagraph,
  walletAddressDisplay,
} from "../common";
import { Connection, PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { useAnchorContext } from "@coral-xyz/recoil";
import {
  getBackgroundClient,
  DerivationPath,
  UI_RPC_METHOD_PREVIEW_PUBKEYS,
} from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";

type Account = {
  publicKey: anchor.web3.PublicKey;
  account?: anchor.web3.AccountInfo<Buffer>;
};

const LOAD_PUBKEY_AMOUNT = 8;

export function ImportAccounts({
  mnemonic,
  transport,
  onNext,
  onError,
}: {
  mnemonic?: string;
  transport?: Transport | null;
  onNext: (
    accountIndices: number[],
    derivationPath: DerivationPath,
    mnemonic?: string
  ) => void;
  onError?: (error: Error) => void;
}) {
  const theme = useCustomTheme();
  const [accounts, setAccounts] = useState<Array<Account>>([]);
  const [accountIndices, setAccountIndices] = useState<number[]>([]);
  const [derivationPath, setDerivationPath] = useState<DerivationPath>(
    DerivationPath.Bip44Change
  );

  // Handle the case where the keyring store is locked, i.e. this is a reset
  // without an unlock or this is during onboarding.
  let connection: Connection;
  try {
    ({ connection } = useAnchorContext());
  } catch {
    // Default to mainnet if the keyring store is locked
    // TODO share this constant with components/Settings/ConnectionSwitch.tsx
    const mainnetRpc =
      process.env.DEFAULT_SOLANA_CONNECTION_URL ||
      "https://solana-api.projectserum.com";
    connection = new Connection(mainnetRpc, "confirmed");
  }

  useEffect(() => {
    if ((!mnemonic && !transport) || !derivationPath) return;

    let loaderFn;
    if (mnemonic) {
      loaderFn = (derivationPath: DerivationPath) =>
        loadMnemonicPublicKeys(mnemonic, derivationPath);
    } else {
      loaderFn = (derivationPath: DerivationPath) =>
        loadLedgerPublicKeys(transport!, derivationPath);
    }

    loaderFn(derivationPath)
      .then(async (publicKeys: PublicKey[]) => {
        const accounts = (
          await anchor.utils.rpc.getMultipleAccounts(connection, publicKeys)
        ).map((result, index) => {
          return result === null ? { publicKey: publicKeys[index] } : result;
        });
        setAccounts(accounts);
      })
      .catch((error) => {
        // Probably Ledger error, i.e. app is not opened
        if (onError) {
          // Call custom error handler if one was passed
          onError(error);
        } else {
          throw error;
        }
      });
  }, [mnemonic, transport, derivationPath]);

  //
  // Load accounts for the given mnemonic. This is passed to the ImportAccounts
  // component and called whenever the derivation path is changed with the selector.
  //
  const loadMnemonicPublicKeys = async (
    mnemonic: string,
    derivationPath: DerivationPath
  ) => {
    const background = getBackgroundClient();
    const publicKeys = await background.request({
      method: UI_RPC_METHOD_PREVIEW_PUBKEYS,
      params: [mnemonic, derivationPath, LOAD_PUBKEY_AMOUNT],
    });
    return publicKeys.map((p: string) => new PublicKey(p));
  };

  //
  // Load accounts for a ledger.
  //
  //
  const loadLedgerPublicKeys = async (
    transport: Transport,
    derivationPath: DerivationPath
  ) => {
    const publicKeys = [];
    for (let k = 0; k < LOAD_PUBKEY_AMOUNT; k += 1) {
      publicKeys.push(
        await ledgerCore.getPublicKey(transport!, k, derivationPath)
      );
    }
    return publicKeys;
  };

  //
  // Handles checkbox clicks to select accounts to import.
  //
  const handleSelect = (index: number) => () => {
    const currentIndex = accountIndices.indexOf(index);
    const newAccountIndices = [...accountIndices];
    if (currentIndex === -1) {
      newAccountIndices.push(index);
    } else {
      newAccountIndices.splice(currentIndex, 1);
    }
    newAccountIndices.sort();
    setAccountIndices(newAccountIndices);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Box
          sx={{
            marginLeft: "24px",
            marginRight: "24px",
            marginTop: "24px",
          }}
        >
          <Header text="Import Accounts" />
          <SubtextParagraph style={{ marginTop: "8px" }}>
            Select which accounts you'd like to import.
          </SubtextParagraph>
        </Box>
        {accounts.length === 0 ? (
          <Loading />
        ) : (
          <List
            sx={{
              color: theme.custom.colors.fontColor,
              background: theme.custom.colors.background,
              borderRadius: "12px",
              marginLeft: "16px",
              marginRight: "16px",
              paddingTop: "8px",
              paddingBottom: "8px",
            }}
          >
            {accounts.map(({ publicKey, account }, index) => (
              <ListItemButton
                key={publicKey.toString()}
                onClick={handleSelect(index)}
                sx={{
                  display: "flex",
                  paddinLeft: "16px",
                  paddingRight: "16px",
                  paddingTop: "5px",
                  paddingBottom: "5px",
                }}
              >
                <Box style={{ display: "flex", width: "100%" }}>
                  <Checkbox
                    edge="start"
                    checked={accountIndices.indexOf(index) !== -1}
                    tabIndex={-1}
                    disableRipple
                    style={{ marginLeft: 0 }}
                  />
                  <ListItemText
                    id={publicKey.toString()}
                    primary={walletAddressDisplay(publicKey)}
                    sx={{
                      marginLeft: "8px",
                      fontSize: "14px",
                      lineHeight: "32px",
                      fontWeight: 500,
                    }}
                  />
                  <ListItemText
                    sx={{
                      color: theme.custom.colors.secondary,
                      textAlign: "right",
                    }}
                    primary={`${account ? account.lamports / 10 ** 9 : 0} SOL`}
                  />
                </Box>
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>
      <Box
        sx={{
          mt: "12px",
          ml: "16px",
          mr: "16px",
          mb: "16px",
        }}
      >
        <PrimaryButton
          label="Import Accounts"
          onClick={() => onNext(accountIndices, derivationPath, mnemonic)}
          disabled={accountIndices.length === 0}
        />
      </Box>
    </Box>
  );
}
