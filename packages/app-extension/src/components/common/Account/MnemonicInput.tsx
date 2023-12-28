import { useEffect, useState } from "react";
import {
  UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE,
  UI_RPC_METHOD_KEYRING_VALIDATE_MNEMONIC,
} from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { useBackgroundClient } from "@coral-xyz/recoil";
import {
  BpCopyButton,
  BpLinkButton,
  BpPrimaryButton,
  SecondaryButton,
  temporarilyMakeStylesForBrowserExtension,
  useTheme,
  YStack,
} from "@coral-xyz/tamagui";
import {
  Box,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";

import { CheckboxForm, Header, SubtextParagraph } from "../../common";
import { WithCopyTooltip } from "../../common/WithCopyTooltip";
const useStyles = temporarilyMakeStylesForBrowserExtension((theme) => ({
  mnemonicInputRoot: {
    border: `${theme.baseBorderLight.val}`,
    background: theme.baseBackgroundL1.val,
    color: theme.baseTextMedEmphasis.val,
    borderRadius: "8px",
    marginTop: "4px",
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      height: "40px",
      paddingLeft: "8px",
      background: theme.baseBackgroundL1.val,
      "& fieldset": {
        border: "none",
      },
    },
    "& .MuiInputBase-input": {
      color: theme.baseTextHighEmphasis.val,
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: 700,
      paddingRight: "8px",
    },
    "& .MuiInputAdornment-root": {
      color: theme.baseTextMedEmphasis.val,
      fontWeight: 500,
      minWidth: "11px",
      fontSize: "14px",
    },
    "&:hover": {
      opacity: 0.8,
    },
  },
  errorMsg: {
    color: "red",
    marginBottom: "12px",
    textAlign: "center",
  },
}));

export function MnemonicInput({
  onNext,
  readOnly = false,
  buttonLabel,
  customError,
  subtitle,
}: {
  onNext: (mnemonic: string) => Promise<void>;
  readOnly?: boolean;
  buttonLabel: string;
  customError?: string;
  subtitle?: string;
}) {
  const classes = useStyles();
  const background = useBackgroundClient();
  const [mnemonicWords, setMnemonicWords] = useState<string[]>([
    ...Array(12).fill(""),
  ]);
  const [error, setError] = useState<string>();
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const mnemonic = mnemonicWords.map((f) => f.trim()).join(" ");
  // Only enable copy all fields populated
  const copyEnabled = mnemonicWords.find((w) => w.length < 3) === undefined;
  // Only allow next if checkbox is checked in read only and all fields are populated
  const nextEnabled = (!readOnly || checked) && copyEnabled;
  const { t } = useTranslation();
  const invertedMnemonicWordsLength = mnemonicWords.length === 12 ? "24" : "12";

  useEffect(() => {
    if (customError) setError(customError);
  }, [customError]);

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

      // Prevent browser default to mitigate demonic vulnerability.
      e.preventDefault();
      // Populate inputs fields with all words
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
  const next = async () => {
    // ph101pp todo
    const isValid = await background.request({
      method: UI_RPC_METHOD_KEYRING_VALIDATE_MNEMONIC,
      params: [mnemonic],
    });
    if (!isValid) {
      setError("Invalid secret recovery phrase");
    } else {
      await onNext(mnemonic);
    }
  };

  //
  // Generate a random mnemonic and populate state.
  //
  const generateRandom = async () => {
    // ph101pp todo
    const words = await background.request({
      method: UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE,
      params: [mnemonicWords.length === 12 ? 128 : 256],
    });
    setMnemonicWords(words.split(" "));
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
            text={t("secret_recovery_phrase")}
            style={{
              fontWeight: 500,
            }}
          />
          <SubtextParagraph>
            {subtitle
              ? subtitle
              : readOnly
              ? t("only_way_to_recover")
              : t("enter_existing_mnemonic")}
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
              margin: "16px 0",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <BpLinkButton
                label={t("change_mnemonic", {
                  length: invertedMnemonicWordsLength,
                })}
                onPress={() =>
                  setMnemonicWords([
                    ...Array(mnemonicWords.length === 12 ? 24 : 12).fill(""),
                  ])
                }
              />
            </Box>
          </Box>
        )}
      </Box>
      {readOnly ? (
        <YStack>
          <BpCopyButton text={mnemonic} disabled={!copyEnabled} />
          <Box sx={{ margin: "6px" }}>
            <CheckboxForm
              checked={checked}
              setChecked={setChecked}
              label={t("saved_recovery_phrase")}
            />
          </Box>
        </YStack>
      ) : null}
      <YStack marginBottom="$4">
        {error ? (
          <Typography className={classes.errorMsg}>{error}</Typography>
        ) : null}

        <BpPrimaryButton
          label={buttonLabel}
          onPress={async () => {
            setLoading(true);
            await next();
            setLoading(false);
          }}
          disabled={!nextEnabled || loading}
          labelProps={
            {
              // fontWeight: "$bold",
            }
          }
        />
      </YStack>
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
  const theme = useTheme();
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
                backgroundColor: theme.baseBackgroundL1.val,
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
}: {
  text: string;
  icon?: React.ReactElement;
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const { t } = useTranslation();
  const onCopy = async () => {
    setTooltipOpen(true);
    setTimeout(() => setTooltipOpen(false), 1000);
    await navigator.clipboard.writeText(text);
  };
  return (
    <WithCopyTooltip tooltipOpen={tooltipOpen} setToolTipOpen={setTooltipOpen}>
      <Box>
        <SecondaryButton
          onPress={onCopy}
          label={t("copy")}
          disabled={disabled}
          iconAfter={icon ? icon : undefined}
          labelStyle={{
            fontWeight: "$bold",
          }}
        />
      </Box>
    </WithCopyTooltip>
  );
}
