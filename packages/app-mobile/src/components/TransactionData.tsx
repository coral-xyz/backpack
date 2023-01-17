import { PrimaryButton, SecondaryButton } from "@components";
import { useEthereumFeeData } from "@coral-xyz/recoil";
import { HOVER_OPACITY, styles, useCustomTheme } from "@coral-xyz/themes";
import ArrowDropDown from "@mui/icons-material/ArrowDropDown";
import { SettingsList } from "@screens/Unlocked/Settings/components/SettingsMenuList";
import { ethers } from "ethers";
import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";

import { CloseButton } from "./ApproveTransactionDrawer";

const Skeleton = () => <View />;
const Button = (props: any) => <PrimaryButton {...props} />;
const TextInput = (props: any) => <TextInput {...props} />;
const WithMiniDrawer = (props: any) => <View {...props} />;

const useStyles = styles((theme: any) => ({
  chip: {
    padding: 16,
    textTransform: "capitalize",
    borderRadius: 16,
  },
  primaryChip: {
    borderColor: theme.custom.colors.primaryButton,
    backgroundColor: theme.custom.colors.primaryButton,
    color: theme.custom.colors.primaryButtonTextColor,
    "&:hover": {
      opacity: HOVER_OPACITY,
      background: `${theme.custom.colors.primaryButton} !important`,
      backgroundColor: `${theme.custom.colors.primaryButton} !important,`,
    },
  },
  secondaryChip: {
    borderColor: theme.custom.colors.secondaryButton,
    backgroundColor: theme.custom.colors.secondaryButton,
    color: theme.custom.colors.secondaryButtonTextColor,
    "&:hover": {
      opacity: HOVER_OPACITY,
      background: `${theme.custom.colors.secondaryButton} !important`,
      backgroundColor: `${theme.custom.colors.secondaryButton} !important,`,
    },
  },
  backgroundChip: {
    borderColor: theme.custom.colors.background,
    backgroundColor: theme.custom.colors.background,
    color: theme.custom.colors.secondaryButtonTextColor,
    "&:hover": {
      opacity: HOVER_OPACITY,
      background: `${theme.custom.colors.background} !important`,
      backgroundColor: `${theme.custom.colors.background} !important,`,
    },
  },
  listRoot: {
    "& .MuiText-root": {
      fontSize: 14,
    },
  },
  inputRoot: {
    border: `${theme.custom.colors.borderFull}`,
    background: theme.custom.colors.background,
    color: theme.custom.colors.secondary,
    borderRadius: 8,
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
      "& fieldset": {
        border: "none",
      },
    },
    "& .MuiInputBase-input": {
      color: theme.custom.colors.fontColor,
      borderRadius: 8,
      fontSize: 14,
      fontWeight: "700",
      paddingRight: 8,
    },
    "& .MuiInputAdornment-root": {
      color: theme.custom.colors.secondary,
      fontWeight: "500",
      minWidth: 12,
      fontSize: 14,
    },
    "&:hover": {
      backgroundColor: theme.custom.colors.primary,
    },
  },
}));

type TransactionMode = "normal" | "fast" | "degen" | "custom";

