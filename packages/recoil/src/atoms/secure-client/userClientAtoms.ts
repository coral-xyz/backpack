import type { Blockchain } from "@coral-xyz/common";
import { isMobile } from "@coral-xyz/common";
import type { User } from "@coral-xyz/secure-background/types";
import { UserClient } from "@coral-xyz/secure-clients";
import type {
  SecureResponse,
  SecureUserType,
  UserPublicKeyInfo,
  UserPublicKeyStore,
} from "@coral-xyz/secure-clients/types";
import { KeyringStoreState } from "@coral-xyz/secure-clients/types";
import { atom, selector } from "recoil";

import {
  notificationListenerAtom,
  secureBackgroundSenderAtom,
} from "./transportAtoms";

export const userClientAtom = selector<UserClient>({
  key: "userClientAtom",
  get: ({ get }) => {
    const secureBackgroundSender = get(secureBackgroundSenderAtom);
    return new UserClient(secureBackgroundSender);
  },
  // this prevents recoil from freezing the object in dev mode
  // required to keep the transport working.
  dangerouslyAllowMutability: true,
});

// use secureUserAtom and keyringStateAtom instead
export const rawSecureUserAtom = atom<
  NonNullable<SecureResponse<"SECURE_USER_GET">["response"]>
>({
  key: "rawSecureUserAtom",
  effects: [
    ({ setSelf, getPromise }) => {
      let stopPolling = false;
      const fetchUser = async () => {
        const userClient = await getPromise(userClientAtom);
        const response = await userClient.getUser();
        if (response.error) {
          console.error(response.error);
          throw response.error;
        }
        return response.response!;
      };

      const safeLocalCopy = (
        newUser: NonNullable<SecureResponse<"SECURE_USER_GET">["response"]>
      ) => {
        if (!isMobile()) {
          //
          // On extension, we write copy to local storage of the UI so that
          // we can use it without hitting the service worker on app load.
          //
          try {
            window.localStorage.setItem("secureUser", JSON.stringify(newUser));
          } catch {
            null;
          }
        }
      };

      const updateUser = async () => {
        const newUser = await fetchUser();
        if (stopPolling) {
          return;
        }
        safeLocalCopy(newUser);
        setSelf(newUser);

        // On mobile we try to unlock immediately should keystore be locked.
        if (
          isMobile() &&
          newUser.keyringStoreState === KeyringStoreState.Locked
        ) {
          throw new Error("keyring locked!");

          // const password = await getSecretPassword(); // get this more app-mobile
          // const userClient = await getPromise(userClientAtom);
          // await userClient.unlockKeyring({
          //   password,
          //   uuid: newUser.user.uuid,
          // }, {
          //   uiOptions: {
          //     noPopup: true
          //   }
          // });
        }
      };

      // Listen to notifications and refetch userdata on relevant ones
      const removeListener = getPromise(notificationListenerAtom).then(
        (notificationListener) => {
          return notificationListener.addListener(async (notification) => {
            if (stopPolling) {
              return;
            }
            if (["NOTIFICATION_USER_UPDATED"].includes(notification.name)) {
              await updateUser();
            }
          });
        }
      );

      const fetchInitialValue = () => {
        setSelf(
          fetchUser().then((user) => {
            // start polling after initial value set.
            // setTimeout(() => pollUser().catch((e) => console.error(e)), 5000);
            // console.log("pca", "used ws user", user);
            safeLocalCopy(user);
            return user;
          })
        );
      };

      if (!isMobile()) {
        const localCopyJSON = window.localStorage.getItem("secureUser");
        if (localCopyJSON) {
          const localCopy = JSON.parse(localCopyJSON);
          // console.log("pca", "used local user copy", localCopy);
          setSelf(localCopy);
          updateUser().catch((e) => {});
        } else {
          fetchInitialValue();
        }
      } else {
        fetchInitialValue();
      }

      return () => {
        stopPolling = true;
        removeListener
          .then((remove) => remove())
          .catch((e) => console.error(e));
      };
    },
  ],
});

export const secureAllUsersAtom = selector<User[]>({
  key: "secureAllUsersAtom",
  get: async ({ get }) => {
    const secureUser = get(_secureOnboardedUserAtom);
    return secureUser.allUsers;
  },
});
export const secureAllUsersAtomNullable = selector<User[] | null>({
  key: "secureAllUsersAtomNullable",
  get: async ({ get }) => {
    const secureUser = get(_secureOnboardedUserAtomNullable);
    if (secureUser?.allUsers) {
      return secureUser.allUsers;
    } else {
      return null;
    }
  },
});

const unlockUntilMobileAtom = atom<number>({
  key: "unlockUntilMobileAtom",
  default: 0,
});
export const unlockedUntilAtom = selector<number>({
  key: "unlockedUntilAtom",
  get: ({ get }) => {
    get(rawSecureUserAtom);
    const unlockedUntilMobile = get(unlockUntilMobileAtom);
    if (!isMobile()) {
      return parseInt(
        window.localStorage.getItem("unlocked-until-storage-key") ?? "0"
      );
    }
    return unlockedUntilMobile;
  },
  set: ({ set }, value) => {
    if (typeof value === "number") {
      if (!isMobile()) {
        window.localStorage.setItem("unlocked-until-storage-key", value + "");
      }
      set(unlockUntilMobileAtom, value);
    }
  },
});

export const autolockTimerAtom = selector<number>({
  key: "autolockTimerAtom",
  get: ({ get }) => {
    const user = get(rawSecureUserAtom);
    if (
      user.keyringStoreState === KeyringStoreState.NeedsOnboarding ||
      (user.preferences.preferencesLastUpdated ?? 0) <= 1694893728333 ||
      user.preferences.autoLockSettings.option === "never"
    ) {
      return 99999999999999;
    }
    if (user.preferences.autoLockSettings.option === "onClose") {
      return -1;
    }
    return user.preferences.autoLockSettings.seconds ?? 0;
  },
});

const _secureOnboardedUserStringAtom = selector<string>({
  key: "secureOnboardedUserStringAtom",
  get: ({ get }) => {
    const user = get(rawSecureUserAtom);
    if (user.keyringStoreState === KeyringStoreState.NeedsOnboarding) {
      const error =
        "No User found. Check that userKeyringStoreStateAtom !== needsOnboarding before loading secureUserAtom.";
      // console.error(error.message);
      throw new Error(error);
    }
    const onboardedUser: SecureUserType & {
      keyringStoreState?: KeyringStoreState;
    } = { ...user };
    delete onboardedUser.keyringStoreState;

    return JSON.stringify(onboardedUser);
  },
});
const _secureOnboardedUserStringAtomNullable = selector<string | null>({
  key: "secureOnboardedUserStringAtomNullable",
  get: ({ get }) => {
    const user = get(rawSecureUserAtom);
    if (user.keyringStoreState === KeyringStoreState.NeedsOnboarding) {
      return null;
    }
    const onboardedUser: SecureUserType & {
      keyringStoreState?: KeyringStoreState;
    } = { ...user };
    delete onboardedUser.keyringStoreState;

    return JSON.stringify(onboardedUser);
  },
});

// use secureUserAtom instead. Only use this on unlock screen where migration could be needed..
export const _secureOnboardedUserAtom = selector<SecureUserType>({
  key: "secureOnboardedUserAtom",
  get: ({ get }) => {
    const user = get(_secureOnboardedUserStringAtom);
    return JSON.parse(user) as SecureUserType;
  },
});
export const _secureOnboardedUserAtomNullable = selector<SecureUserType | null>(
  {
    key: "secureOnboardedUserAtomNullable",
    get: ({ get }) => {
      const user = get(_secureOnboardedUserStringAtomNullable);
      if (user) {
        return JSON.parse(user) as SecureUserType;
      } else {
        return null;
      }
    },
  }
);

type SecureUserAtomType = SecureUserType & {
  publicKeys: NonNullable<SecureUserType["publicKeys"]>;
};
export const secureUserAtom = selector<SecureUserAtomType>({
  key: "secureUserAtom",
  get: ({ get }) => {
    const user = get(_secureOnboardedUserAtom);
    if (!user.publicKeys) {
      const error =
        "User accounts not migrated. Force unlock if userRequireMigrationUnlockAtom === true.";
      console.error(error);
      throw new Error(error);
    }

    const publicKeys = user.publicKeys;
    // const publicKeys = injectPubkey(
    //   user.publicKeys,
    //   Blockchain.SOLANA,
    //   "4ja2N12Zczh9K25zGFTfao6yPdTZSfA5Bw4QueSmQCYJ",
    //   {
    //     type: "imported",
    //     name: "monkey",
    //     isCold: false
    //   }
    // );

    return { ...user, publicKeys };
  },
});
export const secureUserAtomNullable = selector<SecureUserAtomType | null>({
  key: "secureUserAtomNullable",
  get: ({ get }) => {
    const user = get(_secureOnboardedUserAtomNullable);
    const publicKeys = user?.publicKeys;
    if (!user || !publicKeys) {
      return null;
    }
    return { ...user, publicKeys };
  },
});

const injectPubkey = (
  publicKeys: UserPublicKeyStore[string],
  blockchain: Blockchain,
  publicKey: string,
  info: UserPublicKeyInfo
): UserPublicKeyStore[string] => {
  return {
    ...publicKeys,
    platforms: {
      ...publicKeys.platforms,
      [blockchain]: {
        ...(publicKeys.platforms[blockchain] ?? {
          activePublicKey: publicKey,
        }),
        publicKeys: {
          ...(publicKeys.platforms[blockchain]?.publicKeys ?? {}),
          [publicKey]: {
            ...(publicKeys.platforms[blockchain]?.publicKeys[publicKey] ??
              info),
          },
        },
      },
    },
  };
};

export const userKeyringStoreStateAtom = selector<KeyringStoreState>({
  key: "userKeyringStoreStateAtom",
  get: ({ get }) => {
    const user = get(rawSecureUserAtom);
    return user.keyringStoreState;
  },
});
export const userUUIDAtom = selector<string | null>({
  key: "userUUIDAtom",
  get: ({ get }) => {
    const user = get(rawSecureUserAtom);
    if (user.keyringStoreState !== KeyringStoreState.NeedsOnboarding) {
      return user.user.uuid;
    }
    return null;
  },
});

export const userRequireMigrationUnlockAtom = selector<boolean>({
  key: "userRequireMigrationUnlockAtom",
  get: ({ get }) => {
    const user = get(rawSecureUserAtom);
    if (
      user.keyringStoreState !== KeyringStoreState.NeedsOnboarding &&
      !user.publicKeys
    ) {
      return true;
    }
    return false;
  },
});
