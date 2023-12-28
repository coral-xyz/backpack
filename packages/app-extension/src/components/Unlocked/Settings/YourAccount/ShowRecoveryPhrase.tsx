import { useEffect, useState } from "react";
import { UI_RPC_METHOD_KEYRING_EXPORT_MNEMONIC } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { EyeIcon, WarningIcon } from "@coral-xyz/react-common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import {
  BpCopyButton,
  BpDangerButton,
  BpPasswordInput,
  BpPrimaryButton,
  temporarilyMakeStylesForBrowserExtension,
  useTheme,
  YStack,
} from "@coral-xyz/tamagui";
import ChatIcon from "@mui/icons-material/Chat";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import WebIcon from "@mui/icons-material/Web";
import { Box, List, ListItem, ListItemIcon } from "@mui/material";

import { Header, HeaderIcon, SubtextParagraph } from "../../../common";
import { MnemonicInputFields } from "../../../common/Account/MnemonicInput";
import { useDrawerContext } from "../../../common/Layout/Drawer";
import { useNavigation } from "../../../common/Layout/NavStack";

const useStyles = temporarilyMakeStylesForBrowserExtension((theme) => ({
  listRoot: {
    color: theme.baseTextHighEmphasis.val,
    padding: "0",
    margin: "0 8px",
    borderRadius: "4px",
    fontSize: "14px",
  },
  listItemRoot: {
    border: `${theme.baseBorderLight.val}`,
    alignItems: "start",
    borderRadius: "4px",
    background: theme.baseBackgroundL1.val,
    padding: "8px",
    minHeight: "56px",
    marginBottom: "1px",
  },
  listItemIconRoot: {
    minWidth: "inherit",
    height: "20px",
    width: "20px",
    marginRight: "8px",
  },
}));

export function ShowRecoveryPhraseWarning() {
  const theme = useTheme();
  const classes = useStyles();
  const background = useBackgroundClient();
  const nav = useNavigation();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const navButton = nav.navButtonRight;
    nav.setOptions({
      headerTitle: "Secret recovery phrase",
    });
    return () => {
      nav.setOptions({ headerRight: navButton });
    };
  }, []);

  const next = async () => {
    // e.preventDefault();
    let mnemonic;
    try {
      // ph101pp todo
      mnemonic = await background.request({
        method: UI_RPC_METHOD_KEYRING_EXPORT_MNEMONIC,
        params: [password],
      });
    } catch (e) {
      console.error(e);
      setError(true);
      return;
    }
    nav.push("show-secret-phrase", { mnemonic });
  };

  return (
    <YStack height="100%" space="$4" padding="$4" flex={1}>
      <YStack flex={0} space="$3" justifyContent="center" alignItems="center">
        <WarningIcon fill={theme.redIcon.val} width="40px" height="40px" />
        <Header text="Warning" style={{ textAlign: "center" }} />
      </YStack>
      <YStack flex={1} space="$4" justifyContent="center">
        <List className={classes.listRoot}>
          <ListItem className={classes.listItemRoot}>
            <ListItemIcon className={classes.listItemIconRoot}>
              <ChatIcon
                htmlColor={theme.redIcon.val}
                style={{
                  height: "20px",
                  width: "20px",
                }}
              />
            </ListItemIcon>
            {t("recovery_warning.warn1")}
          </ListItem>
          <ListItem className={classes.listItemRoot}>
            <ListItemIcon className={classes.listItemIconRoot}>
              <WebIcon
                htmlColor={theme.redIcon.val}
                style={{
                  height: "20px",
                  width: "20px",
                }}
              />
            </ListItemIcon>
            {t("recovery_warning.warn2")}
          </ListItem>
          <ListItem className={classes.listItemRoot}>
            <ListItemIcon className={classes.listItemIconRoot}>
              <LockOpenIcon
                htmlColor={theme.redIcon.val}
                style={{ height: "20px", width: "20px" }}
              />
            </ListItemIcon>
            {t("recovery_warning.warn3")}
          </ListItem>
        </List>
      </YStack>
      <YStack flex={0} space="$3">
        <BpPasswordInput
          autoFocus
          value={password}
          onChangeText={(password) => setPassword(password)}
          onSubmitEditing={() => next()}
          hasError={password.length > 0 ? error : undefined}
          placeholder={t("password")}
        />
        <BpDangerButton
          onPress={() => next()}
          label={t("show_phrase")}
          disabled={password.length === 0}
        />
      </YStack>
    </YStack>
  );
}

export function ShowRecoveryPhrase({ mnemonic }: { mnemonic: string }) {
  const { close } = useDrawerContext();
  const mnemonicWords = mnemonic.split(" ");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ margin: "32px 16px 0 16px" }}>
        <HeaderIcon icon={<EyeIcon />} marginBottom={24} />
        <Header text="Recovery phrase" style={{ textAlign: "center" }} />
        <SubtextParagraph style={{ textAlign: "center", fontSize: "14px" }}>
          Use these {mnemonicWords.length} words to recover your wallet
        </SubtextParagraph>
        <MnemonicInputFields
          mnemonicWords={mnemonicWords}
          // rootClass={classes.mnemonicInputRoot}
        />
        <Box sx={{ marginTop: "4px", display: "flex" }}>
          <BpCopyButton text={mnemonic} />
        </Box>
      </Box>
      <YStack padding="$4">
        <BpPrimaryButton label="Close" onPress={close} />
      </YStack>
    </Box>
  );
}
