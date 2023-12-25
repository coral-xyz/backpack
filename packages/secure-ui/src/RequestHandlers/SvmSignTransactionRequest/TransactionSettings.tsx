import type { TransactionOverrides } from "../../_sharedComponents/SolanaTransactionDetails";

import { useMemo, useState } from "react";
import { Platform } from "react-native";

import { useTranslation } from "@coral-xyz/i18n";
import {
  YStack,
  XStack,
  StyledText,
  ChevronDownIcon,
  BpInput,
  Switch,
} from "@coral-xyz/tamagui";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export type TransactionSettingsProps = {
  overrides: TransactionOverrides;
  resetOverrides: () => void;
  setOverrides: (
    val: TransactionOverrides | ((prev: TransactionOverrides) => void)
  ) => void;
};

export function TransactionSettings({
  overrides,
  resetOverrides,
  setOverrides,
}: TransactionSettingsProps) {
  const { t } = useTranslation();
  const [showSettings, setShowSettings] = useState(false);

  const maxPriorityFeeSol = useMemo(() => {
    const unitLimit = parseFloat(overrides.computeUnits);
    const price = parseFloat(overrides.priorityFee);
    return overrides.disableFeeConfig
      ? 0
      : (unitLimit * price) / LAMPORTS_PER_SOL / 1_000_000;
  }, [overrides]);

  return (
    <YStack key="fees" space="$2">
      <XStack f={1} ai="center" jc="space-between">
        <StyledText fontWeight="$bold" color="$baseTextHighEmphasis">
          {t("transaction_settings")}
        </StyledText>
        <XStack
          cursor="pointer"
          onPress={() => setShowSettings((prev) => !prev)}
          pointerEvents="box-only"
        >
          <ChevronDownIcon
            color="$baseTextMedEmphasis"
            fontSize="$sm"
            transform={showSettings ? [{ rotateZ: "180deg" }] : undefined}
          />
        </XStack>
      </XStack>
      {showSettings ? (
        <YStack space="$2">
          <XStack f={1} ai="center" jc="space-between">
            <YStack space="$1">
              <StyledText
                color="$baseTextMedEmphasis"
                fontWeight="$bold"
                fontSize="$xs"
              >
                {t("add_priority_fee")}
              </StyledText>
            </YStack>
            <Switch
              backgroundColor={
                !overrides.disableFeeConfig
                  ? "$accentBlue"
                  : "$baseTextMedEmphasis"
              }
              borderWidth={0}
              checked={!overrides.disableFeeConfig}
              cursor="pointer"
              padding={2}
              size={Platform.OS === "web" ? "$1" : "$2"}
              onPress={() => {
                if (overrides.disableFeeConfig) {
                  resetOverrides();
                } else {
                  setOverrides((prev) => ({
                    ...prev,
                    disableFeeConfig: !prev.disableFeeConfig,
                  }));
                }
              }}
            >
              <Switch.Thumb
                backgroundColor="$baseBackgroundL0"
                animation="quick"
                borderWidth={0}
              />
            </Switch>
          </XStack>
          {!overrides.disableFeeConfig ? (
            <YStack space="$2">
              <XStack f={1} ai="center" jc="space-between">
                <YStack space="$1">
                  <StyledText
                    color="$baseTextMedEmphasis"
                    fontWeight="$bold"
                    fontSize="$xs"
                  >
                    {t("compute_unit_price")}
                  </StyledText>
                </YStack>
                <BpInput
                  borderRadius={8}
                  fontSize="$sm"
                  height={30}
                  px={12}
                  py={0}
                  width={100}
                  placeholder="Micro Lamports"
                  overflow="hidden"
                  value={overrides.priorityFee}
                  onChangeText={(val) => {
                    if (/^\d*$/.test(val)) {
                      setOverrides((prev) => ({
                        ...prev,
                        priorityFee: val,
                      }));
                    }
                  }}
                />
              </XStack>
              <XStack f={1} ai="center" jc="space-between">
                <YStack space="$1">
                  <StyledText
                    color="$baseTextMedEmphasis"
                    fontWeight="$bold"
                    fontSize="$xs"
                  >
                    {t("compute_unit_limit")}
                  </StyledText>
                </YStack>
                <BpInput
                  borderRadius={8}
                  fontSize="$sm"
                  height={30}
                  px={12}
                  py={0}
                  width={100}
                  placeholder="Units"
                  value={overrides.computeUnits}
                  onChangeText={(val) => {
                    if (/^\d*$/.test(val)) {
                      setOverrides((prev) => ({
                        ...prev,
                        computeUnits: val,
                      }));
                    }
                  }}
                />
              </XStack>
            </YStack>
          ) : null}
        </YStack>
      ) : null}
      <XStack f={1} ai="center" jc="space-between">
        <YStack space="$1">
          <StyledText
            color="$baseTextMedEmphasis"
            fontWeight="$bold"
            fontSize="$xs"
          >
            {t("max_priority_fee")}
          </StyledText>
        </YStack>
        <StyledText color="$baseTextMedEmphasis" fontSize="$xs">
          {maxPriorityFeeSol} SOL
        </StyledText>
      </XStack>
    </YStack>
  );
}
