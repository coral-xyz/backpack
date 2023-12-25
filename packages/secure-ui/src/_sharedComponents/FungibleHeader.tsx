import { ProxyImage, StyledText, XStack } from "@coral-xyz/tamagui";

export function FungibleHeader({
  logo,
  amount,
  currency,
}: {
  logo: string;
  amount: string;
  currency: string;
}) {
  return (
    <XStack
      alignItems="center"
      justifyContent="center"
      space="$2"
      paddingHorizontal="$2"
      margin="$4"
    >
      <ProxyImage
        size={32}
        src={logo}
        style={{
          height: 32,
          width: 32,
          borderRadius: 60,
        }}
      />
      <StyledText color="$baseTextHighEmphasis" fontSize="$2xl">
        {amount}
      </StyledText>
      <StyledText color="$baseTextMedEmphasis" fontSize="$2xl">
        {currency}
      </StyledText>
    </XStack>
  );
}
