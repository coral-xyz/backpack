import {
  BACKPACK_LINK,
  DISCORD_INVITE_LINK,
  TWITTER_LINK,
} from "@coral-xyz/common";
import { rawSecureUserAtom, userClientAtom } from "@coral-xyz/recoil";
import {
  openUrl,
  ArrowUpRightIcon,
  ChevronRightIcon,
  CustomScrollView,
  DiscordIcon,
  Sheet,
  ShoppingBagIcon,
  Stack,
  Text,
  TwitterIcon,
  UserCircleIcon,
  useTheme,
  XStack,
  StyledText,
} from "@coral-xyz/tamagui";
import { useRecoilValue, useResetRecoilState } from "recoil";

export function LockedMenuDrawer({
  onOpenChange,
  open,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const userClient = useRecoilValue(userClientAtom);
  const theme = useTheme();
  const handleReset = async () => {
    await userClient.resetBackpack();
  };

  const links = [
    {
      label: "Backpack.app",
      icon: <ShoppingBagIcon color="$baseIcon" size="$1xl" />,
      url: BACKPACK_LINK,
    },
    {
      label: "Twitter",
      icon: <TwitterIcon width={20} height={20} fill={theme.baseIcon.val} />,
      url: TWITTER_LINK,
    },
    {
      label: "Need help? Hop into Discord",
      icon: <DiscordIcon width={20} height={20} fill={theme.baseIcon.val} />,
      url: DISCORD_INVITE_LINK,
    },
  ];

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[40]}
      zIndex={100_000}
      animation="quick"
    >
      <Sheet.Overlay backgroundColor="$baseBackgroundL2" opacity={0.8} />
      <Sheet.Frame position="relative" backgroundColor="$baseBackgroundL0">
        <CustomScrollView
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
          }}
        >
          <Stack
            height="100%"
            width="100%"
            // TODO see if display:flex is necessary since it should be the default
            // eslint-disable-next-line
            display="flex"
            justifyContent="space-between"
          >
            <Stack
              borderRadius="$medium"
              marginVertical="$4"
              marginHorizontal="$3"
              overflow="hidden"
              backgroundColor="$baseBackgroundL1"
            >
              <XStack
                key="reset"
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                gap="$2"
                padding="$2.5"
                paddingLeft="$3"
                hoverStyle={{
                  backgroundColor: "rgba(0,0,0,0.2)",
                }}
                onPress={handleReset}
              >
                <Stack
                  height="$2"
                  width="$2"
                  justifyContent="center"
                  alignItems="center"
                >
                  <UserCircleIcon color="$baseIcon" size="$1xl" />
                </Stack>
                <StyledText flexGrow={1} fontSize={16} fontWeight="500">
                  Reset Backpack
                </StyledText>
                <Stack
                  height="$2"
                  width="$2"
                  justifyContent="center"
                  alignItems="center"
                >
                  <ChevronRightIcon color="$baseIcon" size="$xl" />
                </Stack>
              </XStack>
              {links.map((link) => (
                <XStack
                  key={link.label}
                  alignItems="center"
                  cursor="pointer"
                  onPress={() => {
                    onOpenChange(false);
                    openUrl(link.url, "_blank");
                  }}
                  gap="$2"
                  padding="$2.5"
                  paddingLeft="$3"
                  hoverStyle={{
                    backgroundColor: "rgba(0,0,0,0.2)",
                  }}
                >
                  <Stack
                    height="$2"
                    width="$2"
                    justifyContent="center"
                    alignItems="center"
                  >
                    {link.icon}
                  </Stack>
                  <StyledText
                    color="$baseTextHighEmphasis"
                    flexGrow={1}
                    fontSize={16}
                    fontWeight="500"
                  >
                    {link.label}
                  </StyledText>
                  <Stack
                    height="$2"
                    width="$2"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <ArrowUpRightIcon color="$baseIcon" size="$xl" />
                  </Stack>
                </XStack>
              ))}
            </Stack>
          </Stack>
        </CustomScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}
