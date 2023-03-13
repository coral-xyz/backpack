import { useEffect } from "react";
import type { Blockchain } from "@coral-xyz/common";
import { openAddUserAccount, openConnectHardware } from "@coral-xyz/common";
import {
  CheckIcon,
  HardwareIcon,
  ImportedIcon,
  Loading,
  MnemonicIcon,
  PlusCircleIcon,
  PrimaryButton,
  ProxyImage,
  PushDetail,
  SecondaryButton,
} from "@coral-xyz/react-common";
import { useAvatarUrl, useUser, useWalletName } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Box, Typography } from "@mui/material";

import { Header, SubtextParagraph } from "../../../common";
import { useDrawerContext } from "../../../common/Layout/Drawer";
import { useNavigation } from "../../../common/Layout/NavStack";
import { SettingsList } from "../../../common/Settings/List";
import { WalletListItem } from "../YourAccount/EditWallets";

export function AddConnectPreview() {
  const nav = useNavigation();
  const user = useUser();
  const avatarUrl = useAvatarUrl(72, user.username);
  const theme = useCustomTheme();
  const { close } = useDrawerContext();

  useEffect(() => {
    nav.setOptions({ headerTitle: "" });
  }, [nav]);

  return (
    <div
      style={{
        height: "100%",
        justifyContent: "space-between",
        flexDirection: "column",
        display: "flex",
      }}
    >
      <div>
        <ProxyImage
          src={avatarUrl}
          loadingStyles={{
            margin: "8px auto 16px auto",
            height: "72px",
            width: "72px",
            display: "block",
          }}
          style={{
            marginBottom: "16px",
            marginTop: "8px",
            width: "72px",
            borderRadius: "36px",
            marginLeft: "auto",
            marginRight: "auto",
            display: "block",
          }}
        />
        <Typography
          style={{
            color: theme.custom.colors.fontColor,
            fontSize: "24px",
            fontWeight: 500,
            textAlign: "center",
            marginLeft: "32px",
            marginRight: "32px",
          }}
        >
          Your new wallet will be associated with @{user.username}
        </Typography>
        <Typography
          style={{
            marginLeft: "32px",
            marginRight: "32px",
            marginTop: "8px",
            fontSize: "16px",
            fontWeight: 500,
            color: theme.custom.colors.secondary,
            textAlign: "center",
          }}
        >
          This connection will be public, so if you'd prefer to create a
          separate identity, create a new account.
        </Typography>
      </div>
      <div
        style={{
          marginLeft: "16px",
          marginRight: "16px",
        }}
      >
        <PrimaryButton
          label={`Continue as @${user.username}`}
          onClick={() => nav.push("edit-wallets-blockchain-selector")}
        />
        <SecondaryButton
          label="Create a new account"
          style={{
            marginTop: "16px",
            marginBottom: "16px",
            backgroundColor: "transparent",
          }}
          onClick={() => {
            close();
            openAddUserAccount();
          }}
        />
      </div>
    </div>
  );
}

export function AddConnectWalletMenu({
  blockchain,
  publicKey,
}: {
  blockchain: Blockchain;
  publicKey?: string;
}) {
  const nav = useNavigation();

  useEffect(() => {
    const prevTitle = nav.title;
    nav.setOptions({ headerTitle: "" });
    return () => {
      nav.setOptions({ headerTitle: prevTitle });
    };
  }, [nav]);

  // If a public key prop exists then attempting to recover an existing wallet
  if (publicKey) {
    return <RecoverWalletMenu blockchain={blockchain} publicKey={publicKey} />;
  } else {
    return <AddWalletMenu blockchain={blockchain} />;
  }
}

export function AddWalletMenu({ blockchain }: { blockchain: Blockchain }) {
  const navigation = useNavigation();
  const user = useUser();

  const createOrImportMenu = {
    "Create a new wallet": {
      onClick: () => navigation.push("create-wallet", { blockchain }),
      icon: (props: any) => <PlusCircleIcon {...props} />,
      detailIcon: <PushDetail />,
    },
    "Advanced wallet import": {
      onClick: () => navigation.push("import-wallet", { blockchain }),
      icon: (props: any) => <ImportedIcon {...props} />,
      detailIcon: <PushDetail />,
    },
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box sx={{ margin: "24px" }}>
        <Header text="Create or import a wallet" />
        <SubtextParagraph>
          Add a new wallet for @{user.username} on Backpack.
        </SubtextParagraph>
      </Box>
      <SettingsList menuItems={createOrImportMenu} />
    </div>
  );
}

export function RecoverWalletMenu({
  blockchain,
  publicKey,
}: {
  blockchain: Blockchain;
  publicKey: string;
}) {
  const nav = useNavigation();

  const recoverMenu = {
    "Hardware wallet": {
      onClick: () => {
        openConnectHardware(blockchain, "search", publicKey);
        window.close();
      },
      icon: (props: any) => <HardwareIcon {...props} />,
      detailIcon: <PushDetail />,
    },
    "Other recovery phrase": {
      onClick: () =>
        nav.push("import-from-mnemonic", {
          blockchain,
          inputMnemonic: true,
          keyringExists: true,
          publicKey,
        }),
      icon: (props: any) => <MnemonicIcon {...props} />,
      detailIcon: <PushDetail />,
    },
    "Private key": {
      onClick: () =>
        nav.push("import-from-secret-key", {
          blockchain,
          publicKey,
        }),
      icon: (props: any) => <PlusCircleIcon {...props} />,
      detailIcon: <PushDetail />,
    },
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box sx={{ margin: "24px" }}>
        <Header text="Recover a wallet" />
        <SubtextParagraph>
          Recover a wallet using one of the following:
        </SubtextParagraph>
      </Box>
      <SettingsList menuItems={recoverMenu} />
    </div>
  );
}

export const ConfirmCreateWallet: React.FC<{
  blockchain: Blockchain;
  publicKey: string;
  onClose: () => void;
  isLoading?: boolean;
}> = ({ blockchain, publicKey, onClose, isLoading = false }) => {
  const theme = useCustomTheme();
  const walletName = useWalletName(publicKey);

  return (
    <div
      style={{
        height: "232px",
        backgroundColor: theme.custom.colors.bg2,
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <div>
            <Typography
              style={{
                marginTop: "16px",
                textAlign: "center",
                fontWeight: 500,
                fontSize: "18px",
                lineHeight: "24px",
                color: theme.custom.colors.fontColor,
              }}
            >
              Wallet Created
            </Typography>
            <div
              style={{
                textAlign: "center",
                marginTop: "24px",
              }}
            >
              <CheckIcon />
            </div>
          </div>
          <div>
            <WalletListItem
              blockchain={blockchain}
              name={walletName}
              publicKey={publicKey}
              showDetailMenu={false}
              isFirst
              isLast
              onClick={() => {
                onClose();
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};
