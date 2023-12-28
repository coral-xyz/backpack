import { type TransactionData as TransactionDataType } from "@coral-xyz/recoil";
import { Input, Stack, StyledText } from "@coral-xyz/tamagui";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import { Loading } from "./Loading";
import { TransactionTable } from "./TransactionTable";
import { createBalanceChangeItems } from "../_utils/createBalanceChangeItems";

export type TransactionOverrides = {
  computeUnits: string;
  priorityFee: string;
  disableFeeConfig: boolean;
};

export function SolanaTransactionDetails({
  setTransactionOverrides,
  transactionOverrides,
  solanaTxData,
  title,
}: {
  setTransactionOverrides: (
    overrides:
      | TransactionOverrides
      | ((old: TransactionOverrides) => TransactionOverrides)
  ) => void;
  transactionOverrides: TransactionOverrides;
  solanaTxData?: TransactionDataType;
  title: string;
}) {
  const onChange = (prop: string) => (value: string) => {
    setTransactionOverrides((overrides) => ({
      ...overrides,
      [prop]: value ?? "0",
    }));
  };
  const maxPriorityFee =
    (parseFloat(transactionOverrides.computeUnits) *
      parseFloat(transactionOverrides.priorityFee)) /
    LAMPORTS_PER_SOL /
    1000000;

  if (!solanaTxData) {
    return <Loading />;
  }

  return (
    <Stack space="$2">
      <StyledText
        fontWeight="$bold"
        fontSize="$sm"
        color="$baseTextMedEmphasis"
      >
        {title}
      </StyledText>
      <TransactionTable
        items={[
          ...createBalanceChangeItems(solanaTxData),
          {
            label: "Network Fee",
            value: solanaTxData.networkFee + " SOL",
          },
          ...(!transactionOverrides.disableFeeConfig
            ? [
                {
                  label: "Max Compute units",
                  value: (
                    <EditInPlace
                      value={transactionOverrides.computeUnits}
                      onChange={onChange("computeUnits")}
                      isEditing={!transactionOverrides.disableFeeConfig}
                    />
                  ),
                },
                {
                  label: "Priority fee (micro lamports)",
                  value: (
                    <EditInPlace
                      value={transactionOverrides.priorityFee}
                      onChange={onChange("priorityFee")}
                      isEditing={!transactionOverrides.disableFeeConfig}
                    />
                  ),
                },
                {
                  label: "Max Priority fee",
                  value: `${maxPriorityFee} SOL`,
                },
              ]
            : []),
        ]}
      />
      {solanaTxData.simulationError ? (
        <StyledText fontSize="$sm" color="$redText">
          This transaction is unlikely to succeed.
        </StyledText>
      ) : null}
    </Stack>
  );
}

function EditInPlace({
  onChange,
  value,
  isEditing,
}: {
  onChange: (text: string) => void;
  value: string;
  isEditing: boolean;
}) {
  if (isEditing) {
    return (
      <Input
        size="$md"
        paddingVertical="$3"
        ta="right"
        paddingHorizontal={16}
        margin="$-1"
        w="50%"
        value={value}
        onChangeText={onChange}
      />
    );
  }

  return <StyledText>{value}</StyledText>;
}
