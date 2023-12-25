import type { QueuedUiRequest } from "../_atoms/requestAtoms";

import {
  activeBlockchainWallet,
  getBlockchainLogo,
  secureUserAtom,
  useBlockchainActiveWallet,
} from "@coral-xyz/recoil";
import {
  CheckIcon,
  Stack,
  StyledText,
  XStack,
  Image,
} from "@coral-xyz/tamagui";
import { useRecoilValue } from "recoil";

import { ImpersonateMetamaskInfo } from "./ImpersonateMetamaskInfo";
import { RequireUserUnlocked } from "../RequireUserUnlocked/RequireUserUnlocked";
import { ErrorMessage } from "../_sharedComponents/ErrorMessage";
import { OriginHeader } from "../_sharedComponents/OriginHeader";
import { RequestConfirmation } from "../_sharedComponents/RequestConfirmation";
import { RequestHeader } from "../_sharedComponents/RequestHeader";
import { WalletSwitcher } from "../_sharedComponents/WalletSwitcher";
import { displayOriginTitle } from "../_utils/displayOriginTitle";

export function ApproveOriginRequest({
  currentRequest,
}: {
  currentRequest: QueuedUiRequest<"SECURE_USER_APPROVE_ORIGIN">;
}) {
  const blockchain = currentRequest.request.blockchain;
  const user = useRecoilValue(secureUserAtom);
  const activeWallet = useRecoilValue(activeBlockchainWallet(blockchain));
  const blockchainIcon = getBlockchainLogo(blockchain);

  if (!activeWallet) {
    return (
      <Stack height="100%" width="100%" backgroundColor="$baseBackgroundL0">
        <ErrorMessage
          icon={(iconProps) => (
            <Image
              {...iconProps}
              source={{
                width: 36,
                height: 36,
                uri: blockchainIcon,
              }}
            />
          )}
          title="No wallet found"
          body="Add a new wallet to connect to this dApp."
        />
      </Stack>
    );
  }

  if (
    !user.preferences.confirmedMetaMaskSetting &&
    ["xnft", "browser"].includes(currentRequest.event.origin.context) &&
    currentRequest.request.impersonatingMetaMask
  ) {
    return <ImpersonateMetamaskInfo />;
  }

  const onApprove = () =>
    currentRequest.respond({
      confirmed: true,
      publicKey: activeWallet.publicKey,
    });

  const onDeny = () => currentRequest.error(new Error("Approval Denied"));

  return (
    <RequireUserUnlocked
      allowLazyUnlock
      onReset={() => currentRequest.error(new Error("Login Failed"))}
    >
      <WalletSwitcher blockchain={blockchain} paddingTop="$4">
        <RequestConfirmation
          paddingTop="$4"
          onApprove={onApprove}
          onDeny={onDeny}
        >
          <Stack space="$8">
            <RequestHeader>
              {`${displayOriginTitle(currentRequest.request.origin.name)}`}
              {/* <br /> */} would like to connect!
            </RequestHeader>
            <OriginHeader origin={currentRequest.request.origin} />
            <Stack margin="$4" space="$4">
              <StyledText fontWeight="$semiBold">
                This app would like to:
              </StyledText>
              <Stack ml="$2" space="$2">
                {currentRequest.request.origin.context !== "xnft" ? (
                  <XStack space="$2">
                    <CheckIcon color="$greenIcon" />
                    <StyledText>View wallet balance & activity</StyledText>
                  </XStack>
                ) : null}
                <XStack space="$2">
                  <CheckIcon color="$greenIcon" />
                  <StyledText>Request approval for transactions</StyledText>
                </XStack>
              </Stack>
            </Stack>
          </Stack>
        </RequestConfirmation>
      </WalletSwitcher>
    </RequireUserUnlocked>
  );
}
