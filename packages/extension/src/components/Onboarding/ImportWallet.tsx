import { useState } from "react";
import { makeStyles, Typography } from "@material-ui/core";
import * as bip39 from "bip39";
import { getBackgroundClient } from "../../background/client";
import { WithContinue, Stepper, Done, CreatePassword } from "./CreateNewWallet";
import {
  BrowserRuntime,
  UI_RPC_METHOD_KEYRING_STORE_CREATE,
} from "../../common";
import { DerivationPath } from "@200ms/common";
import { TextField } from "../common";
import { OnboardHeader } from "./CreateNewWallet";

const STEP_COUNT = 4;

const useStyles = makeStyles((theme: any) => ({
  importMnemonicRoot: {
    margin: 0,
    width: "100%",
    marginBottom: "16px",
  },
}));

export function ImportWallet() {
  const classes = useStyles();
  const [activeStep, setActiveState] = useState(0);
  const [mnemonic, setMnemonic] = useState("");
  const [password, setPassword] = useState("");
  const [accounts, setAccounts] = useState<null | Array<any>>(null);
  const handleNext = () => {
    setActiveState(activeStep + 1);
  };
  const handleBack = () => {
    setActiveState(activeStep - 1);
  };
  const handleDone = () => {
    const derivationPath = DerivationPath.Bip44Change;
    const background = getBackgroundClient();
    background
      .request({
        method: UI_RPC_METHOD_KEYRING_STORE_CREATE,
        params: [mnemonic, derivationPath, password],
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
          <ImportMnemonic
            next={(mnemonic: string) => {
              setMnemonic(mnemonic);
              handleNext();
            }}
          />
        )}
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
        {activeStep === 3 && <Done done={handleDone} />}
      </div>
    </div>
  );
}

function ImportMnemonic({ next }: { next: (m: string) => void }) {
  const classes = useStyles();
  const [mnemonic, setMnemonic] = useState("");
  const [error, setError] = useState<string | null>(null);
  let canContinue = true;
  const onContinue = () => {
    if (!bip39.validateMnemonic(mnemonic)) {
      setError("Invalid secret recovery phrase");
      return;
    }
    next(mnemonic);
  };
  return (
    <WithContinue next={onContinue} canContinue={canContinue}>
      <OnboardHeader
        text={"Secret Recovery Phrase"}
        subtext={"Enter your mnemonic"}
      />
      <TextField
        placeholder="Secret Recover Phrase"
        value={mnemonic}
        setValue={setMnemonic}
        rootClass={classes.importMnemonicRoot}
      />
      {error && <Typography style={{ color: "red" }}>{error}</Typography>}
    </WithContinue>
  );
}

function ImportAccounts({ next }: any) {
  const canContinue = true;
  return (
    <WithContinue next={next} canContinue={canContinue}>
      <OnboardHeader
        text={"Import accounts"}
        subtext={
          "Your first account will be imported. Once setup is complete, you can add the rest of your accounts from within the settings page. Click continue."
        }
      />
    </WithContinue>
  );
}
