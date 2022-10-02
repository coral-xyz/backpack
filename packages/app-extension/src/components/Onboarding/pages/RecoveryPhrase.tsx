import { ComponentProps } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MnemonicInput } from "../../common/Account/MnemonicInput";

const RecoveryPhrase = (
  props: Omit<ComponentProps<typeof MnemonicInput>, "onNext">
) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <MnemonicInput
      onNext={(mnemonic) => navigate(`${pathname}/${mnemonic}`)}
      {...props}
    />
  );
};

export const GenerateRecoveryPhrase = () => (
  <RecoveryPhrase readOnly buttonLabel="Next" />
);
export const ImportRecoveryPhrase = () => (
  <RecoveryPhrase buttonLabel="Import" />
);
