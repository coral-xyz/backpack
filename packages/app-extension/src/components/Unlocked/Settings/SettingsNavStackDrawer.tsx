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
import { PreferencesBlockchain } from "./Preferences/Blockchains";
import { PreferencesBlockchainCommitment } from "./Preferences/Blockchains/Commitment";
import { PreferencesBlockchainConnection } from "./Preferences/Blockchains/ConnectionSwitch";
import { PreferenceBlockchainCustomRpcUrl } from "./Preferences/Blockchains/CustomRpcUrl";
import { PreferencesBlockchainExplorer } from "./Preferences/Blockchains/Explorer";
import { PreferencesHiddenTokens } from "./Preferences/HiddenTokens";
import { PreferencesLanguage } from "./Preferences/Language";
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
import { UpdateUsername } from "./YourAccount/UpdateUsername";
import { AboutBackpack } from "./AboutBackpack";
import { AddConnectWalletMenu } from "./AddConnectWallet";
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
            name="preferences-language"
            component={(props: any) => <PreferencesLanguage {...props} />}
          />
          <NavStackScreen
            name="preferences-blockchain"
            component={(props: any) => <PreferencesBlockchain {...props} />}
          />
          <NavStackScreen
            name="preferences-blockchain-rpc-connection"
            component={(props: any) => (
              <PreferencesBlockchainConnection {...props} />
            )}
          />
          <NavStackScreen
            name="preferences-blockchain-edit-rpc-connection"
            component={(props: any) => (
              <PreferenceBlockchainCustomRpcUrl {...props} />
            )}
          />
          <NavStackScreen
            name="preferences-blockchain-commitment"
            component={(props: any) => (
              <PreferencesBlockchainCommitment {...props} />
            )}
          />
          <NavStackScreen
            name="preferences-blockchain-explorer"
            component={(props: any) => (
              <PreferencesBlockchainExplorer {...props} />
            )}
          />
          <NavStackScreen
            name="preferences-hidden-tokens"
            component={(props: any) => <PreferencesHiddenTokens {...props} />}
          />
          <NavStackScreen
            name="update-username"
            component={(props: any) => <UpdateUsername {...props} />}
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
            name="about-backpack"
            component={(props: any) => <AboutBackpack {...props} />}
          />
        </NavStackEphemeral>
      </div>
    </WithDrawer>
  );
}
