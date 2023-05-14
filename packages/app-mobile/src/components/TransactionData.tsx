import { useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  TextInput,
  ActivityIndicator,
  Pressable,
} from "react-native";

import { useEthereumFeeData, useDeveloperMode } from "@coral-xyz/recoil";
import { Box, Button, XGroup, StyledText } from "@coral-xyz/tamagui";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { ethers } from "ethers";

import { Header, Container } from "~components/BottomDrawerCards";
import { IconCloseModal, ExpandCollapseIcon } from "~components/Icon";
import { Table, type MenuItem, type Row } from "~components/Table";
import { PrimaryButton, SecondaryButton } from "~components/index";
import { useTheme } from "~hooks/useTheme";
import { SettingsList } from "~screens/Unlocked/Settings/components/SettingsMenuList";

type TransactionMode = "normal" | "fast" | "degen" | "custom";
type SolanaFeeConfig = {
  disabled: boolean;
  config: {
    computeUnits: any;
    priorityFee: any;
  };
};
type TransactionDataProps = {
  loading: boolean;
  network: any;
  networkFee: any;
  networkFeeUsd: any;
  transactionOverrides: any;
  setTransactionOverrides: any;
  simulationError: any;
  setSolanaFeeConfig: any; // todo function
  solanaFeeConfig: SolanaFeeConfig;
};

function TextInputMaxComputeUnits({
  solanaFeeConfig,
  setSolanaFeeConfig,
}: {
  solanaFeeConfig: SolanaFeeConfig;
  setSolanaFeeConfig: (c: any) => any;
}) {
  return (
    <TextInput
      disabled={solanaFeeConfig?.disabled}
      placeholder="Compute units"
      value={solanaFeeConfig?.config?.computeUnits.toString() || 0}
      onChangeText={(text: string) => {
        const computeUnits = parseInt(text || "0", 10);
        if (
          computeUnits < 0 ||
          computeUnits > 1200000 ||
          isNaN(parseInt(text, 10))
        ) {
          return;
        }

        const updatedValue = {
          ...(solanaFeeConfig?.config || {}),
          computeUnits,
        };

        setSolanaFeeConfig((x: any) => ({
          config: updatedValue,
          disabled: x.disabled,
        }));
      }}
    />
  );
}

function TextInputPriorityFee({
  solanaFeeConfig,
  setSolanaFeeConfig,
}: {
  solanaFeeConfig: SolanaFeeConfig;
  setSolanaFeeConfig: (c: any) => any;
}) {
  return (
    <TextInput
      // disabled={solanaFeeConfig?.disabled}
      placeholder="Priority fee"
      value={solanaFeeConfig.config?.priorityFee?.toString() || 0}
      onChangeText={(text: string) => {
        const priorityFee = parseInt(text || "0", 10);
        if (priorityFee < 0 || isNaN(parseInt(text, 10))) {
          return;
        }

        const updatedValue = {
          ...(solanaFeeConfig?.config || {}),
          priorityFee: BigInt(priorityFee),
        };

        setSolanaFeeConfig((x: any) => ({
          disabled: x.disabled,
          config: updatedValue,
        }));
      }}
    />
  );
}

