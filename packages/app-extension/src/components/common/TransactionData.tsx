import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { Button, Skeleton, TextField, Typography } from "@mui/material";
import ArrowDropDown from "@mui/icons-material/ArrowDropDown";
import { useEthereumFeeData } from "@coral-xyz/recoil";
import { useCustomTheme, styles, HOVER_OPACITY } from "@coral-xyz/themes";
import { SettingsList } from "./Settings/List";
import { WithMiniDrawer } from "./Layout/Drawer";
import { CloseButton } from "./ApproveTransactionDrawer";
import { PrimaryButton, SecondaryButton } from "./";

const useStyles = styles((theme: any) => ({
  chip: {
    padding: "4px 16px",
    textTransform: "capitalize",
    borderRadius: "16px",
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
    "& .MuiTypography-root": {
      fontSize: "14px",
    },
  },
  inputRoot: {
    border: `${theme.custom.colors.borderFull}`,
    background: theme.custom.colors.background,
    color: theme.custom.colors.secondary,
    borderRadius: "8px",
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      "& fieldset": {
        border: "none",
      },
    },
    "& .MuiInputBase-input": {
      color: theme.custom.colors.fontColor,
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: 700,
      paddingRight: "8px",
    },
    "& .MuiInputAdornment-root": {
      color: theme.custom.colors.secondary,
      fontWeight: 500,
      minWidth: "12px",
      fontSize: "14px",
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
      onClick: () => {},
      detail: <Typography>{network}</Typography>,
      button: false,
      classes: menuItemClasses,
    },
    "Network Fee": {
      onClick: () => {},
      detail: loading ? (
        <Skeleton width={150} />
      ) : (
        <Typography>
          {networkFee} {network === "Ethereum" ? "ETH" : "SOL"}
        </Typography>
      ),
      button: false,
      classes: menuItemClasses,
    },
    ...(network === "Ethereum"
      ? {
          Speed: {
            onClick: () => setEthSettingsDrawerOpen(true),
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
        className={classes.listRoot}
        menuItems={{ ...menuItems, ...defaultMenuItems }}
        style={{
          margin: 0,
        }}
        textStyle={{
          color: theme.custom.colors.secondary,
        }}
      />
      {simulationError && (
        <Typography
          style={{
            color: theme.custom.colors.negative,
            marginTop: "8px",
            textAlign: "center",
          }}
        >
          This transaction is unlikely to succeed.
        </Typography>
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
    onClick: () => {},
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
        ></TextField>
      ) : (
        <ValueWithUnit
          value={ethers.utils.formatUnits(transactionOverrides.maxFeePerGas, 9)}
          unit="Gwei"
          containerProps={{
            style: { cursor: gasEditOnClick ? "pointer" : "inherit" },
            onClick: () => {
              if (gasEditOnClick) setEditingGas(true);
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
        ></TextField>
      ) : (
        <ValueWithUnit
          value={ethers.utils.formatUnits(
            transactionOverrides.maxPriorityFeePerGas,
            9
          )}
          unit="Gwei"
          containerProps={{
            style: { cursor: gasEditOnClick ? "pointer" : "inherit" },
            onClick: () => {
              if (gasEditOnClick) setEditingGas(true);
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
        ></TextField>
      ) : (
        <Typography
          style={{ cursor: gasEditOnClick ? "pointer" : "inherit" }}
          onClick={() => {
            if (gasEditOnClick) setEditingGas(true);
          }}
        >
          {transactionOverrides.gasLimit.toString()}
        </Typography>
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
        ></TextField>
      ) : (
        <Typography
          style={{ cursor: nonceEditOnClick ? "pointer" : "inherit" }}
          onClick={() => {
            if (nonceEditOnClick) setEditingNonce(true);
          }}
        >
          {transactionOverrides.nonce}
        </Typography>
      ),
      ...menuItemBase,
    },
    "Max transaction fee": {
      detail: <Typography>${networkFeeUsd}</Typography>,
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
      <div
        onClick={() => setOpenDrawer(false)}
        style={{
          height: "50px",
          zIndex: 1,
          backgroundColor: "transparent",
        }}
      >
        <CloseButton
          onClick={() => setOpenDrawer(false)}
          style={{
            marginTop: "28px",
            marginLeft: "24px",
            zIndex: 1,
          }}
        />
      </div>
      <div
        style={{
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
          borderTop: "1pt solid " + theme.custom.colors.borderColor,
          height: "100%",
          background: theme.custom.colors.background,
        }}
      >
        <div
          style={{
            height: "100%",
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexDirection: "column",
              paddingBottom: "24px",
              height: "100%",
            }}
          >
            <div>
              <Typography
                style={{
                  color: theme.custom.colors.fontColor,
                  fontWeight: 500,
                  fontSize: "18px",
                  lineHeight: "24px",
                  textAlign: "center",
                  paddingTop: "24px",
                }}
              >
                Advanced Settings
              </Typography>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  margin: "24px 16px 0 16px",
                }}
              >
                {["normal", "fast", "degen", "custom"].map((m) => (
                  <ModeChip
                    mode={m as TransactionMode}
                    currentMode={mode}
                    setMode={setMode}
                    disabled={editingNonce}
                  />
                ))}
              </div>
              <div style={{ margin: "24px 16px" }}>
                <SettingsList
                  className={classes.listRoot}
                  menuItems={menuItems}
                  style={{
                    margin: 0,
                  }}
                  textStyle={{
                    color: theme.custom.colors.secondary,
                  }}
                />
              </div>
            </div>
            <div style={{ margin: "0 16px" }}>
              {((mode === "custom" && editingGas) || editingNonce) && (
                <PrimaryButton
                  style={{ marginBottom: "12px" }}
                  label="Save"
                  onClick={handleSave}
                />
              )}
              <SecondaryButton
                label="Close"
                onClick={() => setOpenDrawer(false)}
              />
            </div>
          </div>
        </div>
      </div>
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
  const classes = useStyles();
  return (
    <Button
      disableRipple
      disableElevation
      onClick={() => setMode(mode)}
      className={`${classes.chip} ${
        mode === currentMode && !disabled
          ? classes.primaryChip
          : classes.secondaryChip
      }`}
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
    <div
      {...containerProps}
      style={{
        display: "flex",
        justifyContent: "space-between",
        width: "50%",
        ...(containerProps.style ? containerProps.style : {}),
      }}
    >
      <Typography>{value}</Typography>
      <Typography style={{ color: theme.custom.colors.secondary }}>
        {unit}
      </Typography>
    </div>
  );
}
