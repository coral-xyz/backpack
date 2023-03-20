import { useEffect, useRef, useState } from "react";
import { Text, View, TextInput, ActivityIndicator } from "react-native";

import { useEthereumFeeData } from "@coral-xyz/recoil";
import { Box, Button, XGroup } from "@coral-xyz/tamagui";
import { ethers } from "ethers";

import { Header, Container } from "~components/BottomDrawerCards";
import { IconCloseModal, ExpandCollapseIcon } from "~components/Icon";
import { PrimaryButton, Row, SecondaryButton } from "~components/index";
import { useTheme } from "~hooks/useTheme";
import { SettingsList } from "~screens/Unlocked/Settings/components/SettingsMenuList";

type TransactionMode = "normal" | "fast" | "degen" | "custom";

export function TransactionData({
  transactionData,
  menuItems,
  onToggleAdvanced,
}: {
  transactionData: any;
  menuItems: any;
  onToggleAdvanced: any;
}) {
  const theme = useTheme();
  const {
    loading,
    network,
    networkFee,
    networkFeeUsd,
    transactionOverrides,
    setTransactionOverrides,
    simulationError,
  } = transactionData;
  const [mode, setMode] = useState<TransactionMode>("normal");

  const defaultMenuItems = {
    Network: {
      disabled: true,
      detail: <Text>{network}</Text>,
    },
    "Network Fee": {
      disabled: true,
      detail: loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <Text>
          {networkFee} {network === "Ethereum" ? "ETH" : "SOL"}{" "}
        </Text>
      ),
    },
    ...(network === "Ethereum"
      ? {
          Speed: {
            onPress: () => onToggleAdvanced(),
            detail: (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 12,
                  backgroundColor: theme.custom.colors.secondaryButton,
                  paddingHorizontal: 8,
                }}
              >
                <Text style={{ color: theme.custom.colors.fontColor }}>
                  {mode}
                </Text>
                <ExpandCollapseIcon isExpanded={false} />
              </View>
            ),
          },
        }
      : {}),
  };

  return (
    <>
      <SettingsList menuItems={{ ...menuItems, ...defaultMenuItems }} />
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

export function EthereumSettingsDrawer({
  mode,
  setMode,
  transactionOverrides,
  setTransactionOverrides,
  networkFeeUsd,
  onClose,
}: any) {
  const theme = useTheme();
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

  useEffect(() => {
    setEditingGas(mode === "custom");
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

  const menuItemBase = {
    onPress: () => {},
    button: false,
  };

  const nonceEditOnClick = !editingGas;
  const gasEditOnClick = mode === "custom" && !editingNonce && !editingGas;

  const menuItems = {
    "Max base fee": {
      detail: editingGas ? (
        <TextInput
          variant="outlined"
          margin="dense"
          size="small"
          InputLabelProps={{
            shrink: false,
            style: {
              backgroundColor: theme.custom.colors.nav,
            },
          }}
          value={maxFeePerGas}
          onChange={(e) => setMaxFeePerGas(e.target.value)}
        />
      ) : (
        <ValueWithUnit
          value={ethers.utils.formatUnits(transactionOverrides.maxFeePerGas, 9)}
          unit="Gwei"
          containerProps={{
            style: { cursor: gasEditOnClick ? "pointer" : "inherit" },
            onPress: () => {
              if (gasEditOnClick) {
                setEditingGas(true);
              }
            },
          }}
        />
      ),
      ...menuItemBase,
    },
    "Priority fee": {
      detail: editingGas ? (
        <TextInput
          value={maxPriorityFeePerGas}
          onChange={(e) => setMaxPriorityFeePerGas(e.target.value)}
        />
      ) : (
        <ValueWithUnit
          value={ethers.utils.formatUnits(
            transactionOverrides.maxPriorityFeePerGas,
            9
          )}
          unit="Gwei"
          containerProps={{
            style: { cursor: gasEditOnClick ? "pointer" : "inherit" },
            onPress: () => {
              if (gasEditOnClick) {
                setEditingGas(true);
              }
            },
          }}
        />
      ),
      ...menuItemBase,
    },
    "Gas limit": {
      detail: editingGas ? (
        <TextInput
          value={gasLimit}
          onChange={(e) => setGasLimit(e.target.value)}
        />
      ) : (
        <Text
          // style={{ cursor: gasEditOnClick ? "pointer" : "inherit" }}
          onPress={() => {
            if (gasEditOnClick) {
              setEditingGas(true);
            }
          }}
        >
          {transactionOverrides.gasLimit.toString()}
        </Text>
      ),
      ...menuItemBase,
    },
    Nonce: {
      detail: editingNonce ? (
        <TextInput value={nonce} onChange={(e) => setNonce(e.target.value)} />
      ) : (
        <Text
          onPress={() => {
            if (nonceEditOnClick) {
              setEditingNonce(true);
            }
          }}
        >
          {transactionOverrides.nonce}
        </Text>
      ),
      ...menuItemBase,
    },
    "Max transaction fee": {
      detail: <Text>${networkFeeUsd}</Text>,
      ...menuItemBase,
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
      <SettingsList menuItems={menuItems} />
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

export function ValueWithUnit({
  value,
  unit,
  containerProps,
}: {
  value: string;
  unit: string;
  containerProps?: any;
}) {
  const theme = useTheme();
  return (
    <View
      {...containerProps}
      style={{
        flexDirection: "row",
        ...(containerProps.style ? containerProps.style : {}),
      }}
    >
      <Text style={{ color: theme.custom.colors.fontColor, marginRight: 4 }}>
        {value}
      </Text>
      <Text style={{ color: theme.custom.colors.secondary }}>{unit}</Text>
    </View>
  );
}
