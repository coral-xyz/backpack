import type { Transaction } from "ethers6";

import { useState } from "react";

import {
  Button,
  CustomScrollView,
  Input,
  Sheet,
  Stack,
  StyledText,
  XStack,
} from "@coral-xyz/tamagui";
import { formatUnits, parseUnits } from "ethers6";

import { TransactionTable } from "../../../_sharedComponents/TransactionTable";

const speeds = ["Normal", "Fast", "Degen", "Custom"] as const;
export type Speed = (typeof speeds)[number];

export type TransactionOverrides = {
  gasLimit: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  nonce: number;
};

export const getOverrides = (
  transaction: Transaction,
  percent: number
): TransactionOverrides => ({
  gasLimit: transaction.gasLimit.toString(),
  maxFeePerGas: (
    (BigInt(transaction.maxFeePerGas ?? 0) * BigInt(percent)) /
    BigInt(100)
  ).toString(),
  maxPriorityFeePerGas: (
    (BigInt(transaction.maxPriorityFeePerGas ?? 0) * BigInt(percent)) /
    BigInt(100)
  ).toString(),
  nonce: transaction.nonce,
});

export function TransactionSettingsDrawer({
  isOpen,
  setIsOpen,
  isAdvancedMode,
  transaction,
  speed,
  setSpeed,
  setTransactionOverrides,
  transactionOverrides,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  speed: Speed;
  setSpeed: (speed: Speed) => void;
  transactionOverrides: TransactionOverrides;
  setTransactionOverrides: (
    values:
      | TransactionOverrides
      | ((old: TransactionOverrides) => TransactionOverrides)
  ) => void;
  isAdvancedMode: boolean;
  transaction: Transaction;
}) {
  return (
    <Sheet
      open={isOpen}
      onOpenChange={setIsOpen}
      snapPoints={[60]}
      zIndex={100_000}
      animation="quick"
    >
      <Sheet.Overlay backgroundColor="rgba(0,0,0,0.3)" />
      <Sheet.Frame
        position="relative"
        borderColor="$baseBorderMed"
        borderWidth="$1"
      >
        <CustomScrollView
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
          }}
        >
          <TransactionSettings
            isAdvancedMode={isAdvancedMode}
            transaction={transaction}
            speed={speed}
            setSpeed={setSpeed}
            transactionOverrides={transactionOverrides}
            setTransactionOverrides={setTransactionOverrides}
          />
        </CustomScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}

function TransactionSettings({
  isAdvancedMode,
  transaction,
  speed,
  setSpeed,
  setTransactionOverrides,
  transactionOverrides,
}: {
  speed: Speed;
  setSpeed: (speed: Speed) => void;
  transactionOverrides: TransactionOverrides;
  setTransactionOverrides: (
    values:
      | TransactionOverrides
      | ((old: TransactionOverrides) => TransactionOverrides)
  ) => void;
  isAdvancedMode: boolean;
  transaction: Transaction;
}) {
  const [transactionOverridesEdit, setTransactionOverridesEdit] = useState(
    getOverrides(transaction, 100)
  );

  const isEditing = speed === "Custom";

  const transactionValues = isEditing
    ? transactionOverridesEdit
    : transactionOverrides;

  const renderSpeeds = !isAdvancedMode
    ? speeds.filter((speed) => speed !== "Custom") // remove custom speed setting when not adv. mode
    : speeds;

  const updateSpeed = (speed: Speed) => {
    if (speed === "Normal") {
      setTransactionOverrides(getOverrides(transaction, 100));
    } else if (speed === "Fast") {
      setTransactionOverrides(getOverrides(transaction, 150));
    } else if (speed === "Degen") {
      setTransactionOverrides(getOverrides(transaction, 200));
    }
    setSpeed(speed);
  };

  const onChange = (prop: string) => (value: string) => {
    try {
      const newValue = ["maxFeePerGas", "maxPriorityFeePerGas"].includes(prop)
        ? parseUnits(value, "gwei").toString()
        : value;

      setTransactionOverrides((overrides) => ({
        ...overrides,
        [prop]: newValue,
      }));
      setTransactionOverridesEdit((overrides) => ({
        ...overrides,
        [prop]: newValue,
      }));
    } catch (e) {
      null;
    }
  };

  return (
    <Stack padding="$4" space="$4">
      <XStack space="$2">
        {renderSpeeds.map((renderSpeed) => {
          return (
            <Button
              key={renderSpeed}
              backgroundColor="$buttonSecondaryBackground"
              size="$sm"
              flexBasis={0}
              flexGrow={1}
              height="$3"
              hoverStyle={{
                cursor: "pointer",
              }}
              onPress={() => updateSpeed(renderSpeed)}
            >
              <StyledText
                color={
                  renderSpeed === speed ? "$accentBlue" : "$buttonSecondaryText"
                }
                fontSize="$sm"
              >
                {renderSpeed}
              </StyledText>
            </Button>
          );
        })}
      </XStack>
      <TransactionTable
        items={[
          {
            label: "Max Priority Fee",
            value: (
              <EditInPlace
                onChange={onChange("maxPriorityFeePerGas")}
                value={parseInt(
                  formatUnits(
                    parseUnits(transactionValues.maxPriorityFeePerGas, "wei"),
                    "gwei"
                  ).toString()
                )}
                isEditing={isEditing}
              />
            ),
          },
          {
            label: "Max Fee",
            value: (
              <EditInPlace
                onChange={onChange("maxFeePerGas")}
                value={parseInt(
                  formatUnits(
                    parseUnits(transactionValues.maxFeePerGas, "wei"),
                    "gwei"
                  )
                )}
                isEditing={isEditing}
              />
            ),
          },
          {
            label: "Gas Limit",
            value: (
              <EditInPlace
                onChange={onChange("gasLimit")}
                value={transactionValues.gasLimit}
                isEditing={isEditing}
              />
            ),
          },
          {
            label: "Nonce",
            value: (
              <EditInPlace
                onChange={onChange("nonce")}
                value={transactionValues.nonce}
                isEditing={isEditing}
              />
            ),
          },
        ]}
      />
    </Stack>
  );
}

function EditInPlace({
  onChange,
  value,
  isEditing,
}: {
  onChange: React.ComponentProps<typeof Input>["onChangeText"];
  value: string | number;
  isEditing: boolean;
}) {
  if (isEditing) {
    return (
      <Input
        size="$sm"
        paddingVertical="$3"
        ta="right"
        paddingHorizontal={16}
        margin="$-1.5"
        w="50%"
        value={String(value)}
        onChangeText={onChange}
      />
    );
  }

  return <StyledText fontSize="$sm">{value}</StyledText>;
}
