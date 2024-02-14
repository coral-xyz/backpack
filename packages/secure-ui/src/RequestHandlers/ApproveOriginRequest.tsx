import type { QueuedUiRequest } from "../_atoms/requestAtoms";

import { useEffect, useState } from "react";

import { BACKEND_API_URL } from "@coral-xyz/common";
import {
  activeBlockchainWallet,
  getBlockchainLogo,
  secureUserAtom,
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
import { BlockingWarning } from "../_sharedComponents/BlowfishEvaluation";
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
  const isBlocked = useIsBlockedOrigin(currentRequest.event.origin.address);
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

  const onApprove = () =>
    currentRequest.respond({
      confirmed: true,
      publicKey: activeWallet.publicKey,
    });

  const onDeny = () => currentRequest.error(new Error("Approval Denied"));

  if (isBlocked) {
    return (
      <Stack height="100%" width="100%" backgroundColor="$baseBackgroundL0">
        <BlockingWarning
          onDeny={onDeny}
          title="Origin Connection Blocked!"
          warning={{
            severity: "CRITICAL",
            kind: "OriginBlockedWarning",
            message:
              "Backpack has blocked this origin from wallet connections due to malicious or suspicious activity.",
          }}
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

  return (
    <RequireUserUnlocked
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

function useIsBlockedOrigin(origin: string): boolean {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND_API_URL}/v2/graphql`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
        query CheckIsBlockedOrigin($origin: String!) {
          blocked(list: ORIGINS, item: $origin)
        }
      `,
        variables: {
          origin: new URL(origin).host,
        },
      }),
    })
      .then((resp) => resp.json())
      .then((json) => setBlocked(json.data.blocked));
  }, [origin]);

  return blocked;
}
