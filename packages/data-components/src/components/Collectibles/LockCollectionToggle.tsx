import { LOCKABLE_COLLECTIONS } from "@coral-xyz/common";
import { secureUserAtom, userClientAtom } from "@coral-xyz/recoil";
import type { XStackProps } from "@coral-xyz/tamagui";
import { StyledText, Switch, XStack } from "@coral-xyz/tamagui";
import { useRecoilValue } from "recoil";

export function LockCollectionToggle({
  collectionAddress,
  collectionName,
  ...StackProps
}: { collectionName: string; collectionAddress: string } & XStackProps) {
  const user = useRecoilValue(secureUserAtom);
  const userClient = useRecoilValue(userClientAtom);
  const lockedCollections: string[] = [
    ...(user.preferences.lockedCollections ?? []),
  ];
  const filteredCollection = lockedCollections.filter(
    (c) => c !== collectionAddress
  );
  const isLocked = filteredCollection.length < lockedCollections.length;

  if (!LOCKABLE_COLLECTIONS.includes(collectionAddress)) {
    return null;
  }

  const onLockToggle: XStackProps["onPress"] = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await userClient.updateUserPreferences({
      uuid: user.user.uuid,
      preferences: {
        lockedCollections: isLocked
          ? filteredCollection
          : [...lockedCollections, collectionAddress],
      },
    });
  };

  return (
    <XStack
      {...StackProps}
      space="$2"
      cursor="pointer"
      justifyContent="space-between"
      alignItems="center"
      onPress={onLockToggle}
    >
      <StyledText>
        {`Lock ${collectionName ? collectionName + " " : ""}collection`}
      </StyledText>
      <Switch
        size="$2"
        padding={2}
        borderWidth={0}
        backgroundColor={!isLocked ? "$baseTextMedEmphasis" : "$accentBlue"}
        checked={isLocked}
        onPress={onLockToggle}
      >
        <Switch.Thumb
          backgroundColor="$baseBackgroundL0"
          animation="quick"
          borderWidth="$0"
        />
      </Switch>
    </XStack>
  );
}
