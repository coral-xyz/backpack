import type { ReactNode } from "react";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, View, Platform, AccessibilityInfo } from "react-native";

import { useStore } from "@coral-xyz/common";
import { type SECURE_EVENTS } from "@coral-xyz/secure-clients/types";
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
  const shouldAnimate = useShouldAnimate();

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
      animateOnMount={shouldAnimate}
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

function useShouldAnimate() {
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (enabled) {
        setShouldAnimate(false);
      }
    });
  }, []);

  return shouldAnimate;
}
