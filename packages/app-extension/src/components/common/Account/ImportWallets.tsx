import { useEffect, useMemo, useState } from "react";
import type { UR, WalletDescriptor } from "@coral-xyz/common";
import {
  Blockchain,
  DEFAULT_SOLANA_CLUSTER,
  EthereumConnectionUrl,
  ethereumIndexed,
  legacyBip44ChangeIndexed,
  legacyBip44Indexed,
  legacyLedgerIndexed,
  legacyLedgerLiveIndexed,
  legacySolletIndexed,
  LOAD_PUBLIC_KEY_AMOUNT,
  UI_RPC_METHOD_FIND_SERVER_PUBLIC_KEY_CONFLICTS,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
  UI_RPC_METHOD_KEYSTONE_UR_DECODE,
  UI_RPC_METHOD_PREVIEW_PUBKEYS,
} from "@coral-xyz/common";
import { Loading, PrimaryButton, TextInput } from "@coral-xyz/react-common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import Ethereum from "@ledgerhq/hw-app-eth";
import Solana from "@ledgerhq/hw-app-solana";
import type Transport from "@ledgerhq/hw-transport";
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
} from "@mui/material";
import * as anchor from "@project-serum/anchor";
import { Connection as SolanaConnection, PublicKey } from "@solana/web3.js";
import { BigNumber, ethers } from "ethers";

import {
  Checkbox,
  Header,
  SubtextParagraph,
  walletAddressDisplay,
} from "../../common";

const { base58: bs58 } = ethers.utils;

const DISPLAY_PUBKEY_AMOUNT = 5;

