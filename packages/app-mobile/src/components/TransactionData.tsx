import { useEffect, useRef, useState } from "react";
import { Text, View, TextInput } from "react-native";

import { useEthereumFeeData } from "@coral-xyz/recoil";
import { ethers } from "ethers";

import { IconCloseModal } from "~components/Icon";
import { PrimaryButton, SecondaryButton } from "~components/index";
import { useTheme } from "~hooks/useTheme";
import { SettingsList } from "~screens/Unlocked/Settings/components/SettingsMenuList";

type TransactionMode = "normal" | "fast" | "degen" | "custom";

export function TransactionData({
  transactionData,
  menuItems,
}: {
  transactionData: any;
  menuItems: any;
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
  const [ethSettingsDrawerOpen, setEthSettingsDrawerOpen] = useState(false);
  const [mode, setMode] = useState<TransactionMode>("normal");

  // The default transaction data that appears on all transactions
  const defaultMenuItems = {
    Network: {
      disabled: true,
      detail: <Text>{network}</Text>,
    },
    "Network Fee": {
      disabled: true,
      detail: loading ? (
        <Text>LOADING TODO</Text>
      ) : (
        <Text>
          {networkFee} {network === "Ethereum" ? "ETH" : "SOL"}{" "}
        </Text>
      ),
    },
    ...(network === "Ethereum"
      ? {
          Speed: {
            onPress: () => setEthSettingsDrawerOpen(true),
            detail: <Text> TODO </Text>,
            // detail: (
            //   <Button disableRipple disableElevation disabled={loading}>
            //     {mode} <ArrowDropDown />
            //   </Button>
            // ),
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
      {network === "Ethereum" && !loading ? (
        <EthereumSettingsDrawer
          mode={mode}
          setMode={setMode}
          transactionOverrides={transactionOverrides}
          setTransactionOverrides={setTransactionOverrides}
          networkFeeUsd={networkFeeUsd}
          openDrawer={ethSettingsDrawerOpen}
          setOpenDrawer={setEthSettingsDrawerOpen}
        />
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
  openDrawer,
  setOpenDrawer,
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
          feeData.maxFeePerGas.mul(10).View(100)
        ),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas.add(
          feeData.maxPriorityFeePerGas.mul(10).View(100)
        ),
        nonce,
      });
    } else if (mode === "degen") {
      setTransactionOverrides({
        ...transactionOverrides,
        // Add 50% for degen mode
        maxFeePerGas: feeData.maxFeePerGas.add(
          feeData.maxFeePerGas.mul(50).View(100)
        ),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas.add(
          feeData.maxPriorityFeePerGas.mul(50).View(100)
        ),
        nonce,
      });
    }
  }, [mode]);

  useEffect(() => {
    setEditingGas(mode === "custom");
  }, [mode]);

  // Escape handler that closes edit modes if they are active, otherwise closes
  // the entire drawer.
  const handleEsc = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      if (editingGas) {
        setEditingGas(false);
      } else if (editingNonce) {
        setEditingNonce(false);
      } else {
        setOpenDrawer(false);
      }
    }
  };

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
    <>
      <View
        onPress={() => setOpenDrawer(false)}
        style={{
          height: 50,
          zIndex: 1,
          backgroundColor: "transparent",
        }}
      >
        <IconCloseModal onPress={() => setOpenDrawer(false)} />
      </View>
      <View
        style={{
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          borderTopWidth: 1,
          borderColor: theme.custom.colors.borderColor,
          backgroundColor: theme.custom.colors.background,
        }}
      >
        <View
          style={{
            // height: "100%",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingBottom: 24,
              height: "100%",
            }}
          >
            <View>
              <Text
                style={{
                  color: theme.custom.colors.fontColor,
                  fontWeight: "500",
                  fontSize: 18,
                  lineHeight: 24,
                  textAlign: "center",
                  paddingTop: 24,
                }}
              >
                Advanced Settings
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                }}
              >
                {["normal", "fast", "degen", "custom"].map((m) => (
                  <ModeChip
                    key={m}
                    mode={m as TransactionMode}
                    currentMode={mode}
                    setMode={setMode}
                    disabled={editingNonce}
                  />
                ))}
              </View>
              <View style={{ marginVertical: 24, marginHorizontal: 16 }}>
                <SettingsList menuItems={menuItems} />
              </View>
            </View>
            <View style={{ marginHorizontal: 16 }}>
              {(mode === "custom" && editingGas) || editingNonce ? (
                <PrimaryButton label="Save" onPress={handleSave} />
              ) : null}
              <SecondaryButton
                label="Close"
                onPress={() => setOpenDrawer(false)}
              />
            </View>
          </View>
        </View>
      </View>
    </>
  );
}

// Note we don't use the MUI Button component because it currently doesn't
// have any way to disable the ripple.
function ModeChip({
  mode,
  currentMode,
  setMode,
  disabled,
}: {
  mode: TransactionMode;
  currentMode: TransactionMode;
  setMode: (mode: TransactionMode) => void;
  disabled?: boolean;
}) {
  return (
    <PrimaryButton onPress={() => setMode(mode)} disabled={disabled}>
      {mode}
    </PrimaryButton>
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
        justifyContent: "space-between",
        width: "50%",
        ...(containerProps.style ? containerProps.style : {}),
      }}
    >
      <Text>{value}</Text>
      <Text style={{ color: theme.custom.colors.secondary }}>{unit}</Text>
    </View>
  );
}
