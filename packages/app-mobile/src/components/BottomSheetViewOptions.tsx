import { useState } from "react";
import { Alert, View } from "react-native";

import {
  BottomSheetTitle,
  YGroup,
  ListItem,
  Separator,
} from "@coral-xyz/tamagui";
import { Percent, EyeOff, AlignLeft } from "@tamagui/lucide-icons";

import { BetterBottomSheet } from "~components/BottomSheetModal";
import { HeaderDropdownButton } from "~navigation/components";

function Container({ navigation }) {
  return (
    <View>
      <BottomSheetTitle title="View Options" />
      <GroupedViewOptions />
    </View>
  );
}

export function BottomSheetViewOptions({
  navigation,
  tintColor,
  title,
}): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <HeaderDropdownButton
        onPress={() => {
          setIsVisible(!isVisible);
        }}
        tintColor={tintColor}
      >
        {title}
      </HeaderDropdownButton>
      <BetterBottomSheet
        isVisible={isVisible}
        resetVisibility={() => {
          setIsVisible(false);
        }}
      >
        <Container navigation={navigation} />
      </BetterBottomSheet>
    </>
  );
}

function GroupedViewOptions() {
  const handleTODO = () => {
    Alert.alert("TODO");
  };

  return (
    <YGroup bg="$nav" separator={<Separator />}>
      <YGroup.Item>
        <ListItem
          bg="$nav"
          hoverTheme
          icon={AlignLeft}
          title="Group by"
          onPress={handleTODO}
        />
      </YGroup.Item>
      <YGroup.Item>
        <ListItem
          bg="$nav"
          pressTheme
          icon={Percent}
          title="Show 24 hour change"
          onPress={handleTODO}
        />
      </YGroup.Item>
      <YGroup.Item>
        <ListItem
          bg="$nav"
          pressTheme
          icon={EyeOff}
          title="Hide zero balances"
          onPress={handleTODO}
        />
      </YGroup.Item>
    </YGroup>
  );
}