export function TransactionData({
  transactionData,
  menuItems,
  onToggleAdvanced,
}: {
  transactionData: TransactionDataProps;
  menuItems: {
    [key: string]: Row;
  };
  onToggleAdvanced: () => void;
}) {
  const theme = useTheme();
  const developerMode = useDeveloperMode();
  const [mode, setMode] = useState<TransactionMode>("normal");

  const {
    loading,
    network,
    networkFee,
    solanaFeeConfig,
    // networkFeeUsd,
    // transactionOverrides,
    // setTransactionOverrides,
    simulationError,
  } = transactionData;

  const renderMaxPriorityFee = (solanaFeeConfig: SolanaFeeConfig): string => {
    const fee = solanaFeeConfig?.config?.computeUnits
      ? solanaFeeConfig?.config?.computeUnits *
        (Number(solanaFeeConfig?.config?.priorityFee) /
          LAMPORTS_PER_SOL /
          1000000 || 0)
      : 0;

    return `${fee} SOL`;
  };

  const defaultMenuItems = {
    Network: {
      label: "Network",
      value: network,
    },
    "Network Fee": {
      label: "Network Fee",
      value: `${networkFee} ${network === "Ethereum" ? "ETH" : "SOL"}`,
      children: loading ? <ActivityIndicator size="small" /> : undefined,
    },
    ...(network === "Ethereum"
      ? {
          Speed: {
            label: "Speed",
            value: mode,
            onPress: () => onToggleAdvanced(),
          },
        }
      : {}),
    ...(network === "Solana" && developerMode
      ? {
          "Max Compute units": {
            label: "Max Compute Units",
            children: (
              <TextInputMaxComputeUnits
                solanaFeeConfig={solanaFeeConfig}
                setSolanaFeeConfig={transactionData.setSolanaFeeConfig}
              />
            ),
          },
          "Priority fee (micro lamports)": {
            label: "Priority fee (micro lamports)",
            children: (
              <TextInputPriorityFee
                solanaFeeConfig={solanaFeeConfig}
                setSolanaFeeConfig={transactionData.setSolanaFeeConfig}
              />
            ),
          },
          "Max Priority fee": {
            label: "Max Priority fee",
            value: renderMaxPriorityFee(solanaFeeConfig),
          },
        }
      : {}),
  };

  return (
    <>
      <Table menuItems={{ ...menuItems, ...defaultMenuItems }} />
      {simulationError ? (
        <Text
          style={{
            color: theme.custom.colors.negative,
            marginTop: 8,
            textAlign: "center",
          }}
        >
          This transaction is unlikely to succeed.
        </Text>
      ) : null}
    </>
  );
}

function EditInPlace({ onChange, value, isEditing }) {
  if (isEditing) {
    return <TextInput value={value} onChangeText={onChange} />;
  }

  return <StyledText>{value}</StyledText>;
}

