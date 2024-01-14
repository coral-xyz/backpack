import { type Blockchain, formatTitleCase } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
//import { PrimaryButton } from "@coral-xyz/react-common";
import {
  enabledBlockchainConfigsAtom,
  getBlockchainLogo,
} from "@coral-xyz/recoil";
import type { YStackProps } from "@coral-xyz/tamagui";
import {
  BpPrimaryButton,
  PrimaryButton,
  StyledText,
  useTheme,
  View,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";
import { Box, Button, Grid } from "@mui/material";
import { useRecoilValue } from "recoil";

import { Header, SubtextParagraph } from "../../common";
import { BLOCKCHAIN_COMPONENTS } from "../../common/Blockchains";

export const BlockchainSelector = ({
  selectedBlockchains,
  onClick,
  onNext,
  isRecovery = false,
}: {
  selectedBlockchains: Array<Blockchain>;
  onClick: (blockchain: Blockchain) => void;
  onNext: () => void;
  isRecovery?: boolean;
}) => {
  const { t } = useTranslation();
  const enabledBlockchainConfigs = useRecoilValue(enabledBlockchainConfigsAtom);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Box
          sx={{
            marginLeft: "24px",
            marginRight: "24px",
            marginTop: "24px",
          }}
        >
          {isRecovery ? (
            <>
              <Header text="Which network would you like to use to recover your username?" />
              <SubtextParagraph>
                Select one. You can add more networks after you've recovered
                your username.
              </SubtextParagraph>
            </>
          ) : (
            <>
              <Header text={t("which_network")} />
              <SubtextParagraph>
                {t("select_one_or_more_blockchains")}
              </SubtextParagraph>
            </>
          )}
        </Box>
        <Box style={{ marginTop: "24px", padding: "0 16px 16px" }}>
          <div>
            {Object.entries(enabledBlockchainConfigs).map(([blockchain]) => {
              return (
                <>
                  <NetworkListItem
                    blockchain={blockchain as Blockchain}
                    selectedBlockchains={selectedBlockchains}
                    onClick={() => onClick(blockchain as Blockchain)}
                  />
                  {/* Spacing */}
                  <View height={16} />
                </>
              );
            })}
          </div>
        </Box>
      </Box>
      <YStack padding="$4">
        <BpPrimaryButton
          label={t("next")}
          onPress={onNext}
          disabled={selectedBlockchains.length === 0}
        />
      </YStack>
    </Box>
  );
};

function NetworkIcon({
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

export function NetworkListItem({
  blockchain,
  selectedBlockchains,
  onClick,
}: {
  blockchain: Blockchain;
  selectedBlockchains: Array<Blockchain>;
  onClick: () => void;
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
      onClick={onClick}
    >
      <XStack
        style={{
          width: "100%",
          border: tamaguiTheme.baseBorderMed.val,
        }}
      >
        <YStack ml={16} jc="center">
          <NetworkIcon
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