export function TransactionData({
  transactionData,
  menuItems,
  menuItemClasses,
}: {
  transactionData: any;
  menuItems: any;
  menuItemClasses?: any;
}) {
  const theme = useCustomTheme();
  const classes = useStyles();
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
      onPress: () => {},
      detail: <Text>{network}</Text>,
      button: false,
      classes: menuItemClasses,
    },
    "Network Fee": {
      onPress: () => {},
      detail: loading ? (
        <Skeleton width={150} />
      ) : (
        <Text>
          {networkFee} {network === "Ethereum" ? "ETH" : "SOL"}
        </Text>
      ),
      button: false,
      classes: menuItemClasses,
    },
    ...(network === "Ethereum"
      ? {
          Speed: {
            onPress: () => setEthSettingsDrawerOpen(true),
            detail: (
              <Button
                disableRipple
                disableElevation
                className={`${classes.chip} ${classes.backgroundChip}`}
                disabled={loading}
              >
                {mode} <ArrowDropDown />
              </Button>
            ),
            button: false,
            classes: menuItemClasses,
          },
        }
      : {}),
  };

  return (
    <>
      <SettingsList
        menuItems={{ ...menuItems, ...defaultMenuItems }}
        style={{
          margin: 0,
        }}
        textStyle={{
          color: theme.custom.colors.secondary,
        }}
      />
      {simulationError && (
        <Text
          style={{
            color: theme.custom.colors.negative,
            marginTop: 8,
            textAlign: "center",
          }}
        >
          This transaction is unlikely to succeed.
        </Text>
      )}
      {network === "Ethereum" && !loading && (
        <EthereumSettingsDrawer
          mode={mode}
          setMode={setMode}
          transactionOverrides={transactionOverrides}
          setTransactionOverrides={setTransactionOverrides}
          networkFeeUsd={networkFeeUsd}
          openDrawer={ethSettingsDrawerOpen}
          setOpenDrawer={setEthSettingsDrawerOpen}
        />
      )}
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
  const theme = useCustomTheme();
  const classes = useStyles();
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

  useEffect(() => {
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [editingGas, editingNonce]);

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
        <TextField
          className={classes.inputRoot}
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
        <TextField
          className={classes.inputRoot}
          variant="outlined"
          margin="dense"
          size="small"
          InputLabelProps={{
            shrink: false,
            style: {
              backgroundColor: theme.custom.colors.nav,
            },
          }}
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
        <TextField
          className={classes.inputRoot}
          variant="outlined"
          margin="dense"
          size="small"
          InputLabelProps={{
            shrink: false,
            style: {
              backgroundColor: theme.custom.colors.nav,
            },
          }}
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
        <TextField
          className={classes.inputRoot}
          variant="outlined"
          margin="dense"
          size="small"
          InputLabelProps={{
            shrink: false,
            style: {
              backgroundColor: theme.custom.colors.nav,
            },
          }}
          value={nonce}
          type="number"
          onChange={(e) => setNonce(e.target.value)}
        />
      ) : (
        <Text
          style={{ cursor: nonceEditOnClick ? "pointer" : "inherit" }}
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
    <WithMiniDrawer
      openDrawer={openDrawer}
      setOpenDrawer={setOpenDrawer}
      paperProps={{
        style: {
          height: "100%",
        },
      }}
      modalProps={{
        style: {
          background: "#18181b80",
        },
        disableEscapeKeyDown: true,
      }}
    >
      <View
        onPress={() => setOpenDrawer(false)}
        style={{
          height: 50,
          zIndex: 1,
          backgroundColor: "transparent",
        }}
      >
        <CloseButton
          onPress={() => setOpenDrawer(false)}
          style={{
            marginTop: 28,
            marginLeft: 24,
            zIndex: 1,
          }}
        />
      </View>
      <View
        style={{
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          borderTopWidth: 1,
          borderColor: theme.custom.colors.borderColor,
          //   height: "100%",
          background: theme.custom.colors.background,
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
              display: "flex",
              justifyContent: "space-between",
              flexDirection: "column",
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
                  display: "flex",
                  justifyContent: "space-around",
                  //   margin: 24px 16px 0 16,
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
                <SettingsList
                  // className={classes.listRoot}
                  menuItems={menuItems}
                  style={{
                    margin: 0,
                  }}
                  textStyle={{
                    color: theme.custom.colors.secondary,
                  }}
                />
              </View>
            </View>
            <View style={{ marginHorizontal: 16 }}>
              {((mode === "custom" && editingGas) || editingNonce) && (
                <PrimaryButton
                  style={{ marginBottom: 12 }}
                  label="Save"
                  onPress={handleSave}
                />
              )}
              <SecondaryButton
                label="Close"
                onPress={() => setOpenDrawer(false)}
              />
            </View>
          </View>
        </View>
      </View>
    </WithMiniDrawer>
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
    <Button
      disableRipple
      disableElevation
      onPress={() => setMode(mode)}
      // className={`${classes.chip} ${
      //   mode === currentMode && !disabled
      //     ? classes.primaryChip
      //     : classes.secondaryChip
      // }`}
      size="small"
      disabled={disabled}
    >
      {mode}
    </Button>
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
  const theme = useCustomTheme();
  return (
    <View
      {...containerProps}
      style={{
        display: "flex",
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
