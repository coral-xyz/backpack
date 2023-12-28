import type { Blockchain } from "@coral-xyz/common";
import type { SecureEventOrigin } from "@coral-xyz/secure-clients/types";

import { formatWalletAddress, UNKNOWN_ICON_SRC } from "@coral-xyz/common";
import { secureUserAtom } from "@coral-xyz/recoil";
import {
  IncognitoAvatar,
  Stack,
  StyledText,
  UserAvatar,
  XStack,
  YStack,
  Image,
} from "@coral-xyz/tamagui";
import { useRecoilValue } from "recoil";

import { displayOriginTitle } from "../_utils/displayOriginTitle";

export function OriginUserHeader({
  origin,
  publicKey,
  blockchain,
}: {
  origin: SecureEventOrigin;
  publicKey: string;
  blockchain: Blockchain;
}) {
  return (
    <XStack justifyContent="space-around" space="$2">
      <Stack width="50%">
        <OriginHeader origin={origin} />
      </Stack>
      <Stack width="50%">
        <UserHeader publicKey={publicKey} blockchain={blockchain} />
      </Stack>
    </XStack>
  );
}

export function OriginHeader({ origin }: { origin: SecureEventOrigin }) {
  const siteIcon =
    origin.address.startsWith("http") && !origin.address.includes("localhost")
      ? `https://www.google.com/s2/favicons?domain=${origin.address}&sz=180`
      : UNKNOWN_ICON_SRC;

  return (
    <Entity
      icon={
        <Image
          style={{ height: 80, width: 80 }}
          source={{ height: 80, width: 80, uri: siteIcon }}
        />
      }
      title={displayOriginTitle(origin.name)}
      subtitle={origin.address}
    />
  );
}

export function UserHeader({
  publicKey,
  blockchain,
}: {
  publicKey: string;
  blockchain: Blockchain;
}) {
  const user = useRecoilValue(secureUserAtom);
  const publicKeyInfo =
    user.publicKeys.platforms[blockchain]?.publicKeys[publicKey];

  const printWalletAddress = formatWalletAddress(publicKey);

  return (
    <Entity
      icon={<IncognitoAvatar size={80} uuid={user.user.uuid} />}
      title={publicKeyInfo?.name ?? user.user.username}
      subtitle={printWalletAddress}
    />
  );
}

function Entity({
  icon,
  title,
  subtitle,
}: {
  icon: JSX.Element;
  title: string | JSX.Element;
  subtitle: string | JSX.Element;
}) {
  return (
    <YStack ai="center" space="$2">
      <Stack
        width={80}
        height={80}
        borderRadius="$circular"
        overflow="hidden"
        backgroundColor="$baseBackgroundL1"
      >
        {icon}
      </Stack>
      <StyledText
        // eslint-disable-next-line
        style={
          {
            //@ts-ignore this exists
            // wordBreak: "break-all",
          }
        }
        flexShrink={1}
        fontSize="$md"
        ta="center"
        color="$baseTextHighEmphasis"
      >
        {title}
      </StyledText>
      <StyledText
        // eslint-disable-next-line
        style={
          {
            //@ts-ignore this exists
            // wordBreak: "break-all",
          }
        }
        fontSize="$xs"
        ta="center"
        color="$baseTextMedEmphasis"
      >
        {subtitle}
      </StyledText>
    </YStack>
  );
}
