import { useState } from "react";
import { openPopupWindow } from "@coral-xyz/common";
import { ErrorCrossMarkIcon, HardwareIcon, Loader, PrimaryButton, StyledText, SuccessCheckMarkIcon, YStack } from "@coral-xyz/tamagui";
import TransportWebHid from "@ledgerhq/hw-transport-webhid";

import { OptionsContainer } from ".";

export const LedgerPermissions = () => {
  const [isError, setIsError] = useState(false);
  const [isDone, setIsDone] = useState(false);

  return (
    <OptionsContainer>
      <YStack gap={40} width={450}>
        <YStack gap={16}>
          <StyledText fontSize={36} textAlign="center">
            Connect your Ledger
          </StyledText>
        </YStack>

        {isError ? (
          <YStack alignItems="center">
            <ErrorCrossMarkIcon
              height={100}
              width={100}
            />
          </YStack>
        ) : isDone ? (
          <YStack alignItems="center">
            <SuccessCheckMarkIcon
              height={100}
              width={100}
            />
          </YStack>
        ) : (
          <YStack alignItems="center">
            <Loader thickness={2} size={100} />
            <HardwareIcon
              style={{
                position: "absolute",
                marginTop: 25,
              }}
              height={48}
              width={48}
            />
          </YStack>
        )}
        <YStack>
          {isDone ? (
            <PrimaryButton
              label="Open Backpack"
              onPress={() => {
                void openPopupWindow("popup.html");
              }}
            />
          ) : (
            <PrimaryButton
              label={isError ? "Try Again" : "Connect"}
              onPress={
                () => {
                  setIsError(false);
                  TransportWebHid.create().then(() => {
                    setIsDone(true)
                  }).catch(e => {
                    setIsError(true)
                    console.error(e)
                  })
                }}
            />
          )}
        </YStack>
      </YStack>
    </OptionsContainer >
  );
}