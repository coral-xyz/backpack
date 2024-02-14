import { type CSSProperties, useEffect, useState } from "react";
import { useTranslation } from "@coral-xyz/i18n";
import {
  BpLinkButton,
  BpPrimaryButton,
  Separator,
  StyledText,
  temporarilyMakeStylesForBrowserExtension,
  useTheme,
  YStack,
} from "@coral-xyz/tamagui";
import { Grid, InputAdornment, TextField } from "@mui/material";
import { generateMnemonic, validateMnemonic } from "bip39";

import { CheckboxForm } from "../../common";

const useStyles = temporarilyMakeStylesForBrowserExtension((theme) => ({
  mnemonicInputRoot: {
    border: theme.baseBorderLight.val,
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
  hideScrollbar: {
    scrollbarWidth: "none",
    "-ms-overflow-style": "none",
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
}));

export function MnemonicInput({
  onNext,
  onPrevious,
  readOnly = false,
  fullscreen = true,
  buttonLabel,
  customError,
  subtitle,
}: {
  onNext: (mnemonic: string) => Promise<void>;
  onPrevious?: () => void;
  readOnly?: boolean;
  buttonLabel: string;
  customError?: string;
  subtitle?: string;
  fullscreen?: boolean;
}) {
  const { t } = useTranslation();
  const classes = useStyles();
  const [error, setError] = useState<string>();
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mnemonicWords, setMnemonicWords] = useState<string[]>([
    ...Array(12).fill(""),
  ]);

  const mnemonic = mnemonicWords.map((f) => f.trim()).join(" ");
  // Only enable copy all fields populated
  const copyEnabled = mnemonicWords.find((w) => w.length < 3) === undefined;
  // Only allow next if checkbox is checked in read only and all fields are populated
  const nextEnabled = (!readOnly || checked) && copyEnabled;
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
    const isValid = validateMnemonic(mnemonic);
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
    const words = generateMnemonic(mnemonicWords.length === 12 ? 128 : 256);
    setMnemonicWords(words.split(" "));
  };

  return (
    <YStack
      f={1}
      gap={20}
      width="100%"
      paddingBottom={fullscreen ? undefined : 20}
      paddingHorizontal={fullscreen ? undefined : 16}
    >
      <YStack gap={16}>
        <StyledText
          fontSize={fullscreen ? 36 : 28}
          fontWeight="$semiBold"
          textAlign="center"
        >
          {t("secret_recovery_phrase")}
        </StyledText>
        <StyledText color="$baseTextMedEmphasis" textAlign="center">
          {subtitle
            ? subtitle
            : readOnly
              ? t("save_words")
              : t("enter_existing_mnemonic")}
        </StyledText>
        {!readOnly || fullscreen ? (
          <BpLinkButton
            label={
              readOnly
                ? t("read_warnings_again")
                : t("change_mnemonic", {
                    length: invertedMnemonicWordsLength,
                  })
            }
            labelProps={{ color: "$accentBlue" }}
            onPress={
              readOnly
                ? onPrevious
                : () =>
                    setMnemonicWords([
                      ...Array(mnemonicWords.length === 12 ? 24 : 12).fill(""),
                    ])
            }
          />
        ) : null}
      </YStack>
      <YStack className={classes.hideScrollbar} overflow="scroll">
        {readOnly ? (
          <_ReadonlyMnemonicTable mnemonicWords={mnemonicWords} />
        ) : (
          <MnemonicInputFields
            style={{ maxHeight: 290 }}
            mnemonicWords={mnemonicWords}
            onChange={setMnemonicWords}
          />
        )}
        {error ? (
          <StyledText color="$redText" textAlign="center">
            {error}
          </StyledText>
        ) : null}
      </YStack>
      {readOnly ? (
        <YStack gap={4}>
          <CheckboxForm
            checked={checked}
            setChecked={setChecked}
            label={t("saved_recovery_phrase")}
          />
        </YStack>
      ) : null}
      <YStack f={1} justifyContent="flex-end">
        <BpPrimaryButton
          maxHeight={45.5}
          maxWidth={420}
          disabled={!nextEnabled || loading}
          label={buttonLabel}
          onPress={async () => {
            setLoading(true);
            await next();
            setLoading(false);
          }}
        />
      </YStack>
    </YStack>
  );
}

function _ReadonlyMnemonicTable({
  mnemonicWords,
}: {
  mnemonicWords: string[];
}) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 5_000);
    await navigator.clipboard.writeText(
      mnemonicWords.map((w) => w.trim()).join(" ")
    );
  };

  return (
    <YStack
      backgroundColor="$baseBackgroundL1"
      borderRadius={12}
      cursor="pointer"
      gap={6}
      hoverStyle={{ opacity: copied ? 0.7 : 0.8 }} // Prioritize opacity change from temporary copied state
      opacity={copied ? 0.7 : 1}
      onPress={copy}
      padding={8}
      pointerEvents="box-only"
      overflow="hidden"
    >
      <MnemonicInputFields
        mnemonicWords={mnemonicWords}
        style={{ alignSelf: "flex-end", width: "100%" }}
      />
      <Separator borderColor="$baseDivider" />
      <StyledText color="$baseTextMedEmphasis" fontSize={13} textAlign="center">
        {copied ? t("copied") : t("click_to_copy")}
      </StyledText>
    </YStack>
  );
}

export function MnemonicInputFields({
  mnemonicWords,
  onChange,
  rootClass,
  style,
}: {
  mnemonicWords: Array<string>;
  onChange?: (mnemonicWords: Array<string>) => void;
  rootClass?: any;
  style?: CSSProperties;
}) {
  const theme = useTheme();
  const classes = useStyles();
  if (!rootClass) {
    rootClass = classes.mnemonicInputRoot;
  }
  return (
    <Grid container rowSpacing={0} columnSpacing={1.00005} style={style}>
      {Array.from(Array(mnemonicWords.length).keys()).map((i) => {
        return (
          <Grid item xs={4} key={i}>
            <TextField
              autoComplete="off"
              className={rootClass}
              role="presentation"
              autoCorrect="off"
              variant="outlined"
              margin="dense"
              size="small"
              required
              fullWidth
              type={undefined}
              InputLabelProps={{
                shrink: false,
                style: {
                  backgroundColor: theme.baseBackgroundL1.val,
                },
              }}
              inputRef={(ref) => {
                ref?.removeAttribute("type");
              }}
              InputProps={{
                type: undefined,
                id: undefined,
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
        );
      })}
    </Grid>
  );
}
