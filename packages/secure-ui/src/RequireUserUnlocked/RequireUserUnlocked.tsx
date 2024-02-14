import type { ReactNode } from "react";
import { memo, useEffect, useMemo, useState } from "react";

import { openOnboarding } from "@coral-xyz/common";
import {
  userClientAtom,
  userKeyringStoreStateAtom,
  userRequireMigrationUnlockAtom,
} from "@coral-xyz/recoil";
import { KeyringStoreState } from "@coral-xyz/secure-clients/types";
import { BanIcon } from "@coral-xyz/tamagui";
import { useRecoilState, useRecoilValue, useRecoilValueLoadable } from "recoil";

import { LoginRequest } from "./LoginRequest";
import { ErrorMessage } from "../_sharedComponents/ErrorMessage";
import { WithMotion } from "../_sharedComponents/WithMotion";

export function RequireUserUnlocked({
  children = <>{null}</>,
  withMotion = true,
  force,
  disabled,
  onReset,
  onSuccess,
}: {
  force?: boolean; // forces password prompt (locks keyring if unlocked)
  disabled?: boolean; // no unlock. Might prompt to unlock if needed for migration.
  withMotion?: boolean;
  children?: ReactNode;
  onSuccess?: () => void;
  onReset?: () => void;
}) {
  const userKeyringStoreStateLoadable = useRecoilValueLoadable(
    userKeyringStoreStateAtom
  );
  const userRequireMigrationUnlockLoadable = useRecoilValueLoadable(
    userRequireMigrationUnlockAtom
  );
  const keyringState = userKeyringStoreStateLoadable.getValue();
  const requireMigrationUnlock = userRequireMigrationUnlockLoadable.getValue();
  const noCurrentUser = userKeyringStoreStateLoadable.errorMaybe();
  const [didUnlock, setDidUnlock] = useState(false);

  const showLogin =
    keyringState !== KeyringStoreState.Unlocked ||
    requireMigrationUnlock ||
    force;

  useEffect(() => {
    if (!showLogin && !didUnlock) {
      onSuccess?.();
      setDidUnlock(true);
    }
  }, [showLogin, didUnlock, setDidUnlock, onSuccess]);

  useEffect(() => {
    if (!disabled && keyringState === KeyringStoreState.NeedsOnboarding) {
      openOnboarding();
      onReset?.();
    }
  }, [disabled, onReset, keyringState]);

  if (disabled) {
    return <>{children}</>;
  }
  if (keyringState === KeyringStoreState.NeedsOnboarding) {
    return null;
  }

  if (showLogin) {
    const login = (
      <LoginRequest
        didUnlock={() => {
          setDidUnlock(true);
          onSuccess?.();
        }}
        onReset={onReset}
      />
    );

    return withMotion ? <WithMotion id="login">{login}</WithMotion> : login;
  }

  if (noCurrentUser) {
    return (
      <ErrorMessage
        icon={(iconProps) => <BanIcon {...iconProps} />}
        title="There was an error"
        body="Failed to get user info."
      />
    );
  }

  return <>{children}</>;
}
