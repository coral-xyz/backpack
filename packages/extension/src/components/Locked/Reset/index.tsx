import { useState } from "react";
import { useCustomTheme } from "@coral-xyz/themes";
import { ResetWelcome } from "./ResetWelcome";
import { ResetWarning } from "./ResetWarning";
import { ResetSuccess } from "./ResetSuccess";
import { WithNav, NavBackButton } from "../../Layout/Nav";
import { openOnboarding } from "@coral-xyz/common";

export function Reset({
  onBack,
  closeDrawer,
}: {
  onBack: () => void;
  closeDrawer: () => void;
}) {
  const theme = useCustomTheme();
  const [step, setStep] = useState(0);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => {
    if (step === 0) {
      onBack();
    } else {
      setStep(step - 1);
    }
  };

  const renderComponent =
    [
      <ResetWelcome onNext={nextStep} onClose={closeDrawer} />,
      <ResetWarning onNext={nextStep} onClose={closeDrawer} />,
      <ResetSuccess onNext={openOnboarding} />,
    ][step] || null;

  return (
    <WithNav
      navButtonLeft={<NavBackButton onClick={prevStep} />}
      navbarStyle={{
        backgroundColor: theme.custom.colors.nav,
      }}
      navContentStyle={{
        backgroundColor: theme.custom.colors.nav,
      }}
    >
      {renderComponent}
    </WithNav>
  );
}
