import { useEffect, useState } from "react";
import { Box, List, ListItemButton, ListItemText } from "@mui/material";
import Transport from "@ledgerhq/hw-transport";
import * as ledgerCore from "@coral-xyz/ledger-core";
import {
  Checkbox,
  Header,
  Loading,
  ListItem,
  PrimaryButton,
  SubtextParagraph,
  walletAddressDisplay,
} from "../common";
import { WithMiniDrawer } from "../Layout/Drawer";
import { Connection, PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { useBackgroundClient, useAnchorContext } from "@coral-xyz/recoil";
import {
  DerivationPath,
  UI_RPC_METHOD_PREVIEW_PUBKEYS,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
} from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";

type Account = {
  publicKey: anchor.web3.PublicKey;
  account?: anchor.web3.AccountInfo<Buffer>;
};

export type SelectedAccount = {
  index: number;
  publicKey: anchor.web3.PublicKey;
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
    selectedAccounts: SelectedAccount[],
    derivationPath: DerivationPath,
    mnemonic?: string
  ) => void;
  onError?: (error: Error) => void;
}) {
  const background = useBackgroundClient();
  const theme = useCustomTheme();
  const [accounts, setAccounts] = useState<Array<Account>>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<SelectedAccount[]>(
    []
  );
  const [importedPubkeys, setImportedPubkeys] = useState<string[]>([]);
  const [derivationPath, setDerivationPath] = useState<DerivationPath>(
    DerivationPath.Bip44
  );
  const [derivationSelectorOpen, setDerivationSelectorOpen] = useState(false);

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
    (async () => {
      if (connection) {
        try {
          const accounts = await background.request({
            method: UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
            params: [],
          });
          setImportedPubkeys(
            Object.values(accounts)
              .flat()
              .map((a: any) => a.publicKey)
          );
        } catch {
          // Keyring store locked, either onboarding or left open
        }
      }
    })();
  }, [connection]);

  //
  // Load a list of accounts and their associated balances
  //
  useEffect(() => {
    if (!derivationPath) return;

    let loaderFn;
    if (mnemonic) {
      // Loading accounts from a mnemonic
      loaderFn = (derivationPath: DerivationPath) =>
        loadMnemonicPublicKeys(mnemonic, derivationPath);
    } else if (transport) {
      // Loading accounts from a Ledger
      loaderFn = (derivationPath: DerivationPath) =>
        loadLedgerPublicKeys(transport, derivationPath);
    } else {
      return;
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
        console.error(error);
        if (onError) {
          // Call custom error handler if one was passed
          onError(error);
        } else {
          throw error;
        }
      });
  }, [mnemonic, transport, derivationPath]);

  //
  // Clear accounts and selected acounts on change of derivation path.
  //
  useEffect(() => {
    setAccounts([]);
    setSelectedAccounts([]);
  }, [derivationPath]);

  //
  // Load accounts for the given mnemonic. This is passed to the ImportAccounts
  // component and called whenever the derivation path is changed with the selector.
  //
  const loadMnemonicPublicKeys = async (
    mnemonic: string,
    derivationPath: DerivationPath
  ) => {
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
        await ledgerCore.getPublicKey(transport, k, derivationPath)
      );
    }
    return publicKeys;
  };

  //
  // Handles checkbox clicks to select accounts to import.
  //
  const handleSelect = (index: number, publicKey: PublicKey) => () => {
    const currentIndex = selectedAccounts.findIndex((a) => a.index === index);
    const newSelectedAccounts = [...selectedAccounts];
    if (currentIndex === -1) {
      // Adding the account
      newSelectedAccounts.push({ index, publicKey });
    } else {
      // Removing the account
      newSelectedAccounts.splice(currentIndex, 1);
    }
    // Sort by account indices
    newSelectedAccounts.sort((a, b) => a.index - b.index);
    setSelectedAccounts(newSelectedAccounts);
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
          <Header text="Import accounts" />
          <SubtextParagraph>
            Select which accounts you'd like to import.
          </SubtextParagraph>
        </Box>
        {accounts.length > 0 && (
          <>
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
                  onClick={handleSelect(index, publicKey)}
                  sx={{
                    display: "flex",
                    paddinLeft: "16px",
                    paddingRight: "16px",
                    paddingTop: "5px",
                    paddingBottom: "5px",
                  }}
                  disabled={importedPubkeys.includes(publicKey.toString())}
                >
                  <Box style={{ display: "flex", width: "100%" }}>
                    <Checkbox
                      edge="start"
                      checked={
                        selectedAccounts.some((a) => a.index === index) ||
                        importedPubkeys.includes(publicKey.toString())
                      }
                      tabIndex={-1}
                      disabled={importedPubkeys.includes(publicKey.toString())}
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
                      primary={`${
                        account ? account.lamports / 10 ** 9 : 0
                      } SOL`}
                    />
                  </Box>
                </ListItemButton>
              ))}
            </List>
            {/**
            <Box
              sx={{
                textAlign: "center",
                margin: "32px 0",
              }}
            >
              <Link
                sx={{
                  cursor: "pointer",
                  color: theme.custom.colors.secondary,
                  textDecoration: "none",
                }}
                onClick={() => setDerivationSelectorOpen(true)}
              >
                Set derivation path
              </Link>
            </Box>
            <DerivationSelection
              open={derivationSelectorOpen}
              setOpen={setDerivationSelectorOpen}
              derivationPath={derivationPath}
              setDerivationPath={setDerivationPath}
            />
            **/}
          </>
        )}
      </Box>
      {accounts.length === 0 && <Loading />}
      <Box
        sx={{
          mt: "12px",
          ml: "16px",
          mr: "16px",
          mb: "16px",
        }}
      >
        <PrimaryButton
          label="Import accounts"
          onClick={() => onNext(selectedAccounts, derivationPath, mnemonic)}
          disabled={selectedAccounts.length === 0}
        />
      </Box>
    </Box>
  );
}

function DerivationSelection({
  open,
  setOpen,
  derivationPath,
  setDerivationPath,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  derivationPath: DerivationPath;
  setDerivationPath: (derivationPath: DerivationPath) => void;
}) {
  const theme = useCustomTheme();

  const options = [
    {
      path: DerivationPath.Bip44,
      label: "44'/501'/",
    },
    {
      path: DerivationPath.Bip44Change,
      label: "44'/501'/0'/",
    },
  ];

  return (
    <>
      <WithMiniDrawer title="" openDrawer={open} setOpenDrawer={setOpen}>
        <Box sx={{ color: theme.custom.colors.fontColor }}>
          <List
            style={{
              background: theme.custom.colors.bg2,
              marginLeft: "16px",
              marginRight: "16px",
            }}
          >
            {options.map((o, idx) => (
              <ListItem
                onClick={() => {
                  setDerivationPath(o.path);
                  setOpen(false);
                }}
                key={o.label}
                style={{
                  height: "44px",
                  display: "flex",
                  borderBottom:
                    idx !== options.length - 1
                      ? `solid 1pt ${theme.custom.colors.border1}`
                      : undefined,
                }}
              >
                <ListItemText
                  sx={{
                    marginLeft: "8px",
                    fontSize: "16px",
                    lineHeight: "24px",
                    fontWeight: 500,
                  }}
                  primary={o.label}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </WithMiniDrawer>
    </>
  );
}
