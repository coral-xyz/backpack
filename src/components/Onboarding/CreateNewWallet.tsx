import React, { useState } from "react";
import {
  makeStyles,
  MobileStepper,
  Button,
  Checkbox,
  Typography,
  TextField,
} from "@material-ui/core";
import { KeyboardArrowLeft } from "@material-ui/icons";

const useStyles = makeStyles((theme: any) => ({
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
}));

const STEP_COUNT = 4;

export function CreateNewWallet() {
  const classes = useStyles();
  const [activeStep, setActiveState] = useState(0);
  const handleNext = () => {
    setActiveState(activeStep + 1);
  };
  const handleBack = () => {
    setActiveState(activeStep - 1);
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <MobileStepper
        className={classes.stepper}
        classes={{
          dot: classes.stepperDot,
          dotActive: classes.stepperDotActive,
        }}
        variant="dots"
        steps={STEP_COUNT}
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
      <div
        style={{
          flex: 1,
        }}
      >
        {activeStep === 0 && <CreatePassword next={handleNext} />}
        {activeStep === 1 && <ShowMnemonic next={handleNext} />}
      </div>
    </div>
  );
}

function CreatePassword({ next }: { next: () => void }) {
  const classes = useStyles();
  const [checked, setChecked] = useState(false);
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
    next();
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
          <Typography className={classes.subtext}>
            I agree to the terms of service
          </Typography>
        </div>
      </div>
    </WithContinue>
  );
}

function ShowMnemonic({ next }: { next: () => void }) {
  const classes = useStyles();
  const canContinue = true;
  return <WithContinue next={next} canContinue={canContinue}></WithContinue>;
}

function WithContinue(props: any) {
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
          Continue
        </Button>
      </div>
    </div>
  );
}
