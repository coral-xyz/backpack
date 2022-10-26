export function MnemonicInput({
  onNext,
  readOnly = false,
  buttonLabel,
  customError,
}: {
  onNext: (mnemonic: string) => void;
  readOnly?: boolean;
  buttonLabel: string;
  customError?: string;
}) {
  const theme = useCustomTheme();
  const classes = useStyles();
  const background = useBackgroundClient();
  const [mnemonicWords, setMnemonicWords] = useState<string[]>([
    ...Array(12).fill(""),
  ]);
  const [error, setError] = useState<string>();
  const [checked, setChecked] = useState(false);

  const mnemonic = mnemonicWords.map((f) => f.trim()).join(" ");
  // Only enable copy all fields populated
  const copyEnabled = mnemonicWords.find((w) => w.length < 3) === undefined;
  // Only allow next if checkbox is checked in read only and all fields are populated
  const nextEnabled = (!readOnly || checked) && copyEnabled;

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
