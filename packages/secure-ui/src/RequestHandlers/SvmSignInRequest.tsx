import type { QueuedUiRequest } from "../_atoms/requestAtoms";

import { useState } from "react";

import { Blockchain } from "@coral-xyz/common";
import { secureUserAtom } from "@coral-xyz/recoil";
import { StyledText, YStack } from "@coral-xyz/tamagui";
import { type SolanaSignInInput } from "@solana/wallet-standard-features";
import { decode } from "bs58";
import { useRecoilValue } from "recoil";

import { RequireUserUnlocked } from "../RequireUserUnlocked/RequireUserUnlocked";
import { ApproveMessage } from "../_sharedComponents/ApproveMessage";
import { IsColdWalletWarning } from "../_sharedComponents/IsColdWalletWarning";
import { Warning } from "../_sharedComponents/Warning";

export function SvmSignInRequest({
  currentRequest,
}: {
  currentRequest: QueuedUiRequest<"SECURE_SVM_SIGN_IN">;
}) {
  const msgBuffer = Buffer.from(
    decode(currentRequest.uiOptions.message! ?? "")
  );
  const message = msgBuffer.toString();
  const user = useRecoilValue(secureUserAtom);
  const [coldWalletWarningIgnored, setColdWalletWarningIgnored] =
    useState(false);

  const publicKeyInfo =
    user.publicKeys.platforms[Blockchain.SOLANA]?.publicKeys[
      currentRequest.uiOptions.publicKey
    ];
  if (
    !coldWalletWarningIgnored &&
    publicKeyInfo?.isCold &&
    ["xnft", "browser"].includes(currentRequest.event.origin.context)
  ) {
    return (
      <IsColdWalletWarning
        origin={currentRequest.event.origin.address}
        onDeny={() => currentRequest.error(new Error("Approval Denied"))}
        onIgnore={() => setColdWalletWarningIgnored(true)}
      />
    );
  }

  const verificationErrors = verify(currentRequest.request.input ?? {}, {
    expectedAddress: currentRequest.uiOptions.publicKey,
    expectedURL: currentRequest.event.origin.address,
    issuedAtThreshold: 1000 * 60 * 10, // 10min -> same as phantom.
  });

  return (
    <RequireUserUnlocked
      onReset={() => currentRequest.error(new Error("Login Failed"))}
    >
      <ApproveMessage
        currentRequest={currentRequest}
        title="Sign In with Solana"
        publicKey={currentRequest.uiOptions.publicKey}
        message={message}
        blockchain={Blockchain.SOLANA}
        prepend={
          verificationErrors.length > 0 ? (
            <Warning
              warning={{
                severity: "CRITICAL",
                kind: "error",
                message: (
                  <YStack space="$4">
                    <StyledText color="$redText">
                      This sign-in request is invalid. This either means the
                      site is unsafe, or its developer made an error when
                      sending the request:
                    </StyledText>
                    <YStack space="$2">
                      {verificationErrors.map((error) => (
                        <StyledText color="$redText" key={error}>
                          {error}
                        </StyledText>
                      ))}
                    </YStack>
                  </YStack>
                ),
              }}
            />
          ) : null
        }
      />
    </RequireUserUnlocked>
  );
}

// https://github.com/phantom/sign-in-with-solana?tab=readme-ov-file#full-feature-demo
enum VerificationErrorType {
  // ADDRESS_MISMATCH = "ADDRESS_MISMATCH",
  // CHAIN_ID_MISMATCH = "CHAIN_ID_MISMATCH",
  DOMAIN_MISMATCH = "Domain does not match requesting domain",
  URI_MISMATCH = "Uri origin does not match requesting domain",
  EXPIRED = "Sign-in request is expired",
  ISSUED_TOO_FAR_IN_THE_PAST = "Sign-in request issued too far in the past",
  ISSUED_TOO_FAR_IN_THE_FUTURE = "Sign-in request issued too far in the future",
  EXPIRES_BEFORE_ISSUANCE = "Sign-in request expires before it's issued",
  VALID_AFTER_EXPIRATION = "Sign-in request expires before it's valid",
}

type VerificationOptions = {
  expectedAddress: string;
  expectedURL: string;
  expectedChainId?: string;
  issuedAtThreshold: number;
};

function verify(data: SolanaSignInInput, opts: VerificationOptions) {
  const {
    expectedAddress,
    expectedURL: _expectedURL,
    expectedChainId,
    issuedAtThreshold,
  } = opts;
  const errors: VerificationErrorType[] = [];
  const now = Date.now();
  const expectedURL = new URL(_expectedURL);

  // // verify if parsed address is same as the expected address
  // if (data.address && data.address !== expectedAddress) {
  //   errors.push(VerificationErrorType.ADDRESS_MISMATCH);
  // }

  // verify if parsed domain is same as the expected domain
  if (data.domain !== expectedURL.host) {
    errors.push(VerificationErrorType.DOMAIN_MISMATCH);
  }

  // verify if parsed uri is same as the expected uri
  if (data.uri && new URL(data.uri).origin !== expectedURL.origin) {
    errors.push(VerificationErrorType.URI_MISMATCH);
  }

  // // verify if parsed chainId is same as the expected chainId
  // if (data.chainId && data.chainId !== expectedChainId) {
  //   errors.push(VerificationErrorType.CHAIN_ID_MISMATCH);
  // }

  // verify if parsed issuedAt is within +- issuedAtThreshold of the current timestamp
  // NOTE: Phantom's issuedAtThreshold is 10 minutes
  if (data.issuedAt) {
    const iat = new Date(data.issuedAt).getTime();
    if (Math.abs(iat - now) > issuedAtThreshold) {
      if (iat < now) {
        errors.push(VerificationErrorType.ISSUED_TOO_FAR_IN_THE_PAST);
      } else {
        errors.push(VerificationErrorType.ISSUED_TOO_FAR_IN_THE_FUTURE);
      }
    }
  }

  // verify if parsed expirationTime is:
  // 1. after the current timestamp
  // 2. after the parsed issuedAt
  // 3. after the parsed notBefore
  if (data.expirationTime) {
    const exp = new Date(data.expirationTime).getTime();
    if (exp <= now) {
      errors.push(VerificationErrorType.EXPIRED);
    }
    if (data.issuedAt && exp < new Date(data.issuedAt).getTime()) {
      errors.push(VerificationErrorType.EXPIRES_BEFORE_ISSUANCE);
    }
    // Not Before
    if (data.notBefore) {
      const nbf = new Date(data.notBefore).getTime();
      if (nbf > exp) {
        errors.push(VerificationErrorType.VALID_AFTER_EXPIRATION);
      }
    }
  }
  return errors;
}
