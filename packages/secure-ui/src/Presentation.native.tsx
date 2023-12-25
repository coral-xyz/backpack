import type { ReactNode } from "react";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { StyleSheet, View, Platform } from "react-native";

import { getItemAsync } from "expo-secure-store";

import { MOBILE_SECRET_PASSWORD_KEY, useStore } from "@coral-xyz/common";
import {
  secureUserAtomNullable,
  userClientAtom,
  userKeyringStoreStateAtom,
} from "@coral-xyz/recoil";
import { safeClientResponse } from "@coral-xyz/secure-clients";
import {
  KeyringStoreState,
  type SECURE_EVENTS,
} from "@coral-xyz/secure-clients/types";
import { useTheme } from "@coral-xyz/tamagui";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FullWindowOverlay } from "react-native-screens";
import { useRecoilValueLoadable } from "recoil";

import {
  isCurrentRequestRespondedAtom,
  type QueuedUiRequest,
} from "./_atoms/requestAtoms";
import { Loading } from "./_sharedComponents/Loading";

export function Presentation<T extends SECURE_EVENTS = SECURE_EVENTS>({
  currentRequest,
  children,
}: {
  currentRequest: QueuedUiRequest<T> | null;
  presentation?: "modal" | "fullscreen";
  children: ReactNode;
}) {
  const currentUser = useRecoilValueLoadable(secureUserAtomNullable).getValue();
  const keyringStoreState = useRecoilValueLoadable(
    userKeyringStoreStateAtom
  ).getValue();
  const userClient = useRecoilValueLoadable(userClientAtom).getValue();
  // rerender when currentRequest is set to responded = true;
  // XXX: it might not be necessary to capture this as a variable,
  //      currently using it to ensure that the useEffect is run
  const responded = useRecoilValueLoadable(
    isCurrentRequestRespondedAtom
  ).getValue();
  const safeAreaInsets = useSafeAreaInsets();
  const isSheetOpen = !!currentRequest && !currentRequest.responded;
  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const theme = useTheme();

  // variables
  const snapPoints = useMemo(() => ["80%"], []);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const handleDismiss = useCallback(() => {
    currentRequest?.error(new Error("Approval Denied: Popup Closed."));
  }, [currentRequest]);

  const setCloseSecureUI = useStore((store) => store.setCloseSecureUI);
  useEffect(() => {
    setCloseSecureUI(handleDismiss);
  }, [setCloseSecureUI, handleDismiss]);

  // Keying on mobile should be unlockable -> try unlocking.
  useEffect(() => {
    if (
      currentRequest &&
      currentUser?.user.uuid &&
      userClient &&
      keyringStoreState === KeyringStoreState.Locked
    ) {
      getItemAsync(MOBILE_SECRET_PASSWORD_KEY)
        .then((password) =>
          safeClientResponse(
            userClient.unlockKeyring({
              uuid: currentUser.user.uuid,
              password: password ?? "",
            })
          )
        )
        .then((response) => {
          if (!response.unlocked) {
            throw Error("Keyring Locked");
          }
          // if this is an unlock request -> respond.
          else if (currentRequest.name === "SECURE_USER_UNLOCK_KEYRING") {
            (
              currentRequest as QueuedUiRequest<"SECURE_USER_UNLOCK_KEYRING">
            ).respond(response);
          }
        })
        .catch((e) => {
          currentRequest.error(e);
        });
    }
  }, [currentRequest, currentUser?.user.uuid, keyringStoreState, userClient]);

  useEffect(() => {
    if (!bottomSheetModalRef.current) {
      return;
    }
    try {
      if (isSheetOpen) {
        // both methods probably not necessary, but had some
        // inconsistent results when testing with one or the other
        bottomSheetModalRef.current?.present();
        bottomSheetModalRef.current?.expand();
      } else {
        bottomSheetModalRef.current?.close();
      }
    } catch (_err) {
      // do nothing
    }
  }, [responded, isSheetOpen, bottomSheetModalRef]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior="close"
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  );

  const ContainerComponent =
    Platform.OS === "ios" ? FullWindowOverlay : undefined;
  return (
    <BottomSheetModal
      backgroundStyle={{
        backgroundColor: theme.baseBackgroundL0.val,
      }}
      ref={bottomSheetModalRef}
      snapPoints={snapPoints}
      onDismiss={handleDismiss}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      containerComponent={ContainerComponent}
    >
      <View
        style={[
          styles.contentContainer,
          { marginBottom: safeAreaInsets.bottom },
        ]}
        key={currentRequest?.id ?? "loading"}
      >
        <Suspense fallback={<Loading backgroundColor="transparent" />}>
          {currentRequest ? children : <Loading delay={500} />}
        </Suspense>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
});
