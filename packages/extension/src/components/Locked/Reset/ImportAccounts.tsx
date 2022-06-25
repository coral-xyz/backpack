import type { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { useCustomTheme } from "@coral-xyz/themes";
import { useEphemeralNav } from "@coral-xyz/recoil";
import { Box, List, ListItemButton, ListItemText } from "@mui/material";
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
        <Box
          sx={{
            marginLeft: "24px",
            marginRight: "24px",
            marginTop: "24px",
          }}
        >
          <Header text="Import Accounts" />
          <SubtextParagraph style={{ marginTop: "8px" }}>
            Select which accounts you'd like to import.
          </SubtextParagraph>
        </Box>
        <List
          sx={{
            color: theme.custom.colors.fontColor,
            background: theme.custom.colors.background,
            borderRadius: "12px",
            marginLeft: "16px",
            marginRight: "16px",
            paddingTop: "8px",
            paddingBottom: "8px",
          }}
        >
          {publicKeys.map((publicKey, index) => (
            <ListItemButton
              key={publicKey.toString()}
              onClick={handleSelect(index)}
              sx={{
                display: "flex",
                paddinLeft: "16px",
                paddingRight: "16px",
                paddingTop: "5px",
                paddingBottom: "5px",
              }}
            >
              <Box style={{ display: "flex", width: "100%" }}>
                <Checkbox
                  edge="start"
                  checked={accountIndices.indexOf(index) !== -1}
                  tabIndex={-1}
                  disableRipple
                  style={{ marginLeft: 0 }}
                />
                <ListItemText
                  id={publicKey.toString()}
                  primary={walletAddressDisplay(publicKey)}
                  sx={{
                    marginLeft: "8px",
                    fontSize: "14px",
                    lineHeight: "32px",
                    fontWeight: 500,
                  }}
                />
                <ListItemText
                  sx={{
                    color: theme.custom.colors.secondary,
                    textAlign: "right",
                  }}
                  primary="0 SOL"
                />
              </Box>
            </ListItemButton>
          ))}
        </List>
      </Box>
      <Box
        sx={{
          mt: "12px",
          ml: "16px",
          mr: "16px",
          mb: "16px",
        }}
      >
        <PrimaryButton
          label="Import Accounts"
          onClick={next}
          disabled={accountIndices.length === 0}
        />
      </Box>
    </Box>
  );
}
