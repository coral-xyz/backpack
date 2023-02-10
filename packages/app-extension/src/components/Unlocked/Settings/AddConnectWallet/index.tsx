import { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import {
  openAddUserAccount,
  openConnectHardware,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_READ,
} from "@coral-xyz/common";
import {
  CheckIcon,
  HardwareIcon,
  ImportedIcon,
  Loading,
  PlusCircleIcon,
  PrimaryButton,
  ProxyImage,
  PushDetail,
  SecondaryButton,
} from "@coral-xyz/react-common";
import {
  useAvatarUrl,
  useBackgroundClient,
  useUser,
  useWalletName,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { ArrowCircleDown } from "@mui/icons-material";
import { Box, Grid, Typography } from "@mui/material";

import { Header, SubtextParagraph } from "../../../common";
import { ActionCard } from "../../../common/Layout/ActionCard";
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
          separate wallet, create a new account.
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
          label={`Create a new account`}
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
  }, [nav.setOptions]);

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
    "Import an existing wallet": {
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
  const theme = useCustomTheme();
  const background = useBackgroundClient();
  const [keyringExists, setKeyringExists] = useState(false);

  useEffect(() => {
    (async () => {
      const blockchainKeyrings = await background.request({
        method: UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_READ,
        params: [],
      });
      setKeyringExists(blockchainKeyrings.includes(blockchain));
    })();
  }, [blockchain]);

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
          Recover a wallet associated with your Backpack account.
        </SubtextParagraph>
      </Box>
      <Box sx={{ margin: "0 16px" }}>
        <Grid container spacing={2}>
          {keyringExists && (
            <Grid item xs={6}>
              <ActionCard
                icon={
                  <ArrowCircleDown
                    style={{
                      color: theme.custom.colors.icon,
                    }}
                  />
                }
                text="Recover using private key"
                onClick={() =>
                  nav.push("import-from-secret-key", {
                    blockchain,
                    publicKey,
                  })
                }
              />
            </Grid>
          )}
          <Grid item xs={6}>
            <ActionCard
              icon={
                <HardwareIcon
                  fill={theme.custom.colors.icon}
                  style={{
                    width: "24px",
                    height: "24px",
                  }}
                />
              }
              text="Recover using hardware wallet"
              onClick={() => {
                openConnectHardware(blockchain, "search", publicKey);
                window.close();
              }}
            />
          </Grid>
        </Grid>
      </Box>
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
              isFirst={true}
              isLast={true}
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
