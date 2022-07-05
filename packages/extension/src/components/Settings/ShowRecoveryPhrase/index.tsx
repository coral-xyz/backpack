import { useState } from "react";
import { useCustomTheme } from "@coral-xyz/themes";
import { WithDrawer } from "../../Layout/Drawer";
import { WithNav, NavBackButton } from "../../Layout/Nav";
import { ShowRecoveryPhraseWarning } from "./ShowRecoveryPhraseWarning";
import { ShowRecoveryPhraseMnemonic } from "./ShowRecoveryPhraseMnemonic";

export function ShowRecoveryPhrase({ close }: { close: () => void }) {
  const theme = useCustomTheme();
  const [step, setStep] = useState(0);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => {
    if (step === 0) {
      close();
    } else {
      // Previous step in flow
      setStep(step - 1);
    }
  };

  const steps = [
    <ShowRecoveryPhraseWarning onNext={nextStep} />,
    <ShowRecoveryPhraseMnemonic onNext={close} />,
  ];

  return (
    <WithDrawer openDrawer={true}>
      <WithNav
        navButtonLeft={<NavBackButton onClick={prevStep} />}
        navbarStyle={{
          backgroundColor: theme.custom.colors.background,
        }}
        navContentStyle={{
          backgroundColor: theme.custom.colors.background,
        }}
      >
        {steps[step] || null}
      </WithNav>
    </WithDrawer>
  );
}
