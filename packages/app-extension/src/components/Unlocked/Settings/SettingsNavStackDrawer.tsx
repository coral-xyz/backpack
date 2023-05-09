import {
  AllWalletsList,
  WalletListBlockchainSelector,
} from "../../../components/common/WalletList";
import { CloseButton, WithDrawer } from "../../common/Layout/Drawer";
import {
  NavStackEphemeral,
  NavStackScreen,
} from "../../common/Layout/NavStack";
import { Logout, ResetWarning } from "../../Locked/Reset/ResetWarning";
import { ResetWelcome } from "../../Locked/Reset/ResetWelcome";
import { ContactRequests, Contacts } from "../Messages/Contacts";
import { Requests } from "../Messages/Requests";

import {
  CreateMnemonic,
  CreateOrImportMnemonic,
} from "./AddConnectWallet/CreateMnemonic";
import { ImportMenu } from "./AddConnectWallet/ImportMenu";
import {
  ImportMnemonic,
  ImportMnemonicAutomatic,
} from "./AddConnectWallet/ImportMnemonic";
import { ImportSecretKey } from "./AddConnectWallet/ImportSecretKey";
import { PreferencesAutoLock } from "./Preferences/AutoLock";
import { PreferencesEthereum } from "./Preferences/Ethereum";
import { PreferencesEthereumConnection } from "./Preferences/Ethereum/Connection";
import { PreferenceEthereumCustomRpcUrl } from "./Preferences/Ethereum/CustomRpcUrl";
import { PreferencesSolana } from "./Preferences/Solana";
import { PreferencesSolanaCommitment } from "./Preferences/Solana/Commitment";
import { PreferencesSolanaConnection } from "./Preferences/Solana/ConnectionSwitch";
import { PreferenceSolanaCustomRpcUrl } from "./Preferences/Solana/CustomRpcUrl";
import { PreferencesSolanaExplorer } from "./Preferences/Solana/Explorer";
import { PreferencesTrustedSites } from "./Preferences/TrustedSites";
import { XnftDetail } from "./Xnfts/Detail";
import { ChangePassword } from "./YourAccount/ChangePassword";
import { RemoveWallet } from "./YourAccount/EditWallets/RemoveWallet";
import { RenameWallet } from "./YourAccount/EditWallets/RenameWallet";
import { WalletDetail } from "./YourAccount/EditWallets/WalletDetail";
import {
  ShowPrivateKey,
  ShowPrivateKeyWarning,
} from "./YourAccount/ShowPrivateKey";
import {
  ShowRecoveryPhrase,
  ShowRecoveryPhraseWarning,
} from "./YourAccount/ShowRecoveryPhrase";
import { AboutBackpack } from "./AboutBackpack";
import { AddConnectPreview, AddConnectWalletMenu } from "./AddConnectWallet";
import { Preferences } from "./Preferences";
import { XnftSettings } from "./Xnfts";
import { YourAccount } from "./YourAccount";
import { SettingsMenu } from ".";

