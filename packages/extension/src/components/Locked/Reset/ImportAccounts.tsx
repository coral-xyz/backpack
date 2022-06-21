import { useEffect, useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { useEphemeralNav } from "@coral-xyz/recoil";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Checkbox,
} from "@mui/material";
import {
  Header,
  SubtextParagraph,
  PrimaryButton,
  walletAddressDisplay,
} from "../../common";
import {
  getBackgroundClient,
  DerivationPath,
  UI_RPC_METHOD_PREVIEW_PUBKEYS,
} from "@coral-xyz/common";
import { CreatePassword } from "./CreatePassword";

const useStyles = makeStyles((theme: any) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    justifyContent: "space-between",
    color: theme.custom.colors.nav,
  },
  accountList: {
    color: theme.custom.colors.fontColor,
    background: theme.custom.colors.background,
    borderRadius: "12px",
  },
  balance: {
    color: theme.custom.colors.secondary,
    textAlign: "right",
  },
}));

export function ImportAccounts({
  mnemonic,
  closeDrawer,
}: {
  mnemonic: string;
  closeDrawer: () => void;
}) {
  const classes = useStyles();
  const nav = useEphemeralNav();
  const [publicKeys, setPublicKeys] = useState([]);
  const [accountIndices, setAccountIndices] = useState<number[]>([]);

  const next = () => {
    nav.push(
      <CreatePassword
        mnemonic={mnemonic}
        accountIndices={accountIndices}
        closeDrawer={closeDrawer}
      />
    );
  };

  const handleSelect = (index: number) => () => {
    const currentIndex = accountIndices.indexOf(index);
    const newAccountIndices = [...accountIndices];
    if (currentIndex === -1) {
      newAccountIndices.push(index);
    } else {
      newAccountIndices.splice(currentIndex, 1);
    }
    setAccountIndices(newAccountIndices);
  };

  useEffect(() => {
    const loadPublicKeys = async () => {
      const derivationPath = DerivationPath.Bip44Change;
      const background = getBackgroundClient();
      const publicKeys = await background.request({
        method: UI_RPC_METHOD_PREVIEW_PUBKEYS,
        params: [mnemonic, derivationPath, 10],
      });
      /*
      TODO: query balances
      await Promise.all(publicKeys.map(async (publicKey) => {
        const balance = await background.request({})
      }));
      */
      setPublicKeys(publicKeys);
    };
    loadPublicKeys();
  }, []);

  return (
    <Box className={classes.root}>
      <Box>
        <Header text="Import Accounts" />
        <SubtextParagraph>
          Select which accounts you'd like to import.
        </SubtextParagraph>
        <List className={classes.accountList}>
          {publicKeys.map((publicKey, index) => (
            <ListItem key={publicKey} disablePadding>
              <ListItemButton
                role={undefined}
                onClick={handleSelect(index)}
                dense
              >
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={accountIndices.indexOf(index) !== -1}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText
                  id={publicKey}
                  primary={walletAddressDisplay(publicKey)}
                />
                <ListItemText className={classes.balance} primary="0 SOL" />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box>
        <PrimaryButton label="Import Accounts" onClick={next} />
      </Box>
    </Box>
  );
}
