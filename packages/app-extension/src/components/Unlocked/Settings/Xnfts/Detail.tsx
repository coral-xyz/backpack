import { useEffect, useMemo, useState } from "react";
import {
  Blockchain,
  DEFAULT_PUBKEY_STR,
  getLogger,
  UI_RPC_METHOD_SET_XNFT_PREFERENCES,
  XNFT_GG_LINK,
} from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  CheckIcon,
  LaunchDetail,
  Loading,
  NegativeButton,
  ProxyImage,
  SecondaryButton,
} from "@coral-xyz/react-common";
import {
  useBackgroundClient,
  useSolanaConnectionUrl,
  useSolanaCtx,
  useSolanaExplorer,
  useUser,
  xnftPreference as xnftPreferenceAtom,
} from "@coral-xyz/recoil";
import { explorerUrl } from "@coral-xyz/secure-background/legacyCommon";
import {
  BAKED_IN_XNFTS,
  confirmTransaction,
  Solana,
} from "@coral-xyz/secure-clients/legacyCommon";
import { useTheme } from "@coral-xyz/tamagui";
import { Button, Typography } from "@mui/material";
import { useRecoilValue } from "recoil";

import { ApproveTransactionDrawer } from "../../../common/ApproveTransactionDrawer";
import { useNavigation as useNavigationEphemeral } from "../../../common/Layout/NavStack";
import { SettingsList } from "../../../common/Settings/List";
import { Error } from "../../Balances/TokensWidget/Send";
import { SwitchToggle } from "../Preferences";

const logger = getLogger("xnft-detail");

export const XnftDetail: React.FC<{ xnft: any }> = ({ xnft }) => {
  const theme = useTheme();
  const [openConfirm, setOpenConfirm] = useState(false);
  const xnftPreference = useRecoilValue(
    xnftPreferenceAtom(xnft.install.account.xnft.toString())
  );

  const nav = useNavigationEphemeral();
  const background = useBackgroundClient();
  const { username, uuid } = useUser();

  const isBaked = useMemo(
    () =>
      xnft.title === "Simulator" ||
      Object.values(BAKED_IN_XNFTS).find(
        (x) => x.publicKey === xnft.install.account.xnft.toBase58()
      ) !== undefined,
    [xnft]
  );

  // Using the raw string here instead of PublicKey.default.toString() because
  // typescript sucks and is throwing inexplicable errors.
  const isDisabled = xnft.install.publicKey === DEFAULT_PUBKEY_STR;

  useEffect(() => {
    nav.setOptions({
      headerTitle: xnft.title,
    });
  }, []);

  const menuItems = {
    Display: {
      detail: (
        <SwitchToggle enabled={!xnftPreference?.disabled} onChange={() => {}} />
      ),
      onClick: () => {},
      style: {
        opacity: 0.5,
      },
      allowOnclickPropagation: true,
    },
    MediaAccess: {
      label: "Cam/Mic/Display access",
      detail: (
        <SwitchToggle
          enabled={!!xnftPreference?.mediaPermissions}
          onChange={async () => {
            const updatedMediaPermissions = !xnftPreference?.mediaPermissions;
            await background.request({
              method: UI_RPC_METHOD_SET_XNFT_PREFERENCES,
              params: [
                uuid,
                xnft.install.account.xnft.toString(),
                {
                  mediaPermissions: updatedMediaPermissions,
                },
              ],
            });
            if (updatedMediaPermissions) {
              const result = await window.navigator.permissions.query({
                //@ts-ignore: camera not part of the typedoc yet
                name: "camera",
              });
              if (result.state !== "granted") {
                window.open("/permissions.html", "_blank");
                return;
              }
            }
          }}
        />
      ),
      onClick: () => {},
      style: {
        opacity: 0.5,
      },
      allowOnclickPropagation: true,
    },
  };

  return (
    <div
      style={{
        padding: "16px",
        height: "100%",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
      }}
    >
      <div>
        <ProxyImage
          src={xnft.iconUrl}
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "8px",
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
            marginBottom: "15px",
          }}
        />
        {xnft.metadata?.xnft ? (
          <Typography
            sx={{
              color: theme.baseTextHighEmphasis.val,
              fontSize: "12px",
              marginBottom: "15px",
              textAlign: "center",
            }}
          >
            v{xnft.metadata.xnft.version}
          </Typography>
        ) : null}
        <Button
          disabled={isDisabled}
          disableRipple
          variant="contained"
          style={{
            textTransform: "none",
            background: theme.baseBackgroundL2.val,
            color: theme.baseTextHighEmphasis.val,
            borderRadius: "12px",
            marginLeft: "auto",
            marginRight: "auto",
            height: "48px",
            display: "flex",
            position: "relative",
            opacity: isDisabled ? 0.5 : undefined,
            boxShadow: "none",
          }}
          onClick={() =>
            window.open(
              `${XNFT_GG_LINK}/app/${xnft.install.account.xnft.toString()}`
            )
          }
        >
          View in Library{" "}
          <LaunchDetail
            style={{
              marginLeft: "4px",
              marginRight: "-4px",
            }}
          />
        </Button>
      </div>
      <div>
        <SettingsList
          menuItems={menuItems}
          style={{
            marginLeft: 0,
            marginRight: 0,
          }}
        />
        <Typography
          style={{
            fontSize: "14px",
            marginTop: "36px",
            marginBottom: "36px",
            textAlign: "center",
            color: theme.baseTextMedEmphasis.val,
          }}
        >
          {isBaked
            ? "This xNFT was developed by the Backpack team and cannot be uninstalled."
            : "Uninstalling will remove this xNFT from your account."}
        </Typography>
        {!isBaked ? (
          <NegativeButton
            disabled={isDisabled}
            label="Uninstall xNFT"
            onClick={() => setOpenConfirm(true)}
          />
        ) : null}
      </div>
      <ApproveTransactionDrawer
        openDrawer={openConfirm}
        setOpenDrawer={setOpenConfirm}
      >
        <UninstallConfirmationCard xnft={xnft} />
      </ApproveTransactionDrawer>
    </div>
  );
};

