import { useEffect, useState } from "react";
import {
  toTitleCase,
  Blockchain,
  DerivationPath,
  UI_RPC_METHOD_SIGN_MESSAGE_FOR_WALLET,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { Box } from "@mui/material";
import {
  Header,
  HeaderIcon,
  PrimaryButton,
  SubtextParagraph,
} from "../../../common";
import { HardwareWalletIcon } from "../../../common/Icon";
import { SelectedAccount } from "../../../common/Account/ImportAccounts";

export function SignOnboardHardware({
  blockchain,
  accounts,
  derivationPath,
  onNext,
}: {
  blockchain: Blockchain;
  accounts: Array<SelectedAccount>;
  derivationPath: DerivationPath | undefined;
  onNext: (signature: string) => void;
}) {
  const background = useBackgroundClient();
  const [signature, setSignature] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  const account = accounts.length > 0 ? accounts[0] : null;

  useEffect(() => {
    (async () => {
      if (account) {
        const signature = await background.request({
          method: UI_RPC_METHOD_SIGN_MESSAGE_FOR_WALLET,
          params: [
            blockchain,
            "123",
            derivationPath,
            account.index,
            account.publicKey,
          ],
        });
        console.log(signature);
        setSignature(signature);
      }
    })();
  }, [accounts, derivationPath, retry]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ margin: "0 24px" }}>
        <HeaderIcon icon={<HardwareWalletIcon />} />
        <Header text="Sign the message" />
        <SubtextParagraph>
          Sign the message to enable {toTitleCase(blockchain)} in Backpack.
        </SubtextParagraph>
      </Box>
      <Box
        sx={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {/* <PrimaryButton label="Retry" onClick={() => setRetry(retry + 1)} /> */}
        <PrimaryButton
          label="Next"
          onClick={() => {
            onNext(signature!);
          }}
          disabled={!signature}
        />
      </Box>
    </Box>
  );
}