export function SettingsNavStackDrawer({
  settingsOpen,
  setSettingsOpen,
}: {
  settingsOpen: boolean;
  setSettingsOpen: any;
}) {
  return (
    <WithDrawer openDrawer={settingsOpen} setOpenDrawer={setSettingsOpen}>
      <div style={{ height: "100%" }}>
        <NavStackEphemeral
          initialRoute={{ name: "root", title: "Profile" }}
          options={() => ({ title: "" })}
          navButtonLeft={<CloseButton onClick={() => setSettingsOpen(false)} />}
        >
          <NavStackScreen
            name="root"
            component={(props: any) => <SettingsMenu {...props} />}
          />
          <NavStackScreen
            name="add-connect-wallet"
            component={(props: any) => <AddConnectWalletMenu {...props} />}
          />
          <NavStackScreen
            name="create-or-import-mnemonic"
            component={(props: any) => <CreateOrImportMnemonic {...props} />}
          />
          <NavStackScreen
            name="create-mnemonic"
            component={(props: any) => <CreateMnemonic {...props} />}
          />
          <NavStackScreen
            name="import-wallet"
            component={(props: any) => <ImportMenu {...props} />}
          />
          <NavStackScreen
            name="import-from-mnemonic"
            component={(props: any) => <ImportMnemonic {...props} />}
          />
          <NavStackScreen
            name="set-and-sync-mnemonic"
            component={(props: any) => <ImportMnemonicAutomatic {...props} />}
          />
          <NavStackScreen
            name="import-from-secret-key"
            component={(props: any) => <ImportSecretKey {...props} />}
          />
          <NavStackScreen
            name="your-account"
            component={(props: any) => <YourAccount {...props} />}
          />
          <NavStackScreen
            name="preferences"
            component={(props: any) => <Preferences {...props} />}
          />
          <NavStackScreen
            name="preferences-auto-lock"
            component={(props: any) => <PreferencesAutoLock {...props} />}
          />
          <NavStackScreen
            name="preferences-trusted-sites"
            component={(props: any) => <PreferencesTrustedSites {...props} />}
          />
          <NavStackScreen
            name="preferences-solana"
            component={(props: any) => <PreferencesSolana {...props} />}
          />
          <NavStackScreen
            name="preferences-ethereum"
            component={(props: any) => <PreferencesEthereum {...props} />}
          />
          <NavStackScreen
            name="preferences-solana-rpc-connection"
            component={(props: any) => (
              <PreferencesSolanaConnection {...props} />
            )}
          />
          <NavStackScreen
            name="preferences-solana-edit-rpc-connection"
            component={(props: any) => (
              <PreferenceSolanaCustomRpcUrl {...props} />
            )}
          />
          <NavStackScreen
            name="preferences-solana-commitment"
            component={(props: any) => (
              <PreferencesSolanaCommitment {...props} />
            )}
          />
          <NavStackScreen
            name="preferences-solana-explorer"
            component={(props: any) => <PreferencesSolanaExplorer {...props} />}
          />
          <NavStackScreen
            name="preferences-ethereum-rpc-connection"
            component={(props: any) => (
              <PreferencesEthereumConnection {...props} />
            )}
          />
          <NavStackScreen
            name="preferences-ethereum-edit-rpc-connection"
            component={(props: any) => (
              <PreferenceEthereumCustomRpcUrl {...props} />
            )}
          />
          <NavStackScreen
            name="change-password"
            component={(props: any) => <ChangePassword {...props} />}
          />
          <NavStackScreen
            name="reset"
            component={(props: any) => <ResetWelcome {...props} />}
          />
          <NavStackScreen
            name="edit-wallets"
            component={(props: any) => <AllWalletsList {...props} />}
          />
          <NavStackScreen
            name="edit-wallets-add-connect-preview"
            component={(props: any) => <AddConnectPreview {...props} />}
          />
          <NavStackScreen
            name="edit-wallets-wallet-detail"
            component={(props: any) => <WalletDetail {...props} />}
          />
          <NavStackScreen
            name="edit-wallets-remove"
            component={(props: any) => <RemoveWallet {...props} />}
          />
          <NavStackScreen
            name="edit-wallets-rename"
            component={(props: any) => <RenameWallet {...props} />}
          />
          <NavStackScreen
            name="edit-wallets-blockchain-selector"
            component={(props: any) => (
              <WalletListBlockchainSelector {...props} />
            )}
          />
          <NavStackScreen
            name="show-private-key-warning"
            component={(props: any) => <ShowPrivateKeyWarning {...props} />}
          />
          <NavStackScreen
            name="show-private-key"
            component={(props: any) => <ShowPrivateKey {...props} />}
          />
          <NavStackScreen
            name="show-secret-phrase-warning"
            component={(props: any) => <ShowRecoveryPhraseWarning {...props} />}
          />
          <NavStackScreen
            name="show-secret-phrase"
            component={(props: any) => <ShowRecoveryPhrase {...props} />}
          />
          <NavStackScreen
            name="reset-warning"
            component={(props: any) => <ResetWarning {...props} />}
          />
          <NavStackScreen
            name="logout"
            component={(props: any) => <Logout {...props} />}
          />
          <NavStackScreen
            name="xnfts"
            component={(props: any) => <XnftSettings {...props} />}
          />
          <NavStackScreen
            name="xnfts-detail"
            component={(props: any) => <XnftDetail {...props} />}
          />
          <NavStackScreen
            name="contacts"
            component={(props: any) => <Contacts {...props} />}
          />
          <NavStackScreen
            name="contact-requests"
            component={(props: any) => <ContactRequests {...props} />}
          />
          <NavStackScreen
            name="contact-requests-sent"
            component={(props: any) => <ContactRequests {...props} />}
          />
          <NavStackScreen
            name="requests"
            component={(props: any) => <Requests {...props} />}
          />
          <NavStackScreen
            name="about-backpack"
            component={(props: any) => <AboutBackpack {...props} />}
          />
        </NavStackEphemeral>
      </div>
    </WithDrawer>
  );
}
