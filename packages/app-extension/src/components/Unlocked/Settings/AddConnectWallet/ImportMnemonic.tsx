import { useEffect, useState } from "react";
import type {
  Blockchain,
  SignedWalletDescriptor,
  WalletDescriptor,
} from "@coral-xyz/common";
import { getCreateMessage } from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import { Box, Grid } from "@mui/material";

import { useSignMessageForWallet } from "../../../../hooks/useSignMessageForWallet";
import { useSteps } from "../../../../hooks/useSteps";
import { Header } from "../../../common";
import { ImportWallets } from "../../../common/Account/ImportWallets";
import { MnemonicInput } from "../../../common/Account/MnemonicInput";
import { ActionCard } from "../../../common/Layout/ActionCard";
import { useNavigation } from "../../../common/Layout/NavStack";

export function ImportMnemonic({ blockchain }: { blockchain: Blockchain }) {
  const nav = useNavigation();
  const theme = useCustomTheme();
  const { step, nextStep, prevStep } = useSteps();

  // Whether the user is inputting another mnemonic or using the one on the keyring
  const [inputMnemonic, setInputMnemonic] = useState(false);
  const [mnemonic, setMnemonic] = useState("");
  const [signedWalletDescriptors, setSignedWalletDescriptors] = useState<
    Array<SignedWalletDescriptor>
  >([]);

  const signMessageForWallet = useSignMessageForWallet(mnemonic);

  const action = "create";

  useEffect(() => {
    const prevTitle = nav.title;
    nav.setOptions({ headerTitle: "" });
    return () => {
      nav.setOptions({ headerTitle: prevTitle });
    };
  }, [theme]);

  const steps = [
    <SetInputMnemonic
      onNext={(inputMnemonic) => {
        setInputMnemonic(inputMnemonic);
        nextStep();
      }}
    />,
    // Show the seed phrase if we are creating based on a mnemonic
    ...(inputMnemonic
      ? [
          <MnemonicInput
            readOnly={action === "create"}
            buttonLabel={action === "create" ? "Next" : "Import"}
            onNext={(mnemonic) => {
              setMnemonic(mnemonic);
              nextStep();
            }}
          />,
        ]
      : []),
    <ImportWallets
      blockchain={blockchain!}
      mnemonic={mnemonic!}
      onNext={async (walletDescriptors: Array<WalletDescriptor>) => {
        const signedWalletDescriptors = await Promise.all(
          walletDescriptors.map(async (w) => ({
            ...w,
            signature: await signMessageForWallet(
              w,
              getCreateMessage(w.publicKey)
            ),
          }))
        );
        setSignedWalletDescriptors(signedWalletDescriptors);
        nextStep();
      }}
    />,
  ];

  return steps[step];
}

export function SetInputMnemonic({
  onNext,
}: {
  onNext: (mnemonicInput: boolean) => void;
}) {
  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Box sx={{ margin: "24px" }}>
          <Header text="Import using a secret recovery phrase" />
        </Box>

        <Box sx={{ margin: "0 16px" }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ActionCard
                text="Your secret recovery phrase"
                subtext="Use the secret recovery phrase from your Backpack account."
                onClick={() => onNext(false)}
              />
            </Grid>
            <Grid item xs={12}>
              <ActionCard
                text="Other secret recovery phrase"
                subtext="Enter a new secret recovery phrase for a one time import."
                onClick={() => onNext(true)}
              />
            </Grid>
          </Grid>
        </Box>
      </div>
    </>
  );
}
