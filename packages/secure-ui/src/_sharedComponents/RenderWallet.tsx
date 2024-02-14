import { formatWalletAddress } from "@coral-xyz/common";
import { secureUserAtom, useAvatarUrl } from "@coral-xyz/recoil";
import { UserPublicKeyInfo } from "@coral-xyz/secure-background/types";
import {
  IncognitoAvatar,
  ProxyImage,
  Stack,
  StyledText,
  XStack,
} from "@coral-xyz/tamagui";
import { useRecoilValue } from "recoil";

export function RenderWallet({
  publicKey,
  walletName,
}: {
  publicKey: string;
  username?: string;
  walletName?: string;
}) {
  const user = useRecoilValue(secureUserAtom);
  let wallet: UserPublicKeyInfo | undefined;

  if (!walletName) {
    Object.values(user.publicKeys.platforms).find((platform) => {
      const found = Object.entries(platform.publicKeys).find(
        ([wallet, info]) => publicKey.toLowerCase() === wallet.toLowerCase()
      );
      if (found) {
        wallet = found[1];
      }
      return !!wallet;
    });
  }

  return (
    <XStack flex={1} alignItems="center" justifyContent="flex-start" space="$2">
      {wallet || walletName ? (
        <XStack space="$2" overflow="hidden" flexShrink={1} alignItems="center">
          <IncognitoAvatar size={22} fontSize="$xs" uuid={user.user.uuid} />
          <StyledText
            // fontWeight="$bold"
            fontSize="$sm"
            color="$baseTextHighEmphasis"
            whiteSpace="nowrap"
            ellipse
          >
            {walletName ?? wallet?.name}
          </StyledText>
        </XStack>
      ) : null}
      <XStack flexShrink={0}>
        <StyledText fontSize="$sm" color="$baseTextMedEmphasis">
          {formatWalletAddress(publicKey, 5)}
        </StyledText>
      </XStack>
    </XStack>
  );
}
