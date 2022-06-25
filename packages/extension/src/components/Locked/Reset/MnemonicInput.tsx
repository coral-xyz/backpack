import { useState, useEffect } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { useEphemeralNav } from "@coral-xyz/recoil";
import {
  Box,
  Grid,
  TextField,
  Typography,
  InputAdornment,
  Link,
} from "@mui/material";
import { Header, SubtextParagraph, PrimaryButton } from "../../common";
import { WarningLogo } from "./ResetWarning";
import { ImportAccounts } from "./ImportAccounts";
import {
  getBackgroundClient,
  DerivationPath,
  UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE,
  UI_RPC_METHOD_PREVIEW_PUBKEYS,
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
    margin: "8 auto 24px auto",
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
    cursor: "pointer",
    color: theme.custom.colors.secondary,
    textDecoration: "none",
  },
  errorMsg: {
    color: "red",
    marginBottom: "12px",
  },
}));

export function MnemonicInput({ closeDrawer }: { closeDrawer: () => void }) {
  const classes = useStyles();
  const nav = useEphemeralNav();
  const [mnemonicWords, setMnemonicWords] = useState<string[]>([
    ...Array(12).fill(""),
  ]);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    const onPaste = (e: any) => {
      const words = e.clipboardData.getData("text").split(" ");
      if (words.length !== 12 && words.length !== 24) {
        // Not a valid mnemonic length
        return;
      }
      setMnemonicWords(words);
    };
    window.addEventListener("paste", onPaste);
    return () => {
      window.removeEventListener("paste", onPaste);
    };
  }, []);

  const nextEnabled = mnemonicWords.find((w) => w.length < 3) === undefined;

  const next = () => {
    const mnemonic = mnemonicWords.map((f) => f.trim()).join(" ");
    loadPublicKeys(mnemonic)
      .then((publicKeys) => {
        nav.push(
          <ImportAccounts
            mnemonic={mnemonic}
            publicKeys={publicKeys}
            closeDrawer={closeDrawer}
          />
        );
      })
      .catch(() => {
        setError("Invalid mnemonic");
      });
  };

  const loadPublicKeys = async (mnemonic: string) => {
    const derivationPath = DerivationPath.Bip44Change;
    const background = getBackgroundClient();
    return await background.request({
      method: UI_RPC_METHOD_PREVIEW_PUBKEYS,
      params: [mnemonic, derivationPath, 8],
    });
  };

  const generateRandom = () => {
    const background = getBackgroundClient();
    background
      .request({
        method: UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE,
        params: [mnemonicWords.length === 12 ? 128 : 256],
      })
      .then((m: string) => {
        const words = m.split(" ");
        setMnemonicWords(words);
      });
  };

  return (
    <Box className={classes.root}>
      <Box
        sx={{
          marginTop: "16px",
          marginLeft: "24px",
          marginRight: "24px",
        }}
      >
        <Box>
          <WarningLogo className={classes.icon} />
          <Header text="Secret recovery phrase" />
          <SubtextParagraph style={{ marginTop: "8px" }}>
            Enter your 12 or 24-word secret recovery mnemonic to add an existing
            wallet.
          </SubtextParagraph>
        </Box>
        <Grid
          container
          rowSpacing={0}
          columnSpacing={0.5}
          sx={{ marginTop: "32px" }}
        >
          {Array.from(Array(mnemonicWords.length).keys()).map((i) => (
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
      </Box>
      <Box>
        <Box
          sx={{
            textAlign: "center",
            marginTop: "27px",
            marginBottom: "27px",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Link
              className={classes.link}
              onClick={() =>
                setMnemonicWords([
                  ...Array(mnemonicWords.length === 12 ? 24 : 12).fill(""),
                ])
              }
            >
              Use a {mnemonicWords.length === 12 ? "24" : "12"}-word recovery
              mnemonic
            </Link>
          </Box>
          <Box>
            <Link className={classes.link} onClick={generateRandom}>
              Use a random mnemonic
            </Link>
          </Box>
        </Box>
        {error && <Typography className={classes.errorMsg}>{error}</Typography>}
        <Box
          sx={{
            marginLeft: "16px",
            marginRight: "16px",
            marginBottom: "16px",
          }}
        >
          <PrimaryButton
            label="Import"
            onClick={next}
            disabled={!nextEnabled}
          />
        </Box>
      </Box>
    </Box>
  );
}
