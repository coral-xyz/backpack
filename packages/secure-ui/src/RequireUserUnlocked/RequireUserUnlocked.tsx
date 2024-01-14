import type { ReactNode } from "react";
import { memo, useEffect, useMemo, useState } from "react";

import { openOnboarding } from "@coral-xyz/common";
import {
  autolockTimerAtom,
  unlockedUntilAtom,
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
  allowLazyUnlock,
  disabled,
  onReset,
  onSuccess,
}: {
  force?: boolean; // forces password prompt (locks keyring if unlocked)
  disabled?: boolean; // no unlock. Might prompt to unlock if needed for migration.
  allowLazyUnlock?: boolean; // will not prompt to unlock while unlockedUntil is in future
  withMotion?: boolean;
  children?: ReactNode;
  onSuccess?: () => void;
  onReset?: () => void;
}) {
  const userKeyringStoreStateLoadable = useRecoilValueLoadable(
    userKeyringStoreStateAtom
  );
  const autolockTimerLoadable = useRecoilValueLoadable(autolockTimerAtom);
  const userRequireMigrationUnlockLoadable = useRecoilValueLoadable(
    userRequireMigrationUnlockAtom
  );
  const userClient = useRecoilValue(userClientAtom);
  const keyringState = userKeyringStoreStateLoadable.getValue();
  const autolockTimer = autolockTimerLoadable.getValue() ?? 0;
  const autolockTimerMs = Number(autolockTimer) * 1000;
  const requireMigrationUnlock = userRequireMigrationUnlockLoadable.getValue();
  const noCurrentUser = userKeyringStoreStateLoadable.errorMaybe();
  const [unlockedUntil, setUnlockedUntil] = useRecoilState(unlockedUntilAtom);
  const [didUnlock, setDidUnlock] = useState(false);
  const stillUnlocked = unlockedUntil > Date.now();

  const showLogin =
    keyringState !== KeyringStoreState.Unlocked ||
    requireMigrationUnlock ||
    force;
  // const showLogin =
  //   // if not onboarding
  //   keyringState !== KeyringStoreState.NeedsOnboarding &&
  //   // and
  //   // if we require login for some reason and didnt it yet
  //   (((requireMigrationUnlock || force || autolockTimer < 0) && !didUnlock) ||
  //     // if keyring is locked and we are not lazy unlocked and not disabled
  //     (keyringState === KeyringStoreState.Locked &&
  //       !(allowLazyUnlock && stillUnlocked)));

  useEffect(() => {
    if (!showLogin && !didUnlock) {
      onSuccess?.();
      setDidUnlock(true);
    }
  }, [showLogin, didUnlock, setDidUnlock, onSuccess]);

  useEffect(() => {
    let stopped = false;
    const ping = async () => {
      if (stopped) {
        return;
      }
      setUnlockedUntil((unlockedUntil) => {
        const newUnlockUntil =
          unlockedUntil > Date.now()
            ? Date.now() + Number(autolockTimerMs)
            : unlockedUntil;
        userClient.ping({ unlockedUntil: newUnlockUntil });
        return newUnlockUntil;
      });
      setTimeout(() => {
        requestAnimationFrame(ping);
      }, 5000);
    };
    ping();
    return () => {
      stopped = true;
    };
  }, []);

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
          setUnlockedUntil(Date.now() + autolockTimerMs);
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
