import { useState } from "react";
import {
  Blockchain,
  BlockchainKeyringInit,
  DerivationPath,
  KeyringType,
  UI_RPC_METHOD_PREVIEW_PUBKEYS,
  UI_RPC_METHOD_SIGN_MESSAGE_FOR_WALLET,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { KeyringTypeSelector } from "../KeyringTypeSelector";
import { BlockchainSelector } from "../BlockchainSelector";
import { OnboardHardware } from "../OnboardHardware";
import { MnemonicInput } from "../../../common/Account/MnemonicInput";
import { CreatePassword } from "../../../common/Account/CreatePassword";
import {
  ImportAccounts,
  SelectedAccount,
} from "../../../common/Account/ImportAccounts";
import { WithContaineredDrawer } from "../../../common/Layout/Drawer";
import { NavBackButton, WithNav } from "../../../common/Layout/Nav";
import { Finish } from "../Finish";
import { useSteps } from "../../../../hooks/useSteps";

export const CreateImportAccount = ({
  action,
  inviteCode,
  username,
  containerRef,
  onClose,
  navProps,
}: {
  action: "create" | "import";
  inviteCode: string;
  username: string;
  containerRef: any;
  onClose: () => void;
  navProps: object;
}) => {
  const { step, nextStep, prevStep } = useSteps();
  const background = useBackgroundClient();
  const [keyringType, setKeyringType] = useState<KeyringType | null>(null);
  const [blockchainKeyrings, setBlockchainKeyrings] = useState<
    Array<BlockchainKeyringInit>
  >([]);
  const [blockchain, setBlockchain] = useState<Blockchain | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [mnemonic, setMnemonic] = useState<string | undefined>(undefined);
  const [openDrawer, setOpenDrawer] = useState(false);

  const selectedBlockchains = blockchainKeyrings.map((b) => b.blockchain);

  const handleBlockchainClick = async (blockchain: Blockchain) => {
    if (selectedBlockchains.includes(blockchain)) {
      // Blockchain is being deselected
      setBlockchain(null);
      setBlockchainKeyrings(
        blockchainKeyrings.filter((b) => b.blockchain !== blockchain)
      );
    } else {
      // Blockchain is being selected
      if (keyringType === "ledger" || action === "import") {
        // If wallet is a ledger, step through the ledger onboarding flow
        // OR if action is an import then open the drawer with the import accounts
        // component
        setBlockchain(blockchain);
        setOpenDrawer(true);
      } else if (action === "create") {
        // We are creating a new wallet, generate the signature using a default
        // derivation path and account index
        signForWallet(blockchain, DerivationPath.Default, 0);
      }
    }
  };

  const signForWallet = async (
    blockchain: Blockchain,
    derivationPath: DerivationPath,
    accountIndex: number,
    publicKey?: string
  ) => {
    if (!publicKey) {
      // No publicKey given, this is a create action, so preview the public keys
      // and grab the one at the index
      const publicKeys = await background.request({
        method: UI_RPC_METHOD_PREVIEW_PUBKEYS,
        params: [blockchain, mnemonic, derivationPath, accountIndex + 1],
      });
      publicKey = publicKeys[accountIndex];
    }
    const signature = await background.request({
      method: UI_RPC_METHOD_SIGN_MESSAGE_FOR_WALLET,
      params: [
        blockchain,
        "123123",
        derivationPath,
        accountIndex,
        publicKey!,
        mnemonic,
      ],
    });
    addBlockchainKeyring({
      blockchain: blockchain!,
      derivationPath,
      accountIndex,
      publicKey: publicKey!,
      signature,
    });
  };

  // Add the initialisation parameters for a blockchain keyring to state
  const addBlockchainKeyring = (blockchainKeyring: BlockchainKeyringInit) => {
    setBlockchainKeyrings([...blockchainKeyrings, blockchainKeyring]);
  };

  const keyringInit = {
    mnemonic,
    blockchainKeyrings,
  };

  const steps = [
    <KeyringTypeSelector
      action={action}
      onNext={(keyringType: KeyringType) => {
        setKeyringType(keyringType);
        nextStep();
      }}
    />,
    // Show the seed phrase if we are creating based on a mnemonic
    ...(keyringType === "mnemonic"
      ? [
          <MnemonicInput
            readOnly={action === "create"}
            buttonLabel={action === "create" ? "Next" : "Import"}
            onNext={(mnemonic) => {
              setMnemonic(mnemonic);
              nextStep();
            }}
          />,
        ]
      : []),
    <BlockchainSelector
      selectedBlockchains={selectedBlockchains}
      onClick={handleBlockchainClick}
      onNext={nextStep}
    />,
    <CreatePassword
      onNext={(password) => {
        setPassword(password);
        nextStep();
      }}
    />,
    <Finish
      inviteCode={inviteCode}
      username={username}
      password={password!}
      keyringInit={keyringInit!}
    />,
  ];

  return (
    <WithNav
      navButtonLeft={
        <NavBackButton onClick={step === 0 ? onClose : prevStep} />
      }
      {...navProps}
    >
      {steps[step]}

      <WithContaineredDrawer
        containerRef={containerRef}
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
        paperStyles={{
          height: "calc(100% - 56px)",
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
        }}
      >
        {keyringType === "ledger" ? (
          <OnboardHardware
            blockchain={blockchain!}
            action={action}
            onComplete={(result) => {
              addBlockchainKeyring(result);
              setOpenDrawer(false);
            }}
            onClose={() => setOpenDrawer(false)}
          />
        ) : (
          <ImportAccounts
            blockchain={blockchain!}
            mnemonic={mnemonic!}
            allowMultiple={false}
            onNext={(
              selectedAccounts: SelectedAccount[],
              derivationPath: DerivationPath
            ) => {
              // Should only be one selected account due to allowMultiple being false
              const account = selectedAccounts[0];
              signForWallet(
                blockchain!,
                derivationPath,
                account.index,
                account.publicKey
              );
              setOpenDrawer(false);
            }}
          />
        )}
      </WithContaineredDrawer>
    </WithNav>
  );
};
