import { useEffect, useMemo, useState } from "react";
import {
  BAKED_IN_XNFTS,
  Blockchain,
  confirmTransaction,
  DEFAULT_PUBKEY_STR,
  explorerUrl,
  getLogger,
  Solana,
  UI_RPC_METHOD_SET_XNFT_PREFERENCES,
  XNFT_GG_LINK,
} from "@coral-xyz/common";
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
import { useCustomTheme } from "@coral-xyz/themes";
import { Button, Typography } from "@mui/material";
import { useRecoilValue } from "recoil";

import { updateRemotePreference } from "../../../../api/preferences";
import { ApproveTransactionDrawer } from "../../../common/ApproveTransactionDrawer";
import { useNavigation as useNavigationEphemeral } from "../../../common/Layout/NavStack";
import { SettingsList } from "../../../common/Settings/List";
import { Error } from "../../Balances/TokensWidget/Send";
import { SwitchToggle } from "../Preferences";
const logger = getLogger("xnft-detail");

export const XnftDetail: React.FC<{ xnft: any }> = ({ xnft }) => {
  const theme = useCustomTheme();
  const [openConfirm, setOpenConfirm] = useState(false);
  const xnftPreference = useRecoilValue(
    xnftPreferenceAtom(xnft.install.account.xnft.toString())
  );

  const nav = useNavigationEphemeral();
  const background = useBackgroundClient();
  const { username } = useUser();

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
    PushNotificationAccess: {
      label: "Push notifications",
      detail: (
        <SwitchToggle
          enabled={!!xnftPreference?.pushNotifications}
          onChange={async () => {
            const updatedPushNotifications = !xnftPreference?.pushNotifications;
            await background.request({
              method: UI_RPC_METHOD_SET_XNFT_PREFERENCES,
              params: [
                xnft.install.account.xnft.toString(),
                {
                  pushNotifications: updatedPushNotifications,
                },
              ],
            });
            await updateRemotePreference(
              xnft.install.account.xnft.toString(),
              username || "",
              {
                notifications: updatedPushNotifications,
              }
            ).catch((e) =>
              console.error(
                `Error while updating remote notification state ${e}`
              )
            );

            if (updatedPushNotifications) {
              const result = await window.navigator.permissions.query({
                //@ts-ignore: camera not part of the typedoc yet
                name: "notifications",
              });

              if (result.state !== "granted") {
                window.open("/permissions.html?notifications=true", "_blank");
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
              color: theme.custom.colors.fontColor,
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
            background: theme.custom.colors.bg2,
            color: theme.custom.colors.fontColor,
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
            color: theme.custom.colors.secondary,
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
        install: xnft.install.publicKey,
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
  const theme = useCustomTheme();
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
            color: theme.custom.colors.fontColor,
          }}
        >
          Are you sure you want to uninstall {xnft.title}?
        </Typography>
      </div>
      <NegativeButton label="Confirm" onClick={() => onConfirm()} />
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
  const theme = useCustomTheme();
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
          color: theme.custom.colors.secondary,
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
              color: theme.custom.colors.primaryButton,
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
