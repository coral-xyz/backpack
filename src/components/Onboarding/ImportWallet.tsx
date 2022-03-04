import { useState } from "react";
import { makeStyles } from "@material-ui/core";
import {
  WithContinue,
  Stepper,
  Shortcut,
  Done,
  CreatePassword,
} from "./CreateNewWallet";

const STEP_COUNT = 5;

const useStyles = makeStyles((theme: any) => ({
  //
}));

export function ImportWallet() {
  const classes = useStyles();
  const [password, setPassword] = useState("");
  const [activeStep, setActiveState] = useState(0);
  const [accounts, setAccounts] = useState<null | Array<any>>(null);
  const handleNext = () => {
    setActiveState(activeStep + 1);
  };
  const handleBack = () => {
    setActiveState(activeStep - 1);
  };
  const handleDone = () => {
    // todo
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
        {activeStep === 0 && <ImportMnemonic next={handleNext} />}
        {activeStep === 1 && (
          <ImportAccounts
            next={(accounts: Array<any>) => {
              setAccounts(accounts);
              handleNext();
            }}
          />
        )}
        {activeStep === 2 && (
          <CreatePassword
            next={(pw) => {
              setPassword(pw);
              handleNext();
            }}
          />
        )}
        {activeStep === 3 && <Shortcut next={handleNext} />}
        {activeStep === 4 && <Done done={handleDone} />}
      </div>
    </div>
  );
}

function ImportMnemonic({ next }: any) {
  const canContinue = true;
  return <WithContinue next={next} canContinue={canContinue}></WithContinue>;
}

function ImportAccounts({ next }: any) {
  const canContinue = true;
  return <WithContinue next={next} canContinue={canContinue}></WithContinue>;
}