export function ImportWallets({
  blockchain,
  mnemonic,
  transport,
  onNext,
  onError,
  allowMultiple = true,
  ur,
  action,
  publicKey,
}: {
  blockchain: Blockchain;
  mnemonic?: string | true;
  transport?: Transport;
  onNext: (walletDescriptor: Array<WalletDescriptor>) => void;
  onError?: (error: Error) => void;
  allowMultiple?: boolean;
  ur?: UR;
  action?: "create" | "derive" | "search" | "import";
  publicKey?: string;
}) {
  const background = useBackgroundClient();
  const theme = useCustomTheme();

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

  const derivationPathOptions = {
    [Blockchain.SOLANA]: [
      {
        path: (i: number) => legacyBip44Indexed(Blockchain.SOLANA, i),
        label: "m/44/501'/ ",
      },
      {
        path: (i: number) => legacyBip44ChangeIndexed(Blockchain.SOLANA, i),
        label: "m/44/501'/0'",
      },
      {
        path: (i: number) =>
          legacyBip44ChangeIndexed(Blockchain.SOLANA, i) + "/0'",
        label: "m/44/501'/0'/0'",
      },
      /**
      {
        path: (i: number) => getIndexedPath(Blockchain.SOLANA, i),
        label: "Backpack",
      },
      **/
    ]
      // Note: We only allow importing the deprecated sollet derivation path for
      //       hot wallets. This UI is hidden behind a local storage flag we
      //       expect people to manually set, since this derivation path was only
      //       used by mostly technical early Solana users.
      .concat(
        mnemonic && window.localStorage.getItem("sollet")
          ? [
              {
                path: (i: number) => legacySolletIndexed(i),
                label: "501'/0'/0/0 (Deprecated)",
              },
            ]
          : []
      ),
    [Blockchain.ETHEREUM]: [
      /**
      // Used in older versions of Backpack
      {
        path: (i: number) => legacyBip44Indexed(Blockchain.ETHEREUM, i),
        label: "m/44/60'/",
      },
      **/
      {
        path: (i: number) => legacyLedgerLiveIndexed(i),
        label: "m/44/60' - Ledger Live",
      },
      /**
      // Used in older versions of Backpack
      {
        path: (i: number) => legacyBip44ChangeIndexed(Blockchain.ETHEREUM, i),
        label: "m/44/60'/0'",
      },
      **/
      {
        path: (i: number) => legacyLedgerIndexed(i),
        label: "m/44/60'/0' - Ledger",
      },
      {
        path: (i: number) => ethereumIndexed(i),
        label: "m/44/60'/0'/0 - Ethereum Standard",
      },
      {
        path: (i: number) =>
          legacyBip44ChangeIndexed(Blockchain.ETHEREUM, i) + "/0'",
        label: "m/44/60'/0'/0'",
      },
    ],
  }[blockchain];

  const [derivationPathLabel, setDerivationPathLabel] = useState<string>(
    derivationPathOptions[0].label
  );
  const [derivationPaths, setDerivationPaths] = useState<Array<string>>([]);

  const disabledPublicKeys = useMemo(() => {
    const loadedKeys = [...importedPublicKeys, ...conflictingPublicKeys];
    if (action === "search") {
      return [];
    }
    return loadedKeys;
  }, [importedPublicKeys, conflictingPublicKeys, balances, action]);

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
  }, [walletDescriptors]);

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
    } else if (ur) {
      loaderFn = () => loadKeystonePublicKeys(ur);
    } else {
      throw new Error("no public key loader found");
    }

    loaderFn(derivationPaths)
      .then(async (publicKeys: WalletDescriptor[]) => {
        setWalletDescriptors(publicKeys);
        const balances = await loadBalances(publicKeys.map((e) => e.publicKey));
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
  const loadBalances = async (publicKeys: string[]) => {
    if (blockchain === Blockchain.SOLANA) {
      // TODO use Backpack configured value
      const solanaMainnetRpc =
        process.env.DEFAULT_SOLANA_CONNECTION_URL || DEFAULT_SOLANA_CLUSTER;
      const solanaConnection = new SolanaConnection(
        solanaMainnetRpc,
        "confirmed"
      );
      const accounts = (
        await anchor.utils.rpc.getMultipleAccounts(
          solanaConnection,
          publicKeys.map((p) => new PublicKey(p))
        )
      ).map((result, index) => {
        return {
          publicKey: publicKeys[index],
          balance: result
            ? BigNumber.from(result.account.lamports)
            : BigNumber.from(0),
          index,
        };
      });
      return accounts;
    } else if (blockchain === Blockchain.ETHEREUM) {
      // TODO use Backpack configured value
      const ethereumMainnetRpc =
        process.env.DEFAULT_ETHEREUM_CONNECTION_URL ||
        EthereumConnectionUrl.MAINNET;
      const ethereumProvider = new ethers.providers.JsonRpcProvider(
        ethereumMainnetRpc
      );
      const balances = await Promise.all(
        publicKeys.map((p) => ethereumProvider.getBalance(p))
      );
      return publicKeys.map((p, index) => {
        return { publicKey: p, balance: balances[index], index };
      });
    } else {
      throw new Error("invalid blockchain");
    }
  };

  //
  // Load accounts for the given mnemonic. This is passed to the ImportWallets
  // component and called whenever the derivation path is changed with the selector.
  //
  const loadMnemonicPublicKeys = async (
    mnemonic: string | true,
    derivationPaths: Array<string>
  ) => {
    const publicKeys = await background.request({
      method: UI_RPC_METHOD_PREVIEW_PUBKEYS,
      params: [blockchain, mnemonic, derivationPaths],
    });
    return derivationPaths.map((derivationPath, i) => ({
      publicKey: publicKeys[i],
      derivationPath,
    }));
  };

  //
  // Load accounts for a ledger.
  //
  const loadLedgerPublicKeys = async (
    transport: Transport,
    derivationPaths: Array<string>
  ): Promise<WalletDescriptor[]> => {
    const publicKeys: (Buffer | string)[] = [];
    setLedgerLocked(true);
    const ledger = {
      [Blockchain.SOLANA]: new Solana(transport),
      [Blockchain.ETHEREUM]: new Ethereum(transport),
    }[blockchain];
    // Add remaining accounts
    for (const derivationPath of derivationPaths) {
      publicKeys.push(
        (await ledger.getAddress(derivationPath.replace("m/", ""))).address
      );
    }

    setLedgerLocked(false);
    return derivationPaths.map((derivationPath, i) => {
      const p = publicKeys[i];
      return {
        publicKey:
          blockchain === Blockchain.SOLANA ? bs58.encode(p) : p.toString(),
        derivationPath,
      };
    });
  };

  //
  // Load accounts for a Keystone.
  //
  const loadKeystonePublicKeys = async (ur: UR) => {
    const { accounts }: { accounts: WalletDescriptor[] } =
      await background.request({
        method: UI_RPC_METHOD_KEYSTONE_UR_DECODE,
        params: [blockchain, ur],
      });
    return accounts;
  };

  //
  // Handles checkbox clicks to select accounts to import.
  //
  const handleSelect =
    (publicKey: string, derivationPath: string, xfp?: string) => () => {
      const currentIndex = checkedWalletDescriptors.findIndex(
        (a) => a.publicKey === publicKey
      );
      let newCheckedWalletDescriptors = [...checkedWalletDescriptors];
      if (currentIndex === -1) {
        // Not selected, add it
        const walletDescriptor = {
          derivationPath,
          publicKey,
          xfp,
        } as WalletDescriptor;
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
  const symbol = {
    [Blockchain.SOLANA]: "SOL",
    [Blockchain.ETHEREUM]: "ETH",
  }[blockchain];

  // Decimals for balance displays
  const decimals = {
    [Blockchain.SOLANA]: 9,
    [Blockchain.ETHEREUM]: 18,
  }[blockchain];

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
          <Header
            text={`${action === "search" ? "Recover" : "Import"} wallet${
              allowMultiple ? "s" : ""
            }`}
          />
          <SubtextParagraph>
            Select which wallet{allowMultiple ? "s" : ""} you'd like to{" "}
            {action === "search" ? "recover" : "import"}.
          </SubtextParagraph>
        </Box>
        {!ur && (
          <div style={{ margin: "16px" }}>
            <TextInput
              placeholder="Derivation Path"
              value={derivationPathLabel}
              setValue={(e) => setDerivationPathLabel(e.target.value)}
              select={true}
              disabled={ledgerLocked}
            >
              {derivationPathOptions.map((o, index) => (
                <MenuItem value={o.label} key={index}>
                  {o.label}
                </MenuItem>
              ))}
            </TextInput>
          </div>
        )}
        {Object.keys(balances).length > 0 ? (
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
                maxHeight: "280px",
                overflow: "auto",
              }}
            >
              {walletDescriptors
                .slice(0, ur ? undefined : DISPLAY_PUBKEY_AMOUNT)
                .sort((a, b) => {
                  const aNum = disabledPublicKeys.includes(
                    a.publicKey.toString()
                  )
                    ? 1
                    : 0;
                  const bNum = disabledPublicKeys.includes(
                    b.publicKey.toString()
                  )
                    ? 1
                    : 0;
                  return aNum - bNum;
                })
                .map(({ publicKey, derivationPath, xfp }) => (
                  <ListItemButton
                    key={publicKey.toString()}
                    onClick={handleSelect(publicKey, derivationPath, xfp)}
                    sx={{
                      display: "flex",
                      paddinLeft: "16px",
                      paddingRight: "16px",
                      paddingTop: "5px",
                      paddingBottom: "5px",
                    }}
                    disableRipple
                    disabled={disabledPublicKeys.includes(publicKey.toString())}
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
                          checked={checkedWalletDescriptors.some(
                            (a) => a.derivationPath === derivationPath
                          )}
                          tabIndex={-1}
                          disabled={disabledPublicKeys.includes(
                            publicKey.toString()
                          )}
                          disableRipple
                          style={{ marginLeft: 0 }}
                        />
                      </div>
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
            </List>
          </>
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
          label={`${action === "search" ? "Recover" : "Import"} Wallet${
            allowMultiple ? "s" : ""
          }`}
          onClick={() => onNext(checkedWalletDescriptors)}
          disabled={checkedWalletDescriptors.length === 0}
        />
      </Box>
    </Box>
  );
}
