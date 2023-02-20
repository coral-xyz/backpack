import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { Pressable, StyleSheet } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal as _BottomSheetModal,
} from "@gorhom/bottom-sheet";

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

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 16,
    right: 32,
    zIndex: 999,
  },
});

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
