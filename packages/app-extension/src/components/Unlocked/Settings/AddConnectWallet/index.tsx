import { Suspense, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  CheckIcon,
  ImportedIcon,
  Loading,
  PlusCircleIcon,
} from "@coral-xyz/react-common";
import {
  secureUserAtom,
  useActiveWallet,
  useCreateNewWallet,
  useKeyringHasMnemonic,
} from "@coral-xyz/recoil";
import { useTheme } from "@coral-xyz/tamagui";
import { Box, Typography } from "@mui/material";
import { useNavigation } from "@react-navigation/native";
import { useRecoilValue } from "recoil";

import { Routes } from "../../../../refactor/navigation/SettingsNavigator";
import { Header, SubtextParagraph } from "../../../common";
import { WithMiniDrawer } from "../../../common/Layout/Drawer";
import { SettingsList } from "../../../common/Settings/List";
import { WalletListItem } from "../YourAccount/EditWallets";

export function AddConnectWalletMenu({
  blockchain,
}: {
  blockchain: Blockchain;
}) {
  return (
    <Suspense fallback={<div />}>
      <Container blockchain={blockchain} />
    </Suspense>
  );
}

function Container({ blockchain }: { blockchain: Blockchain }) {
  return <AddWalletMenu blockchain={blockchain} />;
}

function AddWalletMenu({ blockchain }: { blockchain: Blockchain }) {
  const navigation = useNavigation<any>();
  const hasMnemonic = useKeyringHasMnemonic();
  const user = useRecoilValue(secureUserAtom);
  const keyringExists = !!user.publicKeys.platforms[blockchain];

  const [newPublicKey, setNewPublicKey] = useState("");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const { createNewWithPhrase } = useCreateNewWallet(blockchain);

  const close = () => {
    navigation.popToTop();
    navigation.popToTop();
  };

  const handlePressCreateNew = async () => {
    setLoading(true);
    setOpenDrawer(true);
    createNewWithPhrase()
      .then(({ publicKey }) => {
        setNewPublicKey(publicKey);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
        setOpenDrawer(false);
      });
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Box sx={{ margin: "24px" }}>
          <Header text={t("create_or_import_wallet")} />
          <SubtextParagraph>
            {t("add_new_wallet_for_username", { username: user.user.username })}
          </SubtextParagraph>
        </Box>
        <SettingsList
          menuItems={{
            [hasMnemonic ? t("create_new_wallet") : t("setup_recovery_phrase")]:
              {
                onClick: () =>
                  hasMnemonic
                    ? handlePressCreateNew()
                    : navigation.push(
                        Routes.WalletCreateOrImportMnemonicScreen,
                        {
                          blockchain,
                          keyringExists,
                        }
                      ),
                icon: (props: any) => <PlusCircleIcon {...props} />,
              },
            [t("advanced_wallet_import")]: {
              onClick: () =>
                navigation.push(Routes.WalletAddAdvancedScreen, { blockchain }),
              icon: (props: any) => <ImportedIcon {...props} />,
            },
          }}
        />
      </div>
      <WithMiniDrawer
        openDrawer={openDrawer}
        setOpenDrawer={(open: boolean) => {
          setOpenDrawer(open);
          if (!open) {
            close();
          }
        }}
      >
        {newPublicKey ? (
          <ConfirmCreateWallet
            blockchain={blockchain}
            publicKey={newPublicKey}
            onClose={() => {
              setOpenDrawer(false);
              close();
            }}
            isLoading={loading}
          />
        ) : null}
      </WithMiniDrawer>
    </>
  );
}

/*
function RecoverWalletMenu({
  blockchain,
  publicKey,
}: {
  blockchain: Blockchain;
  publicKey: string;
}) {
  const nav = useNavigation();
  const enabledBlockchains = useEnabledBlockchains();
  const keyringExists = enabledBlockchains.includes(blockchain);
  const { t } = useTranslation();

  const recoverMenu = {
    "Other recovery phrase": {
      label: t("other_recovery_phrase"),
      onClick: () =>
        nav.push("import-from-mnemonic", {
          blockchain,
          inputMnemonic: true,
          keyringExists,
          publicKey,
        }),
      icon: (props: any) => <MnemonicIcon {...props} />,
      detailIcon: <PushDetail />,
    },
    "Private key": {
      label: t("private_key"),
      onClick: () =>
        nav.push("import-from-secret-key", {
          blockchain,
          publicKey,
        }),
      icon: (props: any) => <PlusCircleIcon {...props} />,
      detailIcon: <PushDetail />,
    },
    "Hardware wallet": {
      label: t("hardware_wallet"),
      onClick: () => {
        nav.push("import-from-mnemonic", {
          blockchain,
          keyringExists,
          inputMnemonic: false,
          ledger: true,
        });
      },
      icon: (props: any) => <HardwareIcon {...props} />,
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
        <Header text={t("recover_a_wallet")} />
        <SubtextParagraph>
          {t("recover_a_wallet_using_following")}
        </SubtextParagraph>
      </Box>
      <SettingsList menuItems={recoverMenu} />
    </div>
  );
}
*/

export const ConfirmCreateWallet: React.FC<{
  blockchain: Blockchain;
  publicKey: string;
  onClose: () => void;
  isLoading?: boolean;
}> = ({ blockchain, publicKey, onClose, isLoading = false }) => {
  const theme = useTheme();
  const wallet = useActiveWallet();
  const { t } = useTranslation();

  return (
    <div
      style={{
        height: "232px",
        backgroundColor: theme.baseBackgroundL2.val,
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
                color: theme.baseTextHighEmphasis.val,
              }}
            >
              {t("wallet_created")}
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
              name={wallet.name}
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
