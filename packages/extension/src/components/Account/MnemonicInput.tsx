import { validateMnemonic } from "bip39";
import { useState, useEffect } from "react";
import makeStyles from "@mui/styles/makeStyles";
import {
  Box,
  Grid,
  TextField,
  Typography,
  InputAdornment,
  Link,
} from "@mui/material";
import { Header, SubtextParagraph, PrimaryButton } from "../common";
import { WarningLogo } from "../Icon";
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

export function MnemonicInput({
  onNext,
}: {
  onNext: (mnemonic: string) => void;
}) {
  const classes = useStyles();
  const [mnemonicWords, setMnemonicWords] = useState<string[]>([
    ...Array(12).fill(""),
  ]);
  const [error, setError] = useState<null | string>(null);
  const mnemonic = mnemonicWords.map((f) => f.trim()).join(" ");
  const nextEnabled = mnemonicWords.find((w) => w.length < 3) === undefined;

  //
  // Handle pastes of 12 or 24 word mnemonics.
  //
  useEffect(() => {
    const onPaste = (e: any) => {
      const words = e.clipboardData.getData("text").split(" ");
      if (words.length !== 12 && words.length !== 24) {
        // Not a valid mnemonic length
        return;
      }
      // Prevent the paste from populating an individual input field with
      // all words
      e.preventDefault();
      setMnemonicWords(words);
    };
    window.addEventListener("paste", onPaste);
    return () => {
      window.removeEventListener("paste", onPaste);
    };
  }, []);

  //
  // Validate the mnemonic and call the onNext handler.
  //
  const next = () => {
    if (!validateMnemonic(mnemonic)) {
      setError("Invalid secret recovery phrase");
      return;
    }
    onNext(mnemonic);
  };

  //
  // Generate a random mnemonic and populate state.
  //
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
          <WarningLogo />
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
        <Box
          sx={{
            marginLeft: "16px",
            marginRight: "16px",
            marginBottom: "16px",
          }}
        >
          {error && (
            <Typography className={classes.errorMsg}>{error}</Typography>
          )}
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
