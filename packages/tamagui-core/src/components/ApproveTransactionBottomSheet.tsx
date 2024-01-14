import { useState } from "react";

import {
  PrimaryButton,
  ProxyImage,
  SecondaryButton,
  Stack,
  StyledText,
  TextArea,
  TwoButtonFooter,
  XStack,
  YStack,
} from "../";

function ResourceThing({ imageUrl, title, subtitle }) {
  return (
    <YStack ai="center">
      <ProxyImage
        size={100}
        src={imageUrl}
        style={{
          marginBottom: 16,
          borderRadius: 50,
        }}
      />
      <StyledText fontSize="$lg" color="$baseTextHighEmphasis">
        {title}
      </StyledText>
      <StyledText fontSize="$sm" color="$baseTextMedEmphasis">
        {subtitle}
      </StyledText>
    </YStack>
  );
}

export function ApproveTransactionBottomSheet() {
  const [message, setMessage] = useState("");
  // i have a <Screen> component that handles insets, etc. Might want to make Screen.web.tsx that just handles padding
  return (
    <YStack f={1} jc="space-between" pb={48} pt={64} px={16}>
      <Stack>
        <StyledText mb={48} textAlign="center">
          Approve Message
        </StyledText>
        <XStack jc="space-around" ai="center">
          <ResourceThing
            imageUrl="https://picsum.photos/200.jpg"
            title="Example Client"
            subtitle="localhost:1234"
          />
          <ResourceThing
            imageUrl="https://picsum.photos/200.jpg"
            title="ph101pp"
            subtitle="Wallet 1 (abc..xyz)"
          />
        </XStack>
      </Stack>
      <Stack>
        <StyledText mb={8}>Message</StyledText>
        <TextArea
          borderColor="$borderFull"
          borderWidth={2}
          autoFocus
          bg="$baseBackgroundL1"
          height={128}
          value={message}
          placeholder="Enter message"
          onChangeText={setMessage}
          mb={16}
        />
        <TwoButtonFooter
          leftButton={<SecondaryButton label="Deny" onPress={console.log} />}
          rightButton={<PrimaryButton label="Approve" onPress={console.log} />}
        />
      </Stack>
    </YStack>
  );
}
