import React, { useState, useMemo } from "react";
import { MobileStepper, Button, Checkbox, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { MenuBook } from "@mui/icons-material";
import {
  getBackgroundClient,
  BrowserRuntime,
  DerivationPath,
  UI_RPC_METHOD_KEYRING_STORE_CREATE,
} from "@200ms/common";
import { TextField, OnboardButton } from "../common";
import { HdKeyring, SolanaHdKeyringFactory } from "../../keyring";
import { _NavBackButton, DummyButton } from "../Layout/Nav";

const useStyles = makeStyles((theme: any) => ({
  stepper: {
    backgroundColor: theme.custom.colors.nav,
    borderBottom: `solid 1pt ${theme.custom.colors.border}`,
    paddingTop: "10px",
    paddingBottom: "10px",
    paddingLeft: "12px",
    paddingRight: "12px",
    position: "relative",
    height: "100%",
  },
  stepperDot: {
    background: theme.custom.colors.interactiveIconsHover,
  },
  stepperDotActive: {
    background: theme.custom.colors.tabIconSelected,
  },
  buttonRoot: {
    minWidth: "5px",
  },
  withContinueContainer: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    color: theme.custom.colors.fontColor,
    padding: "20px",
    position: "relative",
    height: "100%",
  },
  termsContainer: {
    display: "flex",
    marginTop: "8px",
  },
  checkBox: {
    padding: 0,
    color: theme.custom.colors.onboardButton,
  },
  checkBoxChecked: {
    color: `${theme.custom.colors.onboardButton} !important`,
  },
  subtext: {
    color: theme.custom.colors.secondary,
    fontSize: "12px",
    lineHeight: "20px",
    fontWeight: 500,
  },
  continueButtonContainer: {},
  errorMsg: {
    color: "red",
    textAlign: "left",
    marginTop: "8px",
  },
  mnemonicDisplayContainer: {
    backgroundColor: theme.custom.colors.nav,
    borderRadius: "12px",
    marginBottom: "16px",
  },
  passwordHeader: {
    fontSize: "20px",
    lineHeight: "24px",
    fontWeight: 500,
    color: theme.custom.colors.fontColor,
    marginBottom: "8px",
  },
  passwordSubheader: {
    fontWeight: 500,
    fontSize: "14px",
    lineHieght: "20px",
    color: theme.custom.colors.secondary,
  },
  passwordFieldRoot: {
    margin: 0,
    width: "100%",
    marginBottom: "16px",
  },
  menuIcon: {
    color: theme.custom.colors.tabIconSelected,
    width: "26px",
    height: "26px",
    marginBottom: "8px",
  },
  mnemonicDisplayText: {
    color: theme.custom.colors.fontColor,
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "20px",
    padding: "16px",
  },
  mnemonicCopyButton: {
    padding: 0,
    borderTop: `solid 1pt ${theme.custom.colors.border}`,
    width: "100%",
    height: "36px",
  },
  mnemonicCopyButtonText: {
    textTransform: "none",
    color: theme.custom.colors.activeNavButton,
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "24px",
  },
}));

const STEP_COUNT = 3;

export function CreateNewWallet() {
  const [activeStep, setActiveState] = useState(0);
  const hdKeyring = useMemo(() => {
    const factory = new SolanaHdKeyringFactory();
    return factory.generate();
  }, []);
  const [password, setPassword] = useState("");
  const derivationPath = DerivationPath.Bip44Change;
  const handleNext = () => {
    setActiveState(activeStep + 1);
  };
  const handleBack = () => {
    setActiveState(activeStep - 1);
  };
  const handleDone = () => {
    const background = getBackgroundClient();
    background
      .request({
        method: UI_RPC_METHOD_KEYRING_STORE_CREATE,
        params: [hdKeyring.mnemonic, derivationPath, password],
      })
      .catch(console.error)
      .then((_) => BrowserRuntime.closeActiveTab());
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div style={{ height: "56px" }}>
        <Stepper
          activeStep={activeStep}
          handleBack={handleBack}
          stepCount={STEP_COUNT}
        />
      </div>
      <div
        style={{
          flex: 1,
        }}
      >
        {activeStep === 0 && (
          <CreatePassword
            next={(pw) => {
              setPassword(pw);
              handleNext();
            }}
          />
        )}
        {activeStep === 1 && (
          <ShowMnemonic keyring={hdKeyring} next={handleNext} />
        )}
        {activeStep === 2 && <Done done={handleDone} />}
      </div>
    </div>
  );
}

