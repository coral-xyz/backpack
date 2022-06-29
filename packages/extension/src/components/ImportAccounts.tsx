import { useEffect, useState } from "react";
import { Box, List, ListItemButton, ListItemText } from "@mui/material";
import {
  Checkbox,
  Header,
  SubtextParagraph,
  PrimaryButton,
  walletAddressDisplay,
} from "./common";
import { Connection, PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { useAnchorContext } from "@coral-xyz/recoil";
import {
  getBackgroundClient,
  DerivationPath,
  UI_RPC_METHOD_PREVIEW_PUBKEYS,
} from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import { useEphemeralNav } from "@coral-xyz/recoil";
import type { NavEphemeralContext } from "@coral-xyz/recoil";

type Account = {
  publicKey: anchor.web3.PublicKey;
  account?: anchor.web3.AccountInfo<Buffer>;
};

export function ImportAccounts({
  mnemonic,
  onNext,
}: {
  mnemonic?: string;
  onNext: (
    nav: NavEphemeralContext,
    accountIndices: number[],
    derivationPath: DerivationPath,
    mnemonic?: string
  ) => void;
}) {
  const theme = useCustomTheme();
  const [accounts, setAccounts] = useState<Array<Account>>([]);
  const [accountIndices, setAccountIndices] = useState<number[]>([]);
  const [derivationPath, setDerivationPath] = useState<DerivationPath>(
    DerivationPath.Bip44Change
  );
  const nav = useEphemeralNav();

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
    /**
    const loaderFn = mnemonic
      ? (derivationPath: DerivationPath) =>
          loadMnemonicPublicKeys(mnemonic, derivationPath)
      : loadLedgerPublicKeys("ledger", derivationPath);
    **/
    if (!mnemonic || !derivationPath) return;

    const loaderFn = (derivationPath: DerivationPath) =>
      loadMnemonicPublicKeys(mnemonic, derivationPath);

    loaderFn(derivationPath).then(async (publicKeys) => {
      const accounts = (
        await anchor.utils.rpc.getMultipleAccounts(
          connection,
          publicKeys.map((p: string) => new PublicKey(p))
        )
      ).map((result, index) => {
        return result === null ? { publicKey: publicKeys[index] } : result;
      });
      setAccounts(accounts);
    });
  }, [derivationPath]);

  //
  // Load accounts for the given mnemonic. This is passed to the ImportAccounts
  // component and called whenever the derivation path is changed with the selector.
  //
  const loadMnemonicPublicKeys = async (
    mnemonic: string,
    derivationPath: DerivationPath
  ) => {
    const background = getBackgroundClient();
    return await background.request({
      method: UI_RPC_METHOD_PREVIEW_PUBKEYS,
      params: [mnemonic, derivationPath, 8],
    });
  };

  //
  // Load accounts for a ledger.
  //
  //
  const loadLedgerPublicKeys = async (
    ledger: string,
    derivationPath: DerivationPath
  ) => {
    return [];
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
                  primary="0 SOL"
                />
              </Box>
            </ListItemButton>
          ))}
        </List>
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
          onClick={() => onNext(nav, accountIndices, derivationPath, mnemonic)}
          disabled={accountIndices.length === 0}
        />
      </Box>
    </Box>
  );
}
