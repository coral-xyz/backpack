import React, { useState, useMemo } from "react";
import {
  makeStyles,
  MobileStepper,
  Button,
  Checkbox,
  Typography,
  TextField,
} from "@material-ui/core";
import { KeyboardArrowLeft } from "@material-ui/icons";
import { HdKeyring } from "../../keyring";

export const useStyles = makeStyles((theme: any) => ({
  stepper: {
    backgroundColor: theme.custom.colors.background,
    borderBottom: `solid 1pt #333333`,
    paddingTop: "10px",
    paddingBottom: "10px",
    paddingLeft: "14px",
    paddingRight: "14px",
    position: "relative",
  },
  stepperDot: {
    background: "#333333",
  },
  stepperDotActive: {
    background: "#fffe",
  },
  progressButton: {
    color: "#fff",
    padding: 0,
  },
  progressButtonLeftLabel: {
    background: "#333333",
    borderRadius: "20px",
  },
  progressButtonRightLabel: {
    background: "#333333",
    borderRadius: "20px",
  },
  buttonRoot: {
    minWidth: "5px",
  },
  withContinueContainer: {
    display: "flex",
    flexDirection: "column",
    color: theme.custom.colors.fontColor,
    paddingLeft: "14px",
    paddingRight: "14px",
    paddingTop: "10px",
    paddingBottom: "10px",
  },
  termsContainer: {
    display: "flex",
    marginTop: "8px",
  },
  passwordField: {
    background: "#333333",
  },
  checkBox: {
    padding: 0,
  },
  subtext: {
    color: "#333333",
  },
  continueButtonContainer: {
    position: "absolute",
    marginBottom: "20px",
    marginRight: "20px",
    marginLeft: "20px",
    bottom: 0,
    left: 0,
    right: 0,
  },
  continueButton: {
    width: "100%",
  },
  disabledContinue: {
    backgroundColor: "#333 !important",
    color: "#fff",
  },
  errorMsg: {
    color: "red",
    textAlign: "left",
    marginTop: "8px",
  },
  mnemonicDisplayContainer: {
    border: `solid 1pt #333333`,
    backgroundColor: "#333333",
  },
}));

const STEP_COUNT = 4;

export function CreateNewWallet() {
  const classes = useStyles();
  const [activeStep, setActiveState] = useState(0);
  const hdKeyring = useMemo(() => {
    return HdKeyring.generate();
  }, []);
  const [password, setPassword] = useState("");
  const handleNext = () => {
    setActiveState(activeStep + 1);
  };
  const handleBack = () => {
    setActiveState(activeStep - 1);
  };
  const handleDone = () => {
    // TODO
    // - store mnemonic in background storage
    // - trigger loading of regular UI
    console.log(
      "finishing with password/mnemonic",
      password,
      hdKeyring.mnemonic
    );
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Stepper
        activeStep={activeStep}
        handleBack={handleBack}
        stepCount={STEP_COUNT}
      />
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
        {activeStep === 2 && <Shortcut next={handleNext} />}
        {activeStep === 3 && <Done done={handleDone} />}
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
      <div
        style={{
          marginBottom: "8px",
        }}
      >
        <Typography variant="h4">Create a password</Typography>
        <Typography style={{ color: "#5d5d5d" }}>
          You will use this to unlock your wallet
        </Typography>
      </div>
      <div>
        <TextField
          placeholder="Enter your password..."
          variant="outlined"
          margin="dense"
          className={classes.passwordField}
          required
          fullWidth
          type="password"
          InputLabelProps={{
            shrink: false,
          }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          placeholder="Confirm your password..."
          variant="outlined"
          margin="dense"
          className={classes.passwordField}
          required
          fullWidth
          type="password"
          InputLabelProps={{
            shrink: false,
          }}
          value={passwordDup}
          onChange={(e) => setPasswordDup(e.target.value)}
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

function CheckboxForm({ checked, setChecked, label }: any) {
  const classes = useStyles();
  return (
    <div className={classes.termsContainer}>
      <Checkbox
        className={classes.checkBox}
        checked={checked}
        onChange={() => setChecked(!checked)}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
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
  const classes = useStyles();
  const [checked, setChecked] = useState(true);
  const canContinue = checked;
  return (
    <WithContinue next={next} canContinue={canContinue}>
      <div
        style={{
          marginBottom: "8px",
        }}
      >
        <Typography style={{ fontSize: "28px" }}>
          Secret Recovery Phrase
        </Typography>
        <Typography style={{ fontSize: "14px" }}>
          Thise phrase is the ONLY way to recover your wallet. Do not share it
          with anyone!
        </Typography>
      </div>
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
  return (
    <div className={classes.mnemonicDisplayContainer}>{keyring.mnemonic}</div>
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
    <WithContinue next={done} canContinue={true} buttonLabel={"Finish"}>
      TODO
    </WithContinue>
  );
}

export function WithContinue(props: any) {
  const classes = useStyles();
  return (
    <div className={classes.withContinueContainer}>
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%",
          paddingLeft: "20px",
          paddingRight: "20px",
        }}
      >
        {props.children}
      </div>
      <div className={classes.continueButtonContainer}>
        <Button
          disabled={!props.canContinue}
          className={classes.continueButton}
          variant="contained"
          onClick={() => props.next()}
          classes={{
            disabled: classes.disabledContinue,
          }}
        >
          {props.buttonLabel ?? "Continue"}
        </Button>
      </div>
    </div>
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
        <Button
          size="small"
          onClick={handleBack}
          disabled={activeStep === 0}
          className={classes.progressButton}
          classes={{
            root: classes.buttonRoot,
          }}
        >
          <KeyboardArrowLeft className={classes.progressButtonRightLabel} />
        </Button>
      }
    />
  );
}
