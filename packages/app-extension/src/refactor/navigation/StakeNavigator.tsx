import { useState } from "react";
import { useTranslation } from "@coral-xyz/i18n";
import { type StakeInfo } from "@coral-xyz/staking/src/shared";
import { useTheme } from "@coral-xyz/tamagui";
import { Add, MoreHoriz } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import type { StackScreenProps } from "@react-navigation/stack";
import { createStackNavigator } from "@react-navigation/stack";

import PopoverMenu from "../../components/common/PopoverMenu";
import { ListStakesScreen } from "../screens/Unlocked/Stake/ListStakesScreen";
import { MergeStakeScreen } from "../screens/Unlocked/Stake/MergeStakeScreen";
import { NewStakeScreen } from "../screens/Unlocked/Stake/NewStakeScreen";
import { StakeConfirmationScreen } from "../screens/Unlocked/Stake/StakeConfirmationScreen";
import { StakeDetailScreen } from "../screens/Unlocked/Stake/StakeDetailScreen";
import { ValidatorSelectorScreen } from "../screens/Unlocked/Stake/ValidatorSelectorScreen";

import { HeaderButtonWrapper, headerStyles, maybeCloseButton } from "./utils";
import type { StakeNavigatorProps } from "./WalletsNavigator";

export enum Routes {
  ListStakesScreen = "ListStakesScreen",
  MergeStakeScreen = "MergeStakeScreen",
  NewStakeScreen = "NewStakeScreen",
  StakeConfirmationScreen = "StakeConfirmationScreen",
  StakeDetailScreen = "StakeDetailScreen",
  ValidatorSelectorScreen = "ValidatorSelectorScreen",
}

type StakeScreenStackNavigatorParamList = {
  [Routes.ListStakesScreen]:
    | {
        forceRefreshKey: string;
      }
    | undefined;
  [Routes.MergeStakeScreen]: { pubkey: string };
  [Routes.NewStakeScreen]: undefined;
  [Routes.StakeConfirmationScreen]: {
    delay?: number;
    signature: string;
    progressTitle: string;
    afterTitle: string;
  };
  [Routes.StakeDetailScreen]: { stake: StakeInfo };
  [Routes.ValidatorSelectorScreen]: undefined;
};

export type StakeScreenProps<
  T extends keyof StakeScreenStackNavigatorParamList,
> = StackScreenProps<StakeScreenStackNavigatorParamList, T>;

const Stack = createStackNavigator<StakeScreenStackNavigatorParamList>();

export function StakeNavigator({
  route: {
    params: { screen },
  },
}: StakeNavigatorProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement>();

  return (
    <Stack.Navigator screenOptions={() => headerStyles}>
      <Stack.Screen
        name={Routes.ListStakesScreen}
        component={ListStakesScreen}
        options={({ navigation }) => {
          return {
            title: t("your_staking_positions"),
            headerRight: () => (
              <HeaderButtonWrapper
                onPress={() => navigation.push(Routes.NewStakeScreen)}
                backImage={() => <Add style={{ color: theme.baseIcon.val }} />}
              />
            ),
            ...maybeCloseButton(true, navigation, "go-back"),
          };
        }}
      />
      <Stack.Screen
        name={Routes.MergeStakeScreen}
        component={MergeStakeScreen}
        options={({ navigation }) => {
          return {
            title: t("merge_stake"),
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.NewStakeScreen}
        component={NewStakeScreen}
        options={({ navigation }) => {
          return {
            title: t("new_stake"),
            ...maybeCloseButton(
              screen == Routes.NewStakeScreen,
              navigation,
              "go-back"
            ),
          };
        }}
      />
      <Stack.Screen
        name={Routes.StakeDetailScreen}
        component={StakeDetailScreen}
        options={({ navigation, route }) => {
          return {
            title: t("stake_detail"),
            headerRight: route.params.stake?.can?.merge
              ? () => {
                  return (
                    <>
                      <IconButton
                        disableRipple
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        // same styles as HeaderButtonWrapper
                        style={{
                          width: "24px",
                          height: "24px",
                          marginLeft: "16px",
                          marginRight: "16px",
                          padding: 0,
                        }}
                      >
                        <MoreHoriz style={{ color: theme.baseIcon.val }} />
                      </IconButton>

                      <PopoverMenu.Root
                        anchorEl={anchorEl}
                        anchorOrigin={{
                          horizontal: "right",
                          vertical: "bottom",
                        }}
                        onClose={() => setAnchorEl(undefined)}
                        open={Boolean(anchorEl)}
                      >
                        <PopoverMenu.Group>
                          <PopoverMenu.Item
                            onClick={() => {
                              setAnchorEl(undefined);
                              navigation.push(Routes.MergeStakeScreen, {
                                pubkey: route.params.stake.pubkey,
                              });
                            }}
                          >
                            {t("merge_stake")}
                          </PopoverMenu.Item>
                        </PopoverMenu.Group>
                      </PopoverMenu.Root>
                    </>
                  );
                }
              : undefined,
            ...maybeCloseButton(false, navigation, "go-back"),
          };
        }}
      />
      <Stack.Screen
        name={Routes.ValidatorSelectorScreen}
        component={ValidatorSelectorScreen}
        options={({ navigation }) => {
          return {
            title: t("select_validator"),
            ...maybeCloseButton(false, navigation, "go-back"),
          };
        }}
      />
      <Stack.Screen
        name={Routes.StakeConfirmationScreen}
        component={StakeConfirmationScreen}
        options={({ route, navigation }) => {
          return {
            title: route.params.progressTitle,
            ...maybeCloseButton(true, navigation, "pop-root-go-back"),
          };
        }}
      />
    </Stack.Navigator>
  );
}
