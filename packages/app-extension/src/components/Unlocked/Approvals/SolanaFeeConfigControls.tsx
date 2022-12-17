import { useState } from "react";
import type { SolanaFeeConfig } from "@coral-xyz/common";
import { TextInput } from "@coral-xyz/react-common";
import { useDeveloperMode } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { TextField } from "@mui/material";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export const SolanaFeeConfigControls = ({
  onUpdate,
}: {
  onUpdate: (feeConfig?: SolanaFeeConfig) => void;
}) => {
  const [feeConfig, setFeeConfig] = useState<{
    computeUnits: number;
    priorityFee: number;
  }>({ computeUnits: 200000, priorityFee: 0 });
  const developerMode = useDeveloperMode();
  const theme = useCustomTheme();

  if (!developerMode) {
    return <></>;
  }

  const totalLamports = feeConfig.computeUnits
    ? 5000 + feeConfig.computeUnits * feeConfig.priorityFee
    : 5000;

  return (
    <div style={{ padding: 15 }}>
      <div style={{ display: "flex" }}>
        <div style={{ marginRight: 5 }}>
          <div style={{ color: theme.custom.colors.fontColor2 }}>
            Compute units
          </div>
          <TextInput
            placeholder="Compute units"
            type="text"
            value={feeConfig.computeUnits.toString()}
            setValue={(e) => {
              const computeUnits = parseInt(e.target.value || 0);
              if (
                computeUnits < 0 ||
                computeUnits > 1200000 ||
                isNaN(e.target.value)
              ) {
                return;
              }
              const updatedValue = {
                ...feeConfig,
                computeUnits: computeUnits,
              };
              setFeeConfig(updatedValue);
              onUpdate(updatedValue);
            }}
          />
        </div>
        <div>
          <div style={{ color: theme.custom.colors.fontColor2 }}>
            Priority fee
          </div>
          <TextInput
            placeholder="Priority fee"
            type="text"
            value={feeConfig.priorityFee.toString()}
            setValue={(e) => {
              const priorityFee = parseInt(e.target.value || 0);
              if (priorityFee < 0 || isNaN(e.target.value)) {
                return;
              }
              const updatedValue = {
                ...feeConfig,
                priorityFee: priorityFee,
              };
              setFeeConfig(updatedValue);
              onUpdate(updatedValue);
            }}
          />
        </div>
      </div>
      <div style={{ color: theme.custom.colors.fontColor2 }}>
        Max ${(totalLamports * 12) / LAMPORTS_PER_SOL}{" "}
        {/* TODO: fetch price dynamically here */}
      </div>
    </div>
  );
};
