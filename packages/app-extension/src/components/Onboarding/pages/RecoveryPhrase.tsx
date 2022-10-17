import {
  DerivationPath,
  UI_RPC_METHOD_PREVIEW_PUBKEYS,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { ComponentProps, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { MnemonicInput } from "../../common/Account/MnemonicInput";

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

const RecoveryPhrase = (
  props: Optional<ComponentProps<typeof MnemonicInput>, "onNext">
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

const LOAD_PUBKEY_AMOUNT = 20;

export const RecoverAccountWithRecoveryPhrase = () => {
  const background = useBackgroundClient();
  const { pathname } = useLocation();
  const { usernameAndPubkey, blockchain } = useParams();
  const [error, setError] = useState<string>();
  const navigate = useNavigate();

  const { username, pubkey } = JSON.parse(usernameAndPubkey!);

  const loadMnemonicPublicKeys = async (
    mnemonic: string,
    derivationPath: DerivationPath
  ) => {
    const publicKeys = await background.request({
      method: UI_RPC_METHOD_PREVIEW_PUBKEYS,
      params: [blockchain!, mnemonic, derivationPath, LOAD_PUBKEY_AMOUNT],
    });
    return publicKeys;
  };

  const handleMnemonic = async (memonic: string) => {
    const [b44s, b44Changes] = await Promise.all([
      loadMnemonicPublicKeys(memonic, DerivationPath.Bip44),
      loadMnemonicPublicKeys(memonic, DerivationPath.Bip44Change),
    ]);
    if (b44s.concat(b44Changes).includes(pubkey)) {
      navigate(`${pathname}/${memonic}`);
    } else {
      setError(`No matching address found for '${username}'`);
    }
  };

  return (
    <RecoveryPhrase
      buttonLabel="Recover account"
      onNext={handleMnemonic}
      customError={error}
    />
  );
};
