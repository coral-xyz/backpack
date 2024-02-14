import { useState } from "react";
import { useTranslation } from "@coral-xyz/i18n";
import {
  useValidatorsQuery,
  type Validator,
} from "@coral-xyz/staking/src/hooks";
import { activeValidatorPubkeyAtom } from "@coral-xyz/staking/src/shared";
import { BpInput, useTheme, YStack } from "@coral-xyz/tamagui";
import SearchIcon from "@mui/icons-material/Search";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useSetRecoilState } from "recoil";

import { AutosizedWindowedList } from "../../../../components/common/TokenTable";
import { StakesTableCell } from "../../../../components/Unlocked/Stake/StakesTableCell";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  StakeScreenProps,
} from "../../../navigation/StakeNavigator";

export function ValidatorSelectorScreen(
  props: StakeScreenProps<Routes.ValidatorSelectorScreen>
) {
  return (
    <ScreenContainer loading={<Loading />}>
      <Container {...props} />
    </ScreenContainer>
  );
}

function Loading() {
  return null;
}

const Container = ({
  navigation,
}: StakeScreenProps<Routes.ValidatorSelectorScreen>) => {
  const setActiveValidatorPubkey = useSetRecoilState(activeValidatorPubkeyAtom);
  const theme = useTheme();
  const [searchFilter, setSearchFilter] = useState("");
  const { t } = useTranslation();
  const validatorsQuery = useValidatorsQuery();

  const validators =
    validatorsQuery?.data?.filter((v) =>
      v.name.toLowerCase().includes(searchFilter.toLowerCase())
    ) || [];

  return (
    <YStack space="$3">
      <YStack paddingHorizontal="$4">
        <BpInput
          placeholder={t("search")}
          value={searchFilter}
          onChangeText={(text) => setSearchFilter(text)}
          iconStart={<SearchIcon style={{ color: theme.baseIcon.val }} />}
        />
      </YStack>
      <AutosizedWindowedList
        itemKey={(index) => validators[index].id}
        itemCount={validators.length}
        itemData={{
          validators,
          onClickRow: (validator: Validator) => {
            setActiveValidatorPubkey(validator.info.votePubkey);
            navigation.pop();
          },
        }}
        // @ts-ignore
        renderer={ValidatorRowRenderer}
      />
    </YStack>
  );
};

const ValidatorRowRenderer = ({
  index,
  data,
  style,
}: {
  index: number;
  data: { validators: Validator[]; onClickRow: (validator: Validator) => void };
  style: any;
}) => {
  const validator = data.validators[index];
  return (
    <YStack
      key={validator.id}
      hoverStyle={{
        cursor: "pointer",
        backgroundColor: "$baseBackgroundL2",
      }}
      paddingHorizontal="$4"
      style={style}
      onPress={() => data.onClickRow(validator)}
    >
      <StakesTableCell
        props={{
          validator: {
            icon: validator.icon,
            name: validator.name,
          },
          state: (BigInt(validator.info.stake) / BigInt(LAMPORTS_PER_SOL))
            .toLocaleString()
            .concat(" SOL"),
          amount: validator.info.apy
            ? `${validator.info.apy}% APY`
            : `${validator.info.commission}% Fee`,
          reward: undefined,
        }}
      />
    </YStack>
  );
};
