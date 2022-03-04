import React, { useState } from "react";
import { useTheme, makeStyles, MobileStepper, Button } from "@material-ui/core";
import { KeyboardArrowLeft } from "@material-ui/icons";
import { KeyboardArrowRight } from "@material-ui/icons";

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
    <div>
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
      <div></div>
    </div>
  );
}

/*
          <Button
            size="small"
            onClick={handleNext}
            disabled={activeStep === STEP_COUNT - 1}
            className={classes.progressButton}
            classes={{
              root: classes.buttonRoot,
            }}
          >
            <KeyboardArrowRight className={classes.progressButtonLeftLabel} />
</Button>
*/
