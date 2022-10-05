import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  InputAdornment,
  Link,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import makeStyles from "@mui/styles/makeStyles";
import {
  UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE,
  UI_RPC_METHOD_KEYRING_VALIDATE_MNEMONIC,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import {
  CheckboxForm,
  Header,
  SubtextParagraph,
  PrimaryButton,
  SecondaryButton,
} from "../../common";
import { WithCopyTooltip } from "../../common/WithCopyTooltip";

const useStyles = makeStyles((theme: any) => ({
  mnemonicInputRoot: {
    border: `${theme.custom.colors.borderFull}`,
    background: theme.custom.colors.textBackground,
    color: theme.custom.colors.secondary,
    borderRadius: "8px",
    marginTop: "4px",
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      height: "40px",
      paddingLeft: "8px",
      "& fieldset": {
        border: "none",
      },
    },
    "& .MuiInputBase-input": {
      color: theme.custom.colors.fontColor,
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: 700,
      paddingRight: "8px",
    },
    "& .MuiInputAdornment-root": {
      color: theme.custom.colors.secondary,
      fontWeight: 500,
      minWidth: "12px",
      fontSize: "14px",
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
  buttonLabel,
}: {
  onNext: (mnemonic: string) => void;
  readOnly?: boolean;
  buttonLabel: string;
}) {
  const theme = useCustomTheme();
  const classes = useStyles();
  const background = useBackgroundClient();
  const [mnemonicWords, setMnemonicWords] = useState<string[]>([
    ...Array(12).fill(""),
  ]);
  const [error, setError] = useState<null | string>(null);
  const [checked, setChecked] = useState(false);

  const mnemonic = mnemonicWords.map((f) => f.trim()).join(" ");
  // Only enable copy all fields populated
  const copyEnabled = mnemonicWords.find((w) => w.length < 3) === undefined;
  // Only allow next if checkbox is checked in read only and all fields are populated
  const nextEnabled = (!readOnly || checked) && copyEnabled;

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
    background
      .request({
        method: UI_RPC_METHOD_KEYRING_VALIDATE_MNEMONIC,
        params: [mnemonic],
      })
      .then((isValid: boolean) => {
        return isValid
          ? onNext(mnemonic)
          : setError("Invalid secret recovery phrase");
      });
  };

  //
  // Generate a random mnemonic and populate state.
  //
  const generateRandom = () => {
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
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        padding: "0 16px 0 16px",
      }}
    >
      <Box>
        <Box style={{ margin: 8 }}>
          <Header
            text="Secret recovery phrase"
            style={{
              fontWeight: 500,
            }}
          />
          <SubtextParagraph>
            {readOnly
              ? "This is the only way to recover your account if you lose your device. Write it down and store it in a safe place."
              : "Enter your 12 or 24-word secret recovery mnemonic to add an existing wallet."}
          </SubtextParagraph>
        </Box>
        <MnemonicInputFields
          mnemonicWords={mnemonicWords}
          onChange={readOnly ? undefined : setMnemonicWords}
        />
        {readOnly ? null : (
          <Box
            sx={{
              textAlign: "center",
              margin: "32px 0",
            }}
          >
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
            </>
          </Box>
        )}
      </Box>
      {readOnly && (
        <>
          <CopyButton
            text={mnemonic}
            icon={
              <ContentCopyIcon
                style={{ color: theme.custom.colors.fontColor }}
              />
            }
            disabled={!copyEnabled}
          />
          <Box sx={{ margin: "12px" }}>
            <CheckboxForm
              checked={checked}
              setChecked={setChecked}
              label="I saved my secret recovery phrase"
            />
          </Box>
        </>
      )}
      <Box>
        {error && <Typography className={classes.errorMsg}>{error}</Typography>}

        <PrimaryButton
          label={buttonLabel}
          onClick={next}
          disabled={!nextEnabled}
          buttonLabelStyle={{
            fontWeight: 600,
          }}
          style={{ marginBottom: 16 }}
        />
      </Box>
    </Box>
  );
}

export function MnemonicInputFields({
  mnemonicWords,
  onChange,
  rootClass,
}: {
  mnemonicWords: Array<string>;
  onChange?: (mnemonicWords: Array<string>) => void;
  rootClass?: any;
}) {
  const theme = useCustomTheme();
  const classes = useStyles();
  if (!rootClass) {
    rootClass = classes.mnemonicInputRoot;
  }
  return (
    <Grid
      container
      rowSpacing={0}
      columnSpacing={1.00005}
      sx={{ marginTop: "24px" }}
    >
      {Array.from(Array(mnemonicWords.length).keys()).map((i) => (
        <Grid item xs={4} key={i}>
          <TextField
            className={rootClass}
            variant="outlined"
            margin="dense"
            size="small"
            required
            fullWidth
            InputLabelProps={{
              shrink: false,
              style: {
                backgroundColor: theme.custom.colors.nav,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">{i + 1}</InputAdornment>
              ),
              readOnly: onChange === undefined,
            }}
            value={mnemonicWords[i]}
            onChange={(e) => {
              if (onChange) {
                const newMnemonicWords = [...mnemonicWords];
                newMnemonicWords[i] = e.target.value;
                onChange(newMnemonicWords);
              }
            }}
          />
        </Grid>
      ))}
    </Grid>
  );
}

export function CopyButton({
  text,
  icon,
  disabled = false,
  style,
}: {
  text: string;
  icon?: React.ReactElement;
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const onCopy = () => {
    setTooltipOpen(true);
    setTimeout(() => setTooltipOpen(false), 1000);
    navigator.clipboard.writeText(text);
  };
  return (
    <WithCopyTooltip tooltipOpen={tooltipOpen} setToolTipOpen={setTooltipOpen}>
      <Box>
        <SecondaryButton
          onClick={onCopy}
          label="Copy"
          disabled={disabled}
          endIcon={icon ? icon : null}
          buttonLabelStyle={{
            fontWeight: 600,
          }}
          style={style}
        />
      </Box>
    </WithCopyTooltip>
  );
}
