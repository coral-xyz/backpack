import { useState } from "react";
import { useEphemeralNav } from "@coral-xyz/recoil";
import { Box } from "@mui/material";
import {
  Header,
  SubtextParagraph,
  SecondaryButton,
  DangerButton,
} from "../../common";
import { ResetWarning } from "./ResetWarning";
import { MnemonicInput } from "./MnemonicInput";
import { SetupComplete } from "./SetupComplete";
import { ImportAccounts } from "../../ImportAccounts";
import { CreatePassword } from "../../Account/CreatePassword";
import {
  getBackgroundClient,
  DerivationPath,
  UI_RPC_METHOD_KEYRING_STORE_CREATE,
} from "@coral-xyz/common";
import type { NavEphemeralContext } from "@coral-xyz/recoil";

export function Reset({ closeDrawer }: { closeDrawer: () => void }) {
  const nav = useEphemeralNav();

  const onNext = (nav: NavEphemeralContext) => {
    nav.push(<MnemonicInput onNext={handleMnemonic} />);
  };

  const handleMnemonic = (nav: NavEphemeralContext, mnemonic: string) => {
    nav.setState({ ...nav.state, mnemonic });
    nav.push(
      <ImportAccounts mnemonic={mnemonic} onNext={handleImportAccounts} />
    );
  };

  const handleImportAccounts = (
    nav: NavEphemeralContext,
    accountIndices: number[],
    derivationPath: DerivationPath
  ) => {
    nav.setState({ ...nav.state, accountIndices, derivationPath });
    nav.push(<CreatePassword onNext={handleCreatePassword} />);
  };

  const handleCreatePassword = async (
    nav: NavEphemeralContext,
    password: string
  ) => {
    const background = getBackgroundClient();
    await background.request({
      method: UI_RPC_METHOD_KEYRING_STORE_CREATE,
      params: [
        nav.state.mnemonic,
        nav.state.derivationPath,
        password,
        nav.state.accountIndices,
      ],
    });
    nav.push(<SetupComplete onClose={closeDrawer} />);
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
      <Box
        sx={{
          marginLeft: "24px",
          marginRight: "24px",
        }}
      >
        <Header text="Forgot your password?" />
        <SubtextParagraph>
          We can’t recover your password as it is only stored on your computer.
          You can try more passwords or reset your wallet with the secret
          recovery phrase.
        </SubtextParagraph>
      </Box>
      <Box
        sx={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "16px",
        }}
      >
        <Box sx={{ mb: "16px" }}>
          <SecondaryButton label="Try More Passwords" onClick={closeDrawer} />
        </Box>
        <DangerButton
          label="Reset Secret Recovery Phrase"
          onClick={() =>
            nav.push(<ResetWarning onNext={onNext} onClose={closeDrawer} />)
          }
        />
      </Box>
    </Box>
  );
}