export function EthereumSettingsDrawer({
  mode,
  setMode,
  transactionOverrides,
  setTransactionOverrides,
  networkFeeUsd,
  onClose,
}: any) {
  const feeData = useEthereumFeeData();
  const [maxFeePerGas, setMaxFeePerGas] = useState(
    ethers.utils.formatUnits(transactionOverrides.maxFeePerGas, 9)
  );
  const [maxPriorityFeePerGas, setMaxPriorityFeePerGas] = useState(
    ethers.utils.formatUnits(transactionOverrides.maxPriorityFeePerGas, 9)
  );
  const [gasLimit, setGasLimit] = useState(transactionOverrides.gasLimit);
  const [nonce, setNonce] = useState(transactionOverrides.nonce);
  const [editingGas, setEditingGas] = useState(false);
  const [editingNonce, setEditingNonce] = useState(false);
  // Dont update transaction overrides on first render as they are already set
  // from the compient props
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (mode === "normal") {
      setTransactionOverrides({
        ...transactionOverrides,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        nonce,
      });
    } else if (mode === "fast") {
      setTransactionOverrides({
        ...transactionOverrides,
        // Add 10% for fast mode
        maxFeePerGas: feeData.maxFeePerGas.add(
          feeData.maxFeePerGas.mul(10).div(100)
        ),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas.add(
          feeData.maxPriorityFeePerGas.mul(10).div(100)
        ),
        nonce,
      });
    } else if (mode === "degen") {
      setTransactionOverrides({
        ...transactionOverrides,
        // Add 50% for degen mode
        maxFeePerGas: feeData.maxFeePerGas.add(
          feeData.maxFeePerGas.mul(50).div(100)
        ),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas.add(
          feeData.maxPriorityFeePerGas.mul(50).div(100)
        ),
        nonce,
      });
    }
  }, [mode]);

  const handleSave = () => {
    setTransactionOverrides({
      ...transactionOverrides,
      maxFeePerGas: ethers.utils.parseUnits(maxFeePerGas, 9),
      maxPriorityFeePerGas: ethers.utils.parseUnits(maxPriorityFeePerGas, 9),
      gasLimit,
      nonce,
    });
    setEditingNonce(false);
    setEditingGas(false);
  };

  const nonceEditOnClick = !editingGas;
  const gasEditOnClick = mode === "custom" && !editingNonce && !editingGas;

  const menuItems = {
    "Max base fee": {
      label: "Max base fee",
      onPress: () => {
        if (gasEditOnClick) {
          setEditingGas(true);
        }
      },
      children: (
        <EditInPlace
          isEditing={editingGas}
          onChange={setMaxFeePerGas}
          value={
            editingGas
              ? maxFeePerGas
              : `${ethers.utils.formatUnits(
                  transactionOverrides.maxFeePerGas,
                  9
                )} Gwei`
          }
        />
      ),
    },
    "Priority fee": {
      label: "Priority fee",
      onPress: () => {
        if (gasEditOnClick) {
          setEditingGas(true);
        }
      },
      children: (
        <EditInPlace
          isEditing={editingGas}
          onChange={setMaxPriorityFeePerGas}
          value={
            editingGas
              ? maxPriorityFeePerGas
              : `${ethers.utils.formatUnits(
                  transactionOverrides.maxPriorityFeePerGas,
                  9
                )} Gwei`
          }
        />
      ),
    },
    "Gas limit": {
      label: "Gas limit",
      onPress: () => {
        if (gasEditOnClick) {
          setEditingGas(true);
        }
      },
      children: (
        <EditInPlace
          isEditing={editingGas}
          onChange={(text: string) => setGasLimit(text)}
          value={
            editingGas ? gasLimit : transactionOverrides.gasLimit.toString()
          }
        />
      ),
    },
    Nonce: {
      label: "Nonce",
      onPress: () => {
        setEditingNonce(true);
      },
      children: (
        <EditInPlace
          isEditing={editingNonce}
          onChange={(text: string) => setNonce(text)}
          value={editingNonce ? nonce : transactionOverrides.nonce}
        />
      ),
    },
    "Max transaction fee": {
      label: "Max transaction fee",
      value: `$${networkFeeUsd}`,
    },
  };

  return (
    <Container>
      <Header text="Advanced Settings" />
      <Box my={12}>
        <Modes
          currentMode={mode}
          onChangeMode={setMode}
          disabled={editingNonce}
        />
      </Box>
      <Table menuItems={menuItems} />
      <Box mt={12}>
        <FooterButtons
          mode={mode}
          editingGas={editingGas}
          editingNonce={editingNonce}
          onPressSave={handleSave}
          onPressClose={onClose}
        />
      </Box>
    </Container>
  );
}

function FooterButtons({
  mode,
  editingGas,
  editingNonce,
  onPressSave,
  onPressClose,
}: any) {
  return (
    <View>
      {(mode === "custom" && editingGas) || editingNonce ? (
        <PrimaryButton label="Save" onPress={onPressSave} />
      ) : null}
      <SecondaryButton label="Close" onPress={onPressClose} />
    </View>
  );
}

function Modes({
  currentMode,
  onChangeMode,
  disabled,
}: {
  currentMode: TransactionMode;
  onChangeMode: (mode: TransactionMode) => void;
  disabled: boolean;
}): JSX.Element {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      {["normal", "fast", "degen", "custom"].map((m) => (
        <Button
          disabled={disabled}
          key={m}
          mx={4}
          borderRadius={16}
          px={20}
          color={
            currentMode === m
              ? theme.custom.colors.primaryButtonTextColor
              : theme.custom.colors.secondaryButtonTextColor
          }
          onPress={() => onChangeMode(m as TransactionMode)}
          backgroundColor={
            currentMode === m
              ? theme.custom.colors.primaryButton
              : theme.custom.colors.secondaryButton
          }
        >
          {m}
        </Button>
      ))}
    </View>
  );
}
