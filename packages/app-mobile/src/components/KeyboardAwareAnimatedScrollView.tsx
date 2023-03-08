import React from "react";
import { Dimensions, TextInput, ScrollView } from "react-native";

import Animated, {
  useAnimatedKeyboard,
  useAnimatedReaction,
  runOnJS,
  KeyboardState,
  useAnimatedProps,
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedRef,
} from "react-native-reanimated";

export function withReanimatedKeyboardAwareScrollView<
  T extends typeof ScrollView
>(Component: T) {
  const AnimatedScrollView = Animated.createAnimatedComponent(Component);
  return function KeyboardAwareReanimatedScrollView(
    props: React.ComponentProps<typeof ScrollView>
  ) {
    const scrollY = useSharedValue(0);
    const keyboard = useAnimatedKeyboard();
    const scrollViewRef = useAnimatedRef<ScrollView>();

    const performScroll = () => {
      TextInput.State.currentlyFocusedInput()?.measure(
        (x, y, width, textInputHeight, pageX, textInputPageY) => {
          const textinputBottomY = textInputPageY + textInputHeight;
          const keyboardTopY =
            Dimensions.get("screen").height - keyboard.height.value;
          // check whether the text input is covered by the keyboard
          if (textinputBottomY < keyboardTopY) {
            return;
          }

          scrollViewRef?.current?.scrollTo({
            y: scrollY.value + textinputBottomY - keyboardTopY,
          });
        }
      );
    };

    useAnimatedReaction(
      () => {
        return keyboard.state.value;
      },
      (keyboardState) => {
        if (keyboardState === KeyboardState.OPEN) {
          runOnJS(performScroll)();
        }
      }
    );

    const containerPaddingStyle = useAnimatedProps(() => {
      return {
        paddingBottom: keyboard.height.value,
      };
    });

    const handler = useAnimatedScrollHandler(
      {
        onScroll: (e) => {
          scrollY.value = e.contentOffset.y;
        },
      },
      []
    );

    return (
      <AnimatedScrollView
        {...props}
        ref={scrollViewRef}
        scrollEventThrottle={16}
        onScroll={handler}
      >
        {props.children}
        <Animated.View style={containerPaddingStyle} />
      </AnimatedScrollView>
    );
  };
}

export const KeyboardAwareAnimatedScrollView =
  withReanimatedKeyboardAwareScrollView(ScrollView);
