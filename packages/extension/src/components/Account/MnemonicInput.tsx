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
import {
  CheckboxForm,
  Header,
  SubtextParagraph,
  PrimaryButton,
} from "../common";
import { WarningLogo } from "../Icon";
import {
  getBackgroundClient,
  UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE,
} from "@coral-xyz/common";

const useStyles = makeStyles((theme: any) => ({
  mnemonicInputRoot: {
    color: theme.custom.colors.secondary,
    borderRadius: "8px",
    marginTop: "4px",
    "& .MuiOutlinedInput-root": {
      backgroundColor: theme.custom.colors.background,
      borderRadius: "12px",
      "& fieldset": {
        border: "none",
      },
    },
    "& .MuiInputBase-input": {
      color: theme.custom.colors.fontColor,
      backgroundColor: theme.custom.colors.background,
      borderRadius: "8px",
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
  readOnly = false,
}: {
  onNext: (mnemonic: string) => void;
  readOnly?: boolean;
}) {
  const classes = useStyles();

  const [mnemonicWords, setMnemonicWords] = useState<string[]>([
    ...Array(12).fill(""),
  ]);
  const [error, setError] = useState<null | string>(null);
  const [checked, setChecked] = useState(false);

  const mnemonic = mnemonicWords.map((f) => f.trim()).join(" ");
  const nextEnabled =
    (!readOnly || checked) &&
    mnemonicWords.find((w) => w.length < 3) === undefined;

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
    if (!readOnly) {
      // Enable pasting if not readonly
      window.addEventListener("paste", onPaste);
    } else {
      // If read only we can generate a random mnemnic
      generateRandom();
    }
    return () => {
      if (!readOnly) {
        window.removeEventListener("paste", onPaste);
      }
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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ margin: "0 24px" }}>
        <Box>
          <Box sx={{ display: "block", textAlign: "center", mb: "12px" }}>
            <WarningLogo />
          </Box>
          <Header text="Secret recovery phrase" />
          <SubtextParagraph style={{ marginTop: "8px" }}>
            {readOnly
              ? "This is the only way to recover your account if you lose your device. Write it down and store it in a safe place."
              : "Enter your 12 or 24-word secret recovery mnemonic to add an existing wallet."}
          </SubtextParagraph>
        </Box>
        <Grid
          container
          rowSpacing={0}
          columnSpacing={1}
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
                  readOnly,
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
        {readOnly && (
          <CheckboxForm
            checked={checked}
            setChecked={setChecked}
            label="I saved my secret recovery phrase"
          />
        )}
      </Box>
      <Box>
        <Box
          sx={{
            textAlign: "center",
            margin: "27px 0",
          }}
        >
          {readOnly ? null : (
            <>
              <Box sx={{ flex: 1 }}>
                <Link
                  className={classes.link}
                  onClick={() =>
                    setMnemonicWords([
                      ...Array(mnemonicWords.length === 12 ? 24 : 12).fill(""),
                    ])
                  }
                >
                  Use a {mnemonicWords.length === 12 ? "24" : "12"}-word
                  recovery mnemonic
                </Link>
              </Box>
              <Box>
                <Link className={classes.link} onClick={generateRandom}>
                  Use a random mnemonic
                </Link>
              </Box>
            </>
          )}
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
