import { useState } from "react";
import { useTheme } from "@material-ui/core";
import { Stepper, WithContinue } from "../Onboarding/CreateNewWallet";
import { EXTENSION_WIDTH, EXTENSION_HEIGHT } from "../../common";

const STEP_COUNT = 3;

export function ConnectHardware() {
  const theme = useTheme() as any;
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
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginLeft: "auto",
          marginRight: "auto",
          width: EXTENSION_WIDTH,
          height: EXTENSION_HEIGHT,
          backgroundColor: theme.custom.colors.background,
        }}
      >
        <div style={{ height: "56px" }}>
          <Stepper
            activeStep={activeStep}
            handleBack={handleBack}
            stepCount={STEP_COUNT}
          />
        </div>
        <div style={{ flex: 1 }}>
          {activeStep === 0 && <Step0 next={handleNext} />}
          {activeStep === 1 && <Step1 next={handleNext} />}
          {activeStep === 2 && <Step2 />}
        </div>
      </div>
    </div>
  );
}

function Step0({ next }: any) {
  const canContinue = true;
  return (
    <WithContinue next={next} canContinue={canContinue}>
      <div>step0</div>
    </WithContinue>
  );
}

function Step1({ next }: any) {
  const canContinue = true;
  return (
    <WithContinue next={next} canContinue={canContinue}>
      <div>step1</div>
    </WithContinue>
  );
}

function Step2() {
  return <div>step2</div>;
}
