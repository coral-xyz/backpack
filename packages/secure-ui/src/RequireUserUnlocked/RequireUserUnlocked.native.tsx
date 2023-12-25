import type { ReactNode } from "react";

import { userKeyringStoreStateAtom } from "@coral-xyz/recoil";
import { KeyringStoreState } from "@coral-xyz/secure-clients/types";
import { useRecoilValueLoadable } from "recoil";

import { Loading } from "../_sharedComponents/Loading";

export function RequireUserUnlocked({
  children = <>{null}</>,
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
  const keyringState = userKeyringStoreStateLoadable.getValue();

  // Keyring on mobile should always be unlocked.
  // If that is not the case, Presentation.native.tsx will try to unlock
  // show loading while this is happening.
  if (keyringState !== KeyringStoreState.Unlocked) {
    return <Loading />;
  }

  return <>{children}</>;
}