export function CreatePassword({ next }: { next: (password: string) => void }) {
  const classes = useStyles();
  const [checked, setChecked] = useState(true);
  const [password, setPassword] = useState("");
  const [passwordDup, setPasswordDup] = useState("");
  const [error, setError] = useState<null | string>(null);
  const canContinue = checked && password !== "";
  const clickContinue = () => {
    if (password.length < 8) {
      setError("Password must be longer than 8 characters");
      return;
    } else if (password !== passwordDup) {
      setError(`Passwords don't match`);
      return;
    }
    next(password);
  };
  return (
    <WithContinue next={clickContinue} canContinue={canContinue}>
      <OnboardHeader
        text={"Create a password"}
        subtext={"You will use this to unlock your wallet"}
      />
      <div>
        <TextField
          inputProps={{ name: "password" }}
          placeholder="Enter your password..."
          type="password"
          value={password}
          setValue={setPassword}
          rootClass={classes.passwordFieldRoot}
        />
        <TextField
          inputProps={{ name: "password-confirmation" }}
          placeholder="Confirm your password..."
          type="password"
          value={passwordDup}
          setValue={setPasswordDup}
          rootClass={classes.passwordFieldRoot}
        />
      </div>
      {error && <Typography className={classes.errorMsg}>{error}</Typography>}
      <CheckboxForm
        checked={checked}
        setChecked={setChecked}
        label={"I agree to the terms of service"}
      />
    </WithContinue>
  );
}

export function OnboardHeader({ text, subtext }: any) {
  const classes = useStyles();
  return (
    <div style={{ marginBottom: "42px" }}>
      <Symbol />
      <Typography className={classes.passwordHeader}>{text}</Typography>
      <Typography className={classes.passwordSubheader}>{subtext}</Typography>
    </div>
  );
}

function CheckboxForm({ checked, setChecked, label }: any) {
  const classes = useStyles();
  return (
    <div className={classes.termsContainer}>
      <Checkbox
        className={classes.checkBox}
        checked={checked}
        onChange={() => setChecked(!checked)}
        classes={{
          checked: classes.checkBoxChecked,
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          marginLeft: "10px",
        }}
      >
        <Typography className={classes.subtext}>{label}</Typography>
      </div>
    </div>
  );
}

function ShowMnemonic({
  next,
  keyring,
}: {
  next: () => void;
  keyring: HdKeyring;
}) {
  const [checked, setChecked] = useState(true);
  const canContinue = checked;
  return (
    <WithContinue next={next} canContinue={canContinue}>
      <OnboardHeader
        text={"Secret Recovery Phrase"}
        subtext={
          "This phrase is the ONLY way to recover your wallet. Do not share it with anyone!"
        }
      />
      <MnemonicDisplay keyring={keyring} />
      <CheckboxForm
        checked={checked}
        setChecked={setChecked}
        label={"I saved my Secret Recovery Phrase"}
      />
    </WithContinue>
  );
}

function MnemonicDisplay({ keyring }: { keyring: HdKeyring }) {
  const classes = useStyles();
  const onClick = () => {
    navigator.clipboard.writeText(keyring.mnemonic);
  };
  return (
    <div className={classes.mnemonicDisplayContainer}>
      <Typography className={classes.mnemonicDisplayText}>
        {keyring.mnemonic}
      </Typography>
      <Button onClick={onClick} className={classes.mnemonicCopyButton}>
        <Typography className={classes.mnemonicCopyButtonText}>Copy</Typography>
      </Button>
    </div>
  );
}

export function Shortcut({ next }: { next: () => void }) {
  return (
    <WithContinue next={next} canContinue={true}>
      Shortcut here
    </WithContinue>
  );
}

export function Done({ done }: { done: () => void }) {
  return (
    <WithContinue next={() => done()} canContinue={true} buttonLabel={"Finish"}>
      <OnboardHeader
        text={`You're all done!`}
        subtext={"Click finish to complete onboarding"}
      />
    </WithContinue>
  );
}

export function WithContinue({ buttonLabel = "Continue", ...props }: any) {
  const classes = useStyles();
  return (
    <form
      className={classes.withContinueContainer}
      onSubmit={(e) => {
        e.preventDefault();
        props.next();
      }}
    >
      <div
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {props.children}
      </div>
      <div className={classes.continueButtonContainer}>
        <OnboardButton type="submit" label={buttonLabel} />
      </div>
    </form>
  );
}

export function Stepper({ activeStep, handleBack, stepCount }: any) {
  const classes = useStyles();
  return (
    <MobileStepper
      className={classes.stepper}
      classes={{
        dot: classes.stepperDot,
        dotActive: classes.stepperDotActive,
      }}
      variant="dots"
      steps={stepCount}
      position="static"
      activeStep={activeStep}
      nextButton={
        <Button
          style={{ width: "24px", visibility: "hidden" }}
          classes={{
            root: classes.buttonRoot,
          }}
        ></Button>
      }
      backButton={
        activeStep > 0 ? <_NavBackButton pop={handleBack} /> : <DummyButton />
      }
    />
  );
}

function Symbol() {
  const classes = useStyles();
  return <MenuBook className={classes.menuIcon} />;
}
