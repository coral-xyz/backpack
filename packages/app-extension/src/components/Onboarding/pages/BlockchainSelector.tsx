import { type Blockchain, formatTitleCase } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  enabledBlockchainConfigsAtom,
  getBlockchainLogo,
} from "@coral-xyz/recoil";
import type { YStackProps } from "@coral-xyz/tamagui";
import {
  BpPrimaryButton,
  StyledText,
  useTheme,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";
import { Button } from "@mui/material";
import { useRecoilValue } from "recoil";

export function BlockchainSelector({
  selectedBlockchains,
  onClick,
  onNext,
  isRecovery = false,
}: {
  selectedBlockchains: Array<Blockchain>;
  onClick: (blockchain: Blockchain) => void;
  onNext: () => void;
  isRecovery?: boolean;
}) {
  const { t } = useTranslation();
  const enabledBlockchainConfigs = useRecoilValue(enabledBlockchainConfigsAtom);

  return (
    <YStack f={1} gap={40} width="100%">
      <YStack gap={16}>
        {isRecovery ? (
          <>
            <StyledText fontSize={36} fontWeight="$semiBold" textAlign="center">
              {t("which_network_recovery.title")}
            </StyledText>
            <StyledText color="$baseTextMedEmphasis" textAlign="center">
              {t("which_network_recovery.subtitle")}
            </StyledText>
          </>
        ) : (
          <>
            <StyledText fontSize={36} fontWeight="$semiBold" textAlign="center">
              {t("which_network.title")}
            </StyledText>
            <StyledText
              color="$baseTextMedEmphasis"
              textAlign="center"
              whiteSpace="pre-line"
            >
              {t("which_network.subtitle")}
            </StyledText>
          </>
        )}
      </YStack>
      <YStack f={1} gap={16}>
        {Object.entries(enabledBlockchainConfigs).map(([blockchain]) => (
          <NetworkListItem
            key={blockchain}
            blockchain={blockchain as Blockchain}
            selectedBlockchains={selectedBlockchains}
            onClick={onClick}
          />
        ))}
      </YStack>
      <YStack>
        <BpPrimaryButton
          label={t("next")}
          onPress={onNext}
          disabled={selectedBlockchains.length === 0}
        />
      </YStack>
    </YStack>
  );
}

export function NetworkListItem({
  blockchain,
  selectedBlockchains,
  onClick,
}: {
  blockchain: Blockchain;
  selectedBlockchains: Array<Blockchain>;
  onClick: (blockchain: Blockchain) => void;
}) {
  const tamaguiTheme = useTheme();
  const isSelected = selectedBlockchains.includes(blockchain);

  return (
    <Button
      disableRipple
      sx={{
        width: "100%",
        height: 72,
        padding: 0,
        textTransform: "none",
        border: "solid 2pt",
        borderColor: isSelected
          ? tamaguiTheme.accentBlue.val
          : tamaguiTheme.baseBorderMed.val,
        borderRadius: "12px",
        backgroundColor: isSelected
          ? tamaguiTheme.baseBackgroundL1.val
          : "transparent",
        "&:hover": {
          backgroundColor: tamaguiTheme.baseBackgroundL1.val,
        },
      }}
      onClick={() => onClick(blockchain)}
    >
      <XStack
        style={{
          width: "100%",
          border: tamaguiTheme.baseBorderMed.val,
        }}
      >
        <YStack ml={16} jc="center">
          <_NetworkIcon
            blockchain={blockchain}
            justifyContent="center"
            alignItems="center"
            overflow="hidden"
            padding="$1"
            height="24"
            width="24"
            imgStyle={{
              width: "100%",
              height: "100%",
            }}
          />
        </YStack>
        <YStack jc="center">
          <StyledText fontSize="$lg" fontWeight="$semiBold" ml={12}>
            {formatTitleCase(blockchain)}
          </StyledText>
        </YStack>
      </XStack>
    </Button>
  );
}

function _NetworkIcon({
  blockchain,
  imgStyle,
  ...YStackProps
}: {
  blockchain: Blockchain;
  imgStyle?: React.CSSProperties;
} & YStackProps) {
  const blockchainLogo = getBlockchainLogo(blockchain);
  return (
    <YStack {...YStackProps}>
      <img src={blockchainLogo} style={imgStyle} />
    </YStack>
  );
}
