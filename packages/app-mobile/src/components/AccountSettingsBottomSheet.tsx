import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable } from "react-native";

import { UI_RPC_METHOD_KEYRING_STORE_LOCK } from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import {
  Separator,
  StyledText,
  YGroup,
  _ListItemOneLine,
  getIcon,
} from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";

import { BetterBottomSheet } from "~components/BottomSheetModal";
import { useTheme } from "~hooks/useTheme";

import { ArrowRightIcon } from "./Icon";

export function SettingsList({ navigation }): JSX.Element {
  const background = useBackgroundClient();

  const lockWallet = useCallback(async () => {
    try {
      await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
        params: [],
      });
    } catch (error: any) {
      Alert.alert("Error locking wallet", error.message);
    }
  }, [background]);

  const groupedMenuItems = useMemo(
    () => [
      [
        {
          label: "Wallets",
          iconName: "account-balance-wallet",
          route: "edit-wallets",
          icon: getIcon("account-balance-wallet"),
        },
      ],
      [
        {
          label: "Your Account",
          iconName: "account-circle",
          route: "YourAccount",
          icon: getIcon("account-circle"),
        },
        {
          label: "Preferences",
          iconName: "settings",
          route: "Preferences",
          icon: getIcon("settings"),
        },
        {
          label: "Lock",
          iconName: "lock",
          onPress: lockWallet,
          hideArrow: true,
          icon: getIcon("lock"),
        },
      ],
      [{ label: "About Backpack", route: "about-backpack" }],
    ],
    [lockWallet]
  );

  return (
    <>
      {groupedMenuItems.map((group, index) => (
        <YGroup
          overflow="hidden"
          borderWidth={2}
          borderColor="$borderFull"
          borderRadius="$container"
          marginBottom={16}
          key={JSON.stringify(index)}
          separator={<Separator />}
        >
          {group.map((item) => (
            <YGroup.Item key={item.label}>
              <_ListItemOneLine
                title={item.label}
                icon={item.icon}
                iconAfter={item.hideArrow ? null : <ArrowRightIcon />}
                onPress={() => {
                  if (item.onPress) {
                    item.onPress();
                  } else {
                    navigation.push(item.route);
                  }
                }}
              />
            </YGroup.Item>
          ))}
        </YGroup>
      ))}
    </>
  );
}

export function AccountSettingsBottomSheet({ navigation }): JSX.Element {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => {
          setIsVisible(true);
        }}
        style={{ paddingHorizontal: 16 }}
      >
        <MaterialIcons
          name="settings"
          size={28}
          color={theme.custom.colors.fontColor}
        />
      </Pressable>
      <BetterBottomSheet
        isVisible={isVisible}
        resetVisibility={() => {
          setIsVisible(false);
        }}
      >
        <StyledText fontSize="$lg" fontWeight="$800" textAlign="center">
          Settings
        </StyledText>
        <SettingsList navigation={navigation} />
      </BetterBottomSheet>
    </>
  );
}
