import { Animated } from "react-native";
import { useActiveWallet } from "@coral-xyz/recoil";
import { useTheme } from "@coral-xyz/tamagui";
import { ArrowBack } from "@mui/icons-material";
import { HeaderBackButton } from "@react-navigation/elements";
import type { NavigationProp } from "@react-navigation/native";
import { CommonActions } from "@react-navigation/native";
import type { StackNavigationOptions } from "@react-navigation/stack";

import { CloseButton } from "../../components/common/Layout/Drawer";
import { WalletDrawerButton } from "../../components/common/WalletList";
import { SettingsButton } from "../../components/Unlocked/Settings";
import { AvatarPopoverButton } from "../../components/Unlocked/Settings/AvatarPopover";

import { Routes as WalletsNavigatorRoutes } from "./WalletsNavigator";

const forSlide = ({ current, next, inverted, layouts: { screen } }: any) => {
  const progress = Animated.add(
    current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: "clamp",
    }),
    next
      ? next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
          extrapolate: "clamp",
        })
      : 0
  );

  return {
    cardStyle: {
      transform: [
        {
          translateX: Animated.multiply(
            progress.interpolate({
              inputRange: [0, 1, 2],
              outputRange: [
                screen.width, // Focused, but offscreen in the beginning
                0, // Fully focused
                screen.width * -0.3, // Fully unfocused
              ],
              extrapolate: "clamp",
            }),
            inverted
          ),
        },
      ],
    },
  };
};

export const headerStyles = {
  animationEnabled: true,
  cardStyleInterpolator: forSlide,
  headerShadowVisible: false,
  headerBackTitleVisible: false,
  headerTitleStyle: {
    fontSize: 18,
    fontFamily: "Inter",
  },
  headerStyle: {
    height: 56,
    paddingHorizontal: 16,
  },
  headerTitleContainerStyle: {
    paddingVertical: 10,
  },
  headerTitleAlign: "center",
} as StackNavigationOptions;

export const screenStyles = {
  headerTitleAlign: "center",
};

export const maybeCloseButton = (
  showClose: boolean,
  navigation: any,
  closeBehavior?: CloseBehavior
) => {
  if (showClose) {
    return {
      headerLeft: headerLeftCloseButton(
        navigation,
        closeBehavior ?? "pop-root-twice"
      ),
    };
  } else {
    return {
      headerLeft: headerLeftBackButton(navigation),
    };
  }
};

export const headerLeftBackButton =
  (navigation: any) =>
  (props: React.ComponentProps<typeof HeaderButtonWrapper>) => {
    const theme = useTheme();
    return (
      <HeaderButtonWrapper
        {...props}
        onPress={() => navigation.goBack()}
        backImage={(_props: any) => (
          <ArrowBack style={{ color: theme.baseIcon.val }} />
        )}
      />
    );
  };

type CloseBehavior =
  | "go-back"
  | "pop-root-go-back"
  | "pop-root-once"
  | "pop-root-twice"
  | "reset";

export const headerLeftCloseButton =
  (
    navigation: NavigationProp<any>,
    closeBehavior: CloseBehavior | (() => void)
  ) =>
  (props: any) => {
    return (
      <HeaderButtonWrapper
        {...props}
        onPress={
          typeof closeBehavior === "function"
            ? closeBehavior
            : () => {
                switch (closeBehavior) {
                  case "go-back":
                    navigation.goBack();
                    break;
                  case "pop-root-once":
                    // @ts-ignore
                    navigation.popToTop();
                    break;
                  case "pop-root-twice":
                    // @ts-ignore
                    navigation.popToTop();
                    // @ts-ignore
                    navigation.popToTop();
                    break;
                  case "pop-root-go-back":
                    // @ts-ignore
                    navigation.popToTop();
                    navigation.goBack();
                    break;
                  case "reset":
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [
                          {
                            name: WalletsNavigatorRoutes.TabsNavigator,
                          },
                        ],
                      })
                    );
                    break;
                  default:
                    throw new Error("case not found");
                }
              }
        }
        backImage={(_props: any) => <CloseButton onClick={() => {}} />}
      />
    );
  };

export function HeaderButtonWrapper(
  props: React.ComponentProps<typeof HeaderBackButton>
) {
  return (
    <HeaderBackButton
      {...props}
      style={{
        width: 24,
        height: 24,
        marginLeft: 16,
        marginRight: 16,
      }}
    />
  );
}

export function rootNavHeaderOptions({ navigation }: { navigation: any }): any {
  return {
    title: "",
    headerTitleAlign: "center",
    headerTitle: () => <ActiveWalletDrawerButton navigation={navigation} />,
    headerLeft: () => (
      <NavButtonContainer>
        <AvatarPopoverButton />
      </NavButtonContainer>
    ),
    headerRight: () => (
      <NavButtonContainer>
        <SettingsButton />
      </NavButtonContainer>
    ),
  };
}

export function NavButtonContainer({ children }: any) {
  return (
    <div style={{ marginLeft: "16px", marginRight: "16px" }}>{children}</div>
  );
}

function ActiveWalletDrawerButton({ navigation }: { navigation: any }) {
  const activeWallet = useActiveWallet();
  return <WalletDrawerButton wallet={activeWallet} navigation={navigation} />;
}
