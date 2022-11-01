import { useEffect, useState } from "react";
import { ethers, BigNumber } from "ethers";
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
} from "@mui/material";
import Ethereum from "@ledgerhq/hw-app-eth";
import Solana from "@ledgerhq/hw-app-solana";
import Transport from "@ledgerhq/hw-transport";
import { Connection as SolanaConnection, PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { useBackgroundClient } from "@coral-xyz/recoil";
import {
  accountDerivationPath,
  derivationPathPrefix,
  Blockchain,
  DerivationPath,
  EthereumConnectionUrl,
  DEFAULT_SOLANA_CLUSTER,
  UI_RPC_METHOD_PREVIEW_PUBKEYS,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
} from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import {
  Checkbox,
  Header,
  Loading,
  PrimaryButton,
  SubtextParagraph,
  TextField,
  walletAddressDisplay,
} from "../../common";
import { TextInput } from "../Inputs";

const { base58: bs58 } = ethers.utils;

type Account = {
  publicKey: string;
  balance: BigNumber;
  // The account index for the derivation path
  index: number;
};

export type SelectedAccount = {
  index: number;
  publicKey: string;
};

const LOAD_PUBKEY_AMOUNT = 20;
const DISPLAY_PUBKEY_AMOUNT = 5;

export function ImportAccounts({
  blockchain,
  mnemonic,
  transport,
  onNext,
  onError,
  allowMultiple = true,
}: {
  blockchain: Blockchain;
  mnemonic?: string;
  transport?: Transport | null;
  onNext: (
    selectedAccounts: SelectedAccount[],
    derivationPath: DerivationPath,
    mnemonic?: string
  ) => void;
  onError?: (error: Error) => void;
  allowMultiple?: boolean;
}) {
  const background = useBackgroundClient();
  const theme = useCustomTheme();
  const [accounts, setAccounts] = useState<Array<Account>>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<SelectedAccount[]>(
    []
  );
  const [ledgerLocked, setLedgerLocked] = useState(false);
  const [importedPubkeys, setImportedPubkeys] = useState<string[]>([]);
  const [derivationPath, setDerivationPath] = useState<DerivationPath>(
    DerivationPath.Default
  );

  useEffect(() => {
    (async () => {
      try {
        const blockchainKeyrings = await background.request({
          method: UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
          params: [],
        });
        const keyring = blockchainKeyrings[blockchain];
        setImportedPubkeys(
          Object.values(keyring)
            .flat()
            .map((a: any) => a.publicKey)
        );
      } catch {
        // Keyring store locked, either onboarding or left open
      }
    })();
  }, [background, blockchain]);

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
      .then(async (publicKeys: string[]) => {
        const balances = await loadBalances(publicKeys);
        setAccounts(
          balances.sort((a, b) =>
            b.balance.lt(a.balance) ? -1 : b.balance.eq(a.balance) ? 0 : 1
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
  }, [mnemonic, transport, derivationPath]);

  //
  // Clear accounts and selected acounts on change of derivation path.
  //
  useEffect(() => {
    setAccounts([]);
    setSelectedAccounts([]);
  }, [derivationPath]);

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
  // Load accounts for the given mnemonic. This is passed to the ImportAccounts
  // component and called whenever the derivation path is changed with the selector.
  //
  const loadMnemonicPublicKeys = async (
    mnemonic: string,
    derivationPath: DerivationPath
  ) => {
    return await background.request({
      method: UI_RPC_METHOD_PREVIEW_PUBKEYS,
      params: [blockchain, mnemonic, derivationPath, LOAD_PUBKEY_AMOUNT],
    });
  };

  //
  // Load accounts for a ledger.
  //
  const loadLedgerPublicKeys = async (
    transport: Transport,
    derivationPath: DerivationPath
  ): Promise<string[]> => {
    const publicKeys = [];
    setLedgerLocked(true);

    const ledger = {
      [Blockchain.SOLANA]: new Solana(transport),
      [Blockchain.ETHEREUM]: new Ethereum(transport),
    }[blockchain];

    // Add remaining accounts
    for (let account = 0; account < LOAD_PUBKEY_AMOUNT; account += 1) {
      const path = accountDerivationPath(blockchain, derivationPath, account);
      publicKeys.push((await ledger.getAddress(path)).address);
    }

    setLedgerLocked(false);
    return publicKeys.map((p) =>
      blockchain === Blockchain.SOLANA ? bs58.encode(p) : p.toString()
    );
  };

  //
  // Handles checkbox clicks to select accounts to import.
  //
  const handleSelect = (index: number, publicKey: string) => () => {
    const currentIndex = selectedAccounts.findIndex((a) => a.index === index);
    let newSelectedAccounts = [...selectedAccounts];
    if (currentIndex === -1) {
      // Adding the account
      if (allowMultiple) {
        newSelectedAccounts.push({ index, publicKey });
      } else {
        newSelectedAccounts = [{ index, publicKey }];
      }
    } else {
      // Removing the account
      newSelectedAccounts.splice(currentIndex, 1);
    }
    // Sort by account indices
    newSelectedAccounts.sort((a, b) => a.index - b.index);
    setSelectedAccounts(newSelectedAccounts);
  };

  const derivationPathOptions = {
    [Blockchain.SOLANA]: [
      {
        path: DerivationPath.Bip44,
        label: derivationPathPrefix(Blockchain.SOLANA, DerivationPath.Bip44),
      },
      {
        path: DerivationPath.Bip44Change,
        label: derivationPathPrefix(
          Blockchain.SOLANA,
          DerivationPath.Bip44Change
        ),
      },
    ],
    [Blockchain.ETHEREUM]: [
      {
        path: DerivationPath.Bip44,
        label: derivationPathPrefix(Blockchain.ETHEREUM, DerivationPath.Bip44),
      },
      {
        path: DerivationPath.Bip44Change,
        label: derivationPathPrefix(
          Blockchain.ETHEREUM,
          DerivationPath.Bip44Change
        ),
      },
    ],
  }[blockchain];

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
          <Header text={`Import account${allowMultiple ? "s" : ""}`} />
          <SubtextParagraph>
            Select which account{allowMultiple ? "s" : ""} you'd like to import.
          </SubtextParagraph>
        </Box>
        <div style={{ margin: "16px" }}>
          <TextInput
            placeholder="Derivation Path"
            value={derivationPath}
            setValue={(e) => setDerivationPath(e.target.value)}
            select={true}
            disabled={ledgerLocked}
          >
            {derivationPathOptions.map((o, idx) => (
              <MenuItem value={o.path} key={idx}>
                {o.label}
              </MenuItem>
            ))}
          </TextInput>
        </div>
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
              {accounts
                .slice(0, DISPLAY_PUBKEY_AMOUNT)
                .map(({ publicKey, balance, index }) => (
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
                    disableRipple
                    disabled={importedPubkeys.includes(publicKey.toString())}
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
                            selectedAccounts.some((a) => a.index === index) ||
                            importedPubkeys.includes(publicKey.toString())
                          }
                          tabIndex={-1}
                          disabled={importedPubkeys.includes(
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
                          balance
                            ? (+ethers.utils.formatUnits(
                                balance,
                                decimals
                              )).toFixed(4)
                            : 0
                        } ${symbol}`}
                      />
                    </Box>
                  </ListItemButton>
                ))}
            </List>
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
          label={`Import Account${allowMultiple ? "s" : ""}`}
          onClick={() => onNext(selectedAccounts, derivationPath, mnemonic)}
          disabled={selectedAccounts.length === 0}
        />
      </Box>
    </Box>
  );
}