const UninstallConfirmationCard = ({ xnft }: { xnft: any }) => {
  const ctx = useSolanaCtx();
  const [error, setError] = useState("");
  const [cardType, setCardType] = useState<
    "confirm" | "sending" | "complete" | "error"
  >("confirm");
  const [txSignature, setTxSignature] = useState<string | null>(null);

  const onConfirm = async () => {
    //
    // Change view to display loading indicator.
    //
    setCardType("sending");

    //
    // Send the tx.
    //
    let txSig = "";
    try {
      txSig = await Solana.uninstallXnft(ctx, {
        assetId: xnft.id ?? "",
        install: xnft.install.publicKey,
        mint: xnft.xnftAccount.masterMint,
        iconUrl: xnft.iconUrl,
      });
    } catch (err) {
      logger.error("unable to send transaction", err);
      setCardType("error");
      return;
    }
    setTxSignature(txSig);

    //
    // Confirm tx.
    //
    try {
      await confirmTransaction(
        ctx.connection,
        txSig,
        ctx.commitment === "finalized" ? "finalized" : "confirmed"
      );

      setCardType("complete");
    } catch (err: any) {
      logger.error("unable to confirm", err);
      setError(err.toString());
      setCardType("error");
    }
  };

  const retry = () => {
    onConfirm();
  };

  return cardType === "confirm" ? (
    <ConfirmUninstall xnft={xnft} onConfirm={onConfirm} />
  ) : cardType === "sending" ? (
    <Sending signature={txSignature!} isComplete={false} />
  ) : cardType === "complete" ? (
    <Sending signature={txSignature!} isComplete />
  ) : (
    <Error
      blockchain={Blockchain.SOLANA}
      signature={txSignature!}
      error={error}
      onRetry={() => retry()}
    />
  );
};

const ConfirmUninstall = ({
  xnft,
  onConfirm,
}: {
  xnft: any;
  onConfirm: () => void;
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <div
      style={{
        height: "402px",
        display: "flex",
        flexDirection: "column",
        padding: "16px",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Typography
          style={{
            textAlign: "center",
            fontSize: "24px",
            color: theme.baseTextHighEmphasis.val,
          }}
        >
          {t("confirm_uninstall_xnft", { title: xnft.title })}
        </Typography>
      </div>
      <NegativeButton label={t("confirm")} onClick={() => onConfirm()} />
    </div>
  );
};

function Sending({
  signature,
  isComplete,
}: {
  signature: string;
  isComplete: boolean;
}) {
  const theme = useTheme();
  const solanaExplorer = useSolanaExplorer();
  const connectionUrl = useSolanaConnectionUrl();
  return (
    <div
      style={{
        height: "264px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography
        style={{
          textAlign: "center",
          color: theme.baseTextMedEmphasis.val,
          fontSize: "14px",
          fontWeight: 500,
          marginTop: "30px",
        }}
      >
        {isComplete ? "Sent" : "Sending..."}
      </Typography>
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        {isComplete ? (
          <div style={{ textAlign: "center" }}>
            <CheckIcon />
          </div>
        ) : (
          <Loading
            size={48}
            iconStyle={{
              color: theme.baseTextHighEmphasis.val,
              display: "flex",
              marginLeft: "auto",
              marginRight: "auto",
            }}
            thickness={6}
          />
        )}
      </div>
      <div
        style={{
          marginBottom: "16px",
          marginLeft: "16px",
          marginRight: "16px",
        }}
      >
        <SecondaryButton
          onClick={() => {
            window.open(explorerUrl(solanaExplorer, signature, connectionUrl));
          }}
          label="View Explorer"
        />
      </div>
    </div>
  );
}
