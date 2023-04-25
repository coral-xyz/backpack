import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { Pressable, StyleSheet } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import {
  BottomSheetModal as _BottomSheetModal,
  BottomSheetView,
  // BottomSheetFooter,
  BottomSheetBackdrop,
  useBottomSheetDynamicSnapPoints,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StyledText } from "~components/index";
import { useTheme } from "~hooks/useTheme";

export function HelpModalMenuButton({
  onPress,
}: {
  onPress: () => void;
}): JSX.Element {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <MaterialIcons
        name="menu"
        size={32}
        color={theme.custom.colors.fontColor}
      />
    </Pressable>
  );
}

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
  const theme = useTheme();
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
        backgroundColor: theme.custom.colors.background,
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
  const theme = useTheme();
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
        backgroundColor: theme.custom.colors.background,
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
  children: JSX.Element;
  onLayout: (data: any) => void;
}): JSX.Element {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  return (
    <BottomSheetView
      onLayout={onLayout}
      style={[
        styles.containerStyle,
        {
          paddingBottom: insets.bottom + 12,
          backgroundColor: theme.custom.colors.background,
        },
      ]}
      {...props}
    >
      {children}
    </BottomSheetView>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 16,
    right: 32,
    zIndex: 999,
  },
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
