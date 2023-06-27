import { useEffect, useState } from "react";
import type {   Blockchain,WalletDescriptor } from "@coral-xyz/common";
import {
  LOAD_PUBLIC_KEY_AMOUNT,
  UI_RPC_METHOD_FIND_SERVER_PUBLIC_KEY_CONFLICTS,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
  UI_RPC_METHOD_PREVIEW_PUBKEYS,
} from "@coral-xyz/common";
import { Loading, PrimaryButton, TextInput } from "@coral-xyz/react-common";
import { useBackgroundClient, useDehydratedWallets } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import type Transport from "@ledgerhq/hw-transport";
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
} from "@mui/material";
import type { BigNumber} from "ethers";
import { ethers } from "ethers";

import {
  Checkbox,
  formatWalletAddress,
  Header,
  SubtextParagraph,
} from "../../common";
import { BLOCKCHAIN_COMPONENTS } from "../../common/Blockchains";
import { Scrollbar } from "../Layout/Scrollbar";

export function ImportWallets({
  blockchain,
  mnemonic,
  transport,
  onNext,
  onError,
  recovery,
  allowMultiple = true,
}: {
  blockchain: Blockchain;
  mnemonic?: string | true;
  transport?: Transport;
  onNext: (walletDescriptor: Array<WalletDescriptor>) => void;
  onError?: (error: Error) => void;
  recovery?: string;
  allowMultiple?: boolean;
}) {
  const background = useBackgroundClient();
  const theme = useCustomTheme();

  const dehydrated = useDehydratedWallets();
  const dehydratedPubkeys = dehydrated
    .filter((d) => d.blockchain === blockchain)
    .map((d) => d.publicKey);

  // Loaded balances for each public key
  const [balances, setBalances] = useState<{ [publicKey: string]: BigNumber }>(
    {}
  );
  // Path to the public key
  const [walletDescriptors, setWalletDescriptors] = useState<
    Array<WalletDescriptor>
  >([]);
  const [checkedWalletDescriptors, setCheckedWalletDescriptors] = useState<
    Array<WalletDescriptor>
  >([]);
  // Lock flag to prevent changing of derivation path while ledger is loading
  const [ledgerLocked, setLedgerLocked] = useState(false);
  // Public keys that have already been imported on this account
  const [importedPublicKeys, setImportedPublicKeys] = useState<string[]>([]);
  // Public keys that are in use on other Backpack accounts
  const [conflictingPublicKeys, setConflictingPublicKeys] = useState<string[]>(
    []
  );

  const derivationPathOptions =
    BLOCKCHAIN_COMPONENTS[blockchain].DerivationPathOptions;
  const [derivationPathLabel, setDerivationPathLabel] = useState<string>(
    derivationPathOptions[0].label
  );
  const [derivationPaths, setDerivationPaths] = useState<Array<string>>([]);

  const disabledPublicKeys = [...importedPublicKeys, ...conflictingPublicKeys];

  useEffect(() => {
    (async () => {
      try {
        const blockchainKeyrings = await background.request({
          method: UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
          params: [],
        });
        const keyring = blockchainKeyrings[blockchain];
        setImportedPublicKeys(
          Object.values(keyring)
            .flat()
            .map((a: any) => a.publicKey)
        );
      } catch (error) {
        // Keyring store locked, either onboarding or left open
      }
    })();
  }, [background, blockchain]);

  //
  // Query the server for a list of public keys that are already in use
  //
  useEffect(() => {
    (async () => {
      if (walletDescriptors.length === 0) return;
      try {
        const response = await background.request({
          method: UI_RPC_METHOD_FIND_SERVER_PUBLIC_KEY_CONFLICTS,
          params: [
            walletDescriptors.map((w) => ({
              publicKey: w.publicKey,
              blockchain,
            })),
          ],
        });
        setConflictingPublicKeys(
          response.map(
            (r: { user_id: string; public_key: string; blockchain: string }) =>
              r.public_key
          )
        );
      } catch {
        // If the query failed assume all are valid
      }
    })();
  }, [background, blockchain, walletDescriptors]);

  //
  // Load a list of accounts and their associated balances
  //
  useEffect(() => {
    if (!derivationPaths) return;

    setCheckedWalletDescriptors([]);

    let loaderFn;
    // `mnemonic` can be true here if we aren't passing the mnemonic then it
    // can be taken from the unlocked keyring on the backend
    if (mnemonic) {
      // Loading accounts from a mnemonic
      loaderFn = (derivationPaths: Array<string>) =>
        loadMnemonicPublicKeys(mnemonic, derivationPaths);
    } else if (transport) {
      // Loading accounts from a Ledger
      loaderFn = (derivationPaths: Array<string>) =>
        loadLedgerPublicKeys(transport, derivationPaths);
    } else {
      throw new Error("no public key loader found");
    }

    loaderFn(derivationPaths)
      .then(async (publicKeys: string[]) => {
        setWalletDescriptors(
          derivationPaths.map((derivationPath, i) => ({
            blockchain,
            publicKey: publicKeys[i],
            derivationPath,
          }))
        );
        const balances = await loadBalances(publicKeys);
        setBalances(
          Object.fromEntries(
            balances
              .sort((a, b) =>
                b.balance.lt(a.balance) ? -1 : b.balance.eq(a.balance) ? 0 : 1
              )
              .map((a) => [a.publicKey, a.balance])
          )
        );
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
  }, [mnemonic, transport, derivationPaths]);

  //
  // Clear accounts and selected acounts on change of derivation path.
  //
  useEffect(() => {
    setBalances({});
    setWalletDescriptors([]);
    if (derivationPathLabel !== null) {
      const derivationPath = derivationPathOptions.find(
        (d) => d.label === derivationPathLabel
      );
      if (!derivationPath) throw new Error("Invalid derivation path label");
      setDerivationPaths(
        [...Array(LOAD_PUBLIC_KEY_AMOUNT).keys()].map((i) =>
          derivationPath.path(i)
        )
      );
    }
  }, [derivationPathLabel]);

  //
  // Load balances for accounts that have been loaded
  //
  const loadBalances = BLOCKCHAIN_COMPONENTS[blockchain].LoadBalances;

  //
  // Load accounts for the given mnemonic. This is passed to the ImportWallets
  // component and called whenever the derivation path is changed with the selector.
  //
  const loadMnemonicPublicKeys = async (
    mnemonic: string | true,
    derivationPaths: Array<string>
  ) => {
    return await background.request({
      method: UI_RPC_METHOD_PREVIEW_PUBKEYS,
      params: [blockchain, mnemonic, derivationPaths],
    });
  };

  //
  // Load accounts for a ledger.
  //
  const loadLedgerPublicKeys = async (
    transport: Transport,
    derivationPaths: Array<string>
  ): Promise<string[]> => {
    const publicKeys = [];
    setLedgerLocked(true);
    const ledger = BLOCKCHAIN_COMPONENTS[blockchain].LedgerApp(transport);
    // Add remaining accounts
    for (const derivationPath of derivationPaths) {
      publicKeys.push(
        await BLOCKCHAIN_COMPONENTS[blockchain].PublicKeyFromPath(
          ledger,
          derivationPath
        )
      );
    }
    setLedgerLocked(false);
    return publicKeys;
  };

  const isDisabledPublicKey = (pk: string): boolean => {
    if (recovery === undefined) {
      return disabledPublicKeys.includes(pk);
    }
    return pk !== recovery || !dehydratedPubkeys.includes(pk);
  };

  //
  // Handles checkbox clicks to select accounts to import.
  //
  const handleSelect = (publicKey: string, derivationPath: string) => () => {
    const currentIndex = checkedWalletDescriptors.findIndex(
      (a) => a.publicKey === publicKey
    );
    let newCheckedWalletDescriptors = [...checkedWalletDescriptors];
    if (currentIndex === -1) {
      // Not selected, add it
      const walletDescriptor = {
        blockchain,
        derivationPath,
        publicKey,
      };
      // Adding the account
      if (allowMultiple) {
        newCheckedWalletDescriptors.push(walletDescriptor);
      } else {
        newCheckedWalletDescriptors = [walletDescriptor];
      }
    } else {
      // Removing the account
      newCheckedWalletDescriptors.splice(currentIndex, 1);
    }
    // TODO Sort by account indices
    // newCheckedWalletDescriptors.sort((a, b) => a.index - b.index);
    setCheckedWalletDescriptors(newCheckedWalletDescriptors);
  };

  // Symbol for balance displays
  const symbol = BLOCKCHAIN_COMPONENTS[blockchain].GasTokenName;

  // Decimals for balance displays
  const decimals = BLOCKCHAIN_COMPONENTS[blockchain].GasTokenDecimals;

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
          <Header text={`Import wallet${allowMultiple ? "s" : ""}`} />
          <SubtextParagraph>
            Select which wallet{allowMultiple ? "s" : ""} you'd like to import.
          </SubtextParagraph>
        </Box>
        <div style={{ margin: "16px" }}>
          <TextInput
            placeholder="Derivation Path"
            value={derivationPathLabel}
            setValue={(e) => setDerivationPathLabel(e.target.value)}
            select
            disabled={ledgerLocked}
          >
            {derivationPathOptions.map((o) => (
              <MenuItem value={o.label} key={o.label}>
                {o.label}
              </MenuItem>
            ))}
          </TextInput>
        </div>
        {Object.keys(balances).length > 0 ? (
          <List
            sx={{
              color: theme.custom.colors.fontColor,
              background: theme.custom.colors.background,
              borderRadius: "12px",
              marginLeft: "16px",
              marginRight: "16px",
              paddingTop: "8px",
              paddingBottom: "8px",
              height: "225px",
            }}
          >
            <Scrollbar>
              {[...walletDescriptors]
                .sort((a, b) => {
                  // Sort so that any public keys with balances are displayed first
                  if (balances[a.publicKey] < balances[b.publicKey]) {
                    return 1;
                  } else if (balances[a.publicKey] > balances[b.publicKey]) {
                    return -1;
                  } else {
                    return 0;
                  }
                })
                .map(({ publicKey, derivationPath }) => (
                  <ListItemButton
                    disableRipple
                    key={publicKey.toString()}
                    onClick={handleSelect(publicKey, derivationPath)}
                    sx={{
                      display: "flex",
                      paddinLeft: "16px",
                      paddingRight: "16px",
                      paddingTop: "5px",
                      paddingBottom: "5px",
                    }}
                    disabled={isDisabledPublicKey(publicKey.toString())}
                  >
                    <Box style={{ display: "flex", width: "100%" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          flexDirection: "column",
                        }}
                      >
                        <Checkbox
                          edge="start"
                          checked={
                            checkedWalletDescriptors.some(
                              (a) => a.derivationPath === derivationPath
                            ) ||
                            importedPublicKeys.includes(publicKey.toString())
                          }
                          tabIndex={-1}
                          disabled={isDisabledPublicKey(publicKey.toString())}
                          disableRipple
                          style={{ marginLeft: 0 }}
                        />
                      </div>
                      <ListItemText
                        id={publicKey.toString()}
                        primary={formatWalletAddress(publicKey)}
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
                          balances[publicKey]
                            ? (+ethers.utils.formatUnits(
                                balances[publicKey],
                                decimals
                              )).toFixed(4)
                            : "-"
                        } ${symbol}`}
                      />
                    </Box>
                  </ListItemButton>
                ))}
            </Scrollbar>
          </List>
        ) : (
          <Loading />
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
          label={`Import Wallet${allowMultiple ? "s" : ""}`}
          onClick={() => onNext(checkedWalletDescriptors)}
          disabled={checkedWalletDescriptors.length === 0}
        />
      </Box>
    </Box>
  );
}
