import { useState, useMemo } from "react";
import { makeStyles, Typography, TextField } from "@material-ui/core";
import * as bip39 from "bip39";
import { getBackgroundClient } from "../../background/client";
import {
  WithContinue,
  Stepper,
  Shortcut,
  Done,
  CreatePassword,
} from "./CreateNewWallet";
import {
  BrowserRuntime,
  UI_RPC_METHOD_KEYRING_STORE_CREATE,
} from "../../common";
import { DerivationPath } from "../../keyring/crypto";

const STEP_COUNT = 5;

const useStyles = makeStyles((theme: any) => ({
  //
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
        {activeStep === 3 && <Shortcut next={handleNext} />}
        {activeStep === 4 && <Done done={handleDone} />}
      </div>
    </div>
  );
}

function ImportMnemonic({ next }: { next: (m: string) => void }) {
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
      <Typography>Secret Recovery phrase</Typography>
      <TextField
        placeholder="Secret Recover Phrase"
        variant="outlined"
        margin="dense"
        required
        fullWidth
        InputLabelProps={{
          shrink: false,
        }}
        value={mnemonic}
        onChange={(e) => setMnemonic(e.target.value)}
      />
      {error && <Typography style={{ color: "red" }}>{error}</Typography>}
    </WithContinue>
  );
}

function ImportAccounts({ next }: any) {
  const canContinue = true;
  return <WithContinue next={next} canContinue={canContinue}></WithContinue>;
}
