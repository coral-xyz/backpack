import type { ReactNode } from "react";

import {
  InfoIcon,
  ListItem,
  PrimaryButton,
  ProxyImage,
  ScrollView,
  SecondaryButton,
  Separator,
  Stack,
  StyledText,
  TextArea,
  Tooltip,
  TwoButtonFooter,
  XStack,
  YGroup,
  YStack,
} from "@coral-xyz/tamagui";

type Row = {
  key?: string;
  label?: ReactNode;
  value: ReactNode;
  valueColor?: string;
  valueAfter?: ReactNode;
  valueAfterColor?: string;
  toolTip?: ReactNode;
  onPress?: () => void;
};

export function TransactionTable(props: { items: (Row | null)[] }) {
  return (
    <Stack
      overflow="hidden"
      borderWidth={2}
      borderColor="$baseBorderLight"
      borderRadius="$container"
      backgroundColor="$baseBackgroundL1"
      separator={<Separator borderColor="$baseDivider" />}
    >
      {props.items
        .filter((i): i is Row => Boolean(i))
        .map((row) => {
          return (
            <ListItem
              backgroundColor="$baseBackgroundL1"
              key={typeof row.label === "string" ? row.label : row.key}
              onPress={row.onPress}
              cursor={row.onPress ? "pointer" : ""}
              alignItems="center"
              padding="$0"
              paddingLeft="$4"
            >
              {row.label ? (
                <XStack
                  paddingRight="$4"
                  justifyContent="flex-start"
                  alignItems="center"
                  space="$2"
                >
                  {typeof row.label === "string" ? (
                    <StyledText paddingVertical="$3" fontSize="$sm">
                      {row.label}
                    </StyledText>
                  ) : (
                    row.label
                  )}
                  {row.toolTip ? (
                    <Tooltip restMs={0} delay={0} offset={0}>
                      <Tooltip.Trigger>
                        <InfoIcon size="$xs" />
                      </Tooltip.Trigger>
                      <Tooltip.Content
                        padding="$2"
                        borderRadius="$2"
                        backgroundColor="$invertedBaseBackgroundL0"
                      >
                        {typeof row.toolTip === "string" ? (
                          <StyledText
                            fontSize="$sm"
                            color="$invertedBaseTextHighEmphasis"
                          >
                            {row.toolTip}
                          </StyledText>
                        ) : (
                          row.toolTip
                        )}
                      </Tooltip.Content>
                    </Tooltip>
                  ) : null}
                </XStack>
              ) : null}

              <XStack
                paddingRight="$3"
                flex={1}
                justifyContent="flex-end"
                alignItems="center"
              >
                {typeof row.value === "string" ? (
                  <StyledText
                    paddingVertical="$3"
                    fontSize="$sm"
                    flex={1}
                    textAlign="right"
                    color={row.valueColor ?? "$baseTextHighEmphasis"}
                  >
                    {row.value}
                  </StyledText>
                ) : (
                  row.value
                )}
              </XStack>
              {row.valueAfter ? (
                <XStack
                  space="$2"
                  marginLeft="$-2"
                  paddingRight="$3"
                  alignItems="center"
                >
                  {typeof row.valueAfter === "string" ? (
                    <StyledText
                      paddingVertical="$3"
                      fontSize="$sm"
                      flex={1}
                      textAlign="right"
                      color={row.valueAfterColor ?? "$baseTextMedEmphasis"}
                    >
                      {row.valueAfter}
                    </StyledText>
                  ) : (
                    row.valueAfter
                  )}
                </XStack>
              ) : null}
            </ListItem>
          );
        })}
    </Stack>
  );
}
