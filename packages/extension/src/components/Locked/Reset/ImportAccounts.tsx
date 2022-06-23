import type { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { useEphemeralNav } from "@coral-xyz/recoil";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  Checkbox,
  Header,
  SubtextParagraph,
  PrimaryButton,
  walletAddressDisplay,
} from "../../common";
import { CreatePassword } from "./CreatePassword";

export function ImportAccounts({
  mnemonic,
  publicKeys,
  closeDrawer,
}: {
  mnemonic: string;
  publicKeys: PublicKey[];
  closeDrawer: () => void;
}) {
  const theme = useCustomTheme();
  const nav = useEphemeralNav();
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
    newAccountIndices.sort();
    setAccountIndices(newAccountIndices);
  };

  useEffect(() => {
    /*
      TODO: query balances
      await Promise.all(publicKeys.map(async (publicKey) => {
        const balance = await background.request({})
      }));
      */
  }, []);

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
        <Header text="Import Accounts" />
        <SubtextParagraph>
          Select which accounts you'd like to import.
        </SubtextParagraph>
        <List
          sx={{
            color: theme.custom.colors.fontColor,
            background: theme.custom.colors.background,
            borderRadius: "12px",
          }}
        >
          {publicKeys.map((publicKey, index) => (
            <ListItem key={publicKey.toString()} disablePadding>
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
                  id={publicKey.toString()}
                  primary={walletAddressDisplay(publicKey)}
                />
                <ListItemText
                  sx={{
                    color: theme.custom.colors.secondary,
                    textAlign: "right",
                  }}
                  primary="0 SOL"
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box>
        <PrimaryButton
          label="Import Accounts"
          onClick={next}
          disabled={accountIndices.length === 0}
        />
      </Box>
    </Box>
  );
}
