import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { StyleSheet } from "react-native";

import { useTheme as useTamaguiTheme } from "@coral-xyz/tamagui";
import {
  BottomSheetBackdrop,
  BottomSheetModal as _BottomSheetModal,
  BottomSheetView,
  useBottomSheetDynamicSnapPoints,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StyledText } from "~components/index";

export function BottomSheetModal({
  isVisible,
  resetVisibility,
  snapPoints,
  contentHeight,
  children,
  initialIndex = 0,
  index,
}: {
  isVisible: boolean;
  resetVisibility: () => void;
  snapPoints: (string | number)[];
  contentHeight?: number;
  children: JSX.Element;
  initialIndex?: number;
  index?: number;
}): JSX.Element {
  const theme = useTamaguiTheme();
  const bottomSheetModalRef = useRef<_BottomSheetModal>(null);

  useEffect(() => {
    function handle() {
      if (index && index !== initialIndex) {
        bottomSheetModalRef.current?.snapToIndex(index);
      }

      if (isVisible) {
        bottomSheetModalRef.current?.present();
        // Resets visibility since dismissing it is built-in
        resetVisibility();
      }
    }

    handle();
  }, [isVisible, resetVisibility, index, initialIndex]);

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

  return (
    <_BottomSheetModal
      ref={bottomSheetModalRef}
      index={initialIndex}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      contentHeight={contentHeight}
      handleStyle={{
        marginBottom: 12,
      }}
      backgroundStyle={{
        backgroundColor: theme.modal.val,
      }}
    >
      {children}
    </_BottomSheetModal>
  );
}

export const BetterBottomSheet = ({
  isVisible,
  resetVisibility,
  children,
}: {
  isVisible: boolean;
  resetVisibility: () => void;
  children: JSX.Element | JSX.Element[];
}) => {
  const theme = useTamaguiTheme();
  const initialSnapPoints = useMemo(() => ["CONTENT_HEIGHT"], []);
  const bottomSheetRef = useRef<_BottomSheetModal>(null);

  const {
    animatedHandleHeight,
    animatedSnapPoints,
    animatedContentHeight,
    handleContentLayout,
  } = useBottomSheetDynamicSnapPoints(initialSnapPoints);

  useEffect(() => {
    (function handle() {
      if (isVisible) {
        bottomSheetRef.current?.present();
        // Resets visibility since dismissing it is built-in
        resetVisibility();
      }
    })();
  }, [isVisible, resetVisibility]);

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

  return (
    <_BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={animatedSnapPoints}
      backdropComponent={renderBackdrop}
      handleHeight={animatedHandleHeight}
      contentHeight={animatedContentHeight}
      backgroundStyle={{
        backgroundColor: theme.modal.val,
      }}
    >
      <InnerSheet onLayout={handleContentLayout}>{children}</InnerSheet>
    </_BottomSheetModal>
  );
};

function InnerSheet({
  children,
  onLayout,
  ...props
}: {
  children: React.ReactNode;
  onLayout: (data: any) => void;
}): JSX.Element {
  const insets = useSafeAreaInsets();
  const theme = useTamaguiTheme();
  return (
    <BottomSheetView
      onLayout={onLayout}
      style={[
        styles.containerStyle,
        {
          paddingBottom: insets.bottom + 12,
          backgroundColor: theme.modal.val,
        },
      ]}
      {...props}
    >
      {children}
    </BottomSheetView>
  );
}

const styles = StyleSheet.create({
  containerStyle: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
});

export function Header({ text }: { text: string }): JSX.Element {
  return (
    <StyledText fontSize={18} textAlign="center">
      {text}
    </StyledText>
  );
}
