import { userClientAtom } from "@coral-xyz/recoil";
import {
  Button,
  CustomScrollView,
  QuestionIcon,
  Sheet,
  Stack,
  Text,
  YStack,
} from "@coral-xyz/tamagui";
import { useRecoilValue, useResetRecoilState } from "recoil";

export function ForgotPasswordDrawer({
  onOpenChange,
  open,
}: {
  onOpenChange?: (open: boolean) => void;
  open: boolean;
}) {
  const userClient = useRecoilValue(userClientAtom);

  const handleReset = async () => {
    await userClient.resetBackpack();
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[80]}
      zIndex={100_000}
      animation="quick"
    >
      <Sheet.Overlay backgroundColor="$baseBackgroundL2" opacity={0.8} />
      <Sheet.Frame position="relative">
        <Stack
          height="100%"
          width="100%"
          // TODO display:flex
          // eslint-disable-next-line
          display="flex"
          justifyContent="space-between"
          backgroundColor="$baseBackgroundL0"
        >
          <Stack gap="$4" marginVertical="$6" marginHorizontal="$6">
            <Stack alignItems="center">
              <QuestionIcon color="$baseIcon" />
            </Stack>
            <Text fontSize={24} fontWeight="600" lineHeight="$2xl">
              Forgot your password?
            </Text>
            <Text
              fontSize={14}
              fontWeight="500"
              lineHeight="$md"
              color="$baseTextMedEmphasis"
            >
              We can’t recover your password as it is only stored on your
              computer. You can try more passwords or reset your wallet with the
              secret recovery phrase.
            </Text>
          </Stack>
          <Stack marginVertical="$6" marginHorizontal="$4" gap="$3">
            <Button
              backgroundColor="$buttonSecondaryBackground"
              paddingVertical="$5"
              paddingHorizontal="$4"
              borderRadius="$large"
              borderWidth={0}
              textProps={{
                color: "$buttonSecondaryText",
                fontWeight: "$bold",
              }}
              focusStyle={{
                backgroundColor: "$buttonSecondaryBackground",
              }}
              pressStyle={{
                opacity: 0.8,
              }}
              hoverStyle={{
                backgroundColor: "$buttonSecondaryBackground",
                opacity: 0.9,
              }}
              onPress={() => onOpenChange?.(false)}
            >
              Try more Passwords
            </Button>
            <Button
              backgroundColor="$redText"
              paddingVertical="$5"
              paddingHorizontal="$4"
              borderRadius="$large"
              borderWidth={0}
              textProps={{
                color: "$baseWhite",
                fontWeight: "$bold",
              }}
              focusStyle={{
                backgroundColor: "$redText",
              }}
              pressStyle={{
                opacity: 0.8,
              }}
              hoverStyle={{
                backgroundColor: "$redText",
                opacity: 0.9,
              }}
              onPress={handleReset}
            >
              Reset Backpack
            </Button>
          </Stack>
        </Stack>
      </Sheet.Frame>
    </Sheet>
  );
}
