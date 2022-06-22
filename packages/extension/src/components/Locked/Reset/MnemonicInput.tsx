import { useState, useEffect } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { useEphemeralNav } from "@coral-xyz/recoil";
import {
  Box,
  Button,
  Grid,
  TextField,
  InputAdornment,
  Link,
} from "@mui/material";
import { Header, SubtextParagraph } from "../../common";
import { WarningLogo } from "./ResetWarning";
import { ImportAccounts } from "./ImportAccounts";
import {
  getBackgroundClient,
  UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE,
} from "@coral-xyz/common";

const useStyles = makeStyles((theme: any) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    color: theme.custom.colors.nav,
  },
  icon: {
    display: "block",
    margin: "0 auto 24px auto",
  },
  mnemonicInputRoot: {
    color: theme.custom.colors.secondary,
    borderRadius: "12px",
    marginTop: "4px",
    "& .MuiOutlinedInput-root": {
      border: `solid 1pt ${theme.custom.colors.border}`,
      backgroundColor: theme.custom.colors.background,
      borderRadius: "12px",
      "& fieldset": {
        border: "none",
      },
    },
    "& .MuiInputBase-input": {
      color: theme.custom.colors.fontColor,
      backgroundColor: theme.custom.colors.background,
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: 700,
    },
    "& .MuiInputAdornment-root": {
      color: theme.custom.colors.secondary,
      fontWeight: 500,
    },
    "&:hover": {
      backgroundColor: theme.custom.colors.primary,
    },
  },
  link: {
    color: theme.custom.colors.secondary,
    textDecoration: "none",
  },
}));

export function MnemonicInput({ closeDrawer }: { closeDrawer: () => void }) {
  const classes = useStyles();
  const nav = useEphemeralNav();
  const [mnemonicWordCount, setMnemonicWordCount] = useState(12);
  const [mnemonicWords, setMnemonicWords] = useState<string[]>([
    ...Array(mnemonicWordCount).fill(""),
  ]);

  useEffect(() => {
    // Clear all inputs on change of mnemonic size. This is probably the cleanest way to handle
    // all 24 inputs being full and the user switching to a 12 word mnemonic.
    setMnemonicWords([...Array(mnemonicWordCount).fill("")]);
  }, [mnemonicWordCount]);

  const nextEnabled =
    mnemonicWords.length === mnemonicWordCount &&
    mnemonicWords.find((w) => w === undefined || w.length < 3) === undefined;

  const next = () => {
    // TODO validate mnemonic
    nav.push(
      <ImportAccounts
        mnemonic={mnemonicWords.map((f) => f.trim()).join(" ")}
        closeDrawer={closeDrawer}
      />
    );
  };

  const generateRandom = () => {
    const background = getBackgroundClient();
    background
      .request({
        method: UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE,
        params: [mnemonicWordCount === 12 ? 128 : 256],
      })
      .then((m: string) => {
        const words = m.split(" ");
        setMnemonicWords(words);
        setMnemonicWordCount(words.length);
      });
  };

  return (
    <Box className={classes.root}>
      <Box>
        <WarningLogo className={classes.icon} />
        <Header text="Secret recovery mnemonic" />
        <SubtextParagraph>
          Enter your 12 or 24-word secret recovery mnemonic to add an existing
          wallet.
        </SubtextParagraph>
      </Box>
      <Grid container rowSpacing={0} columnSpacing={0.5}>
        {Array.from(Array(mnemonicWordCount).keys()).map((i) => (
          <Grid item xs={4} key={i}>
            <TextField
              className={classes.mnemonicInputRoot}
              variant="outlined"
              margin="dense"
              size="small"
              required
              fullWidth
              InputLabelProps={{
                shrink: false,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">{i + 1}</InputAdornment>
                ),
              }}
              value={mnemonicWords[i]}
              onChange={(e) => {
                const newMnemonicWords = [...mnemonicWords];
                newMnemonicWords[i] = e.target.value;
                setMnemonicWords(newMnemonicWords);
              }}
            />
          </Grid>
        ))}
      </Grid>
      <Box style={{ textAlign: "center", margin: "24px 0" }}>
        <Box>
          <Link
            className={classes.link}
            onClick={() =>
              setMnemonicWordCount(mnemonicWordCount === 12 ? 24 : 12)
            }
          >
            Use a {mnemonicWordCount === 12 ? "24" : "12"}-word recovery
            mnemonic
          </Link>
        </Box>
        <Box>
          <Link className={classes.link} onClick={generateRandom}>
            Use a random mnemonic
          </Link>
        </Box>
      </Box>
      <Button onClick={next} disabled={!nextEnabled}>
        Import
      </Button>
    </Box>
  );
}
