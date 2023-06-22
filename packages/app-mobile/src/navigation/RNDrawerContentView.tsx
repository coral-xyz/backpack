// NOTE: copied over from @react-navigation directly. this is DrawerContentScrollView, I just didn't need the scroll
import * as React from "react";
import { I18nManager, ViewProps, StyleSheet, View } from "react-native";

import DrawerPositionContext from "@react-navigation/drawer/src/utils/DrawerPositionContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = ViewProps & {
  children: React.ReactNode;
};

function DrawerContentView(
  { style, children, ...rest }: Props,
  ref?: React.Ref<View>
) {
  const drawerPosition = React.useContext(DrawerPositionContext);
  const insets = useSafeAreaInsets();

  const isRight = I18nManager.getConstants().isRTL
    ? drawerPosition === "left"
    : drawerPosition === "right";

  return (
    <View
      {...rest}
      ref={ref}
      style={[
        styles.container,
        {
          paddingTop: insets.top + 4,
          paddingStart: !isRight ? insets.left : 0,
          paddingEnd: isRight ? insets.right : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export default React.forwardRef(DrawerContentView);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
