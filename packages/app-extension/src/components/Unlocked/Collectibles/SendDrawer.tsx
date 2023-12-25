import { useEffect, useState } from "react";
import { useApolloClient } from "@apollo/client";
import type { Blockchain } from "@coral-xyz/common";
import {
  externalResourceUri,
  isMadLads,
  UI_RPC_METHOD_NAVIGATION_TO_ROOT,
  wait,
} from "@coral-xyz/common";
import {
  GET_COLLECTIBLES_QUERY,
  type ProviderId,
} from "@coral-xyz/data-components";
import { useTranslation } from "@coral-xyz/i18n";
import { DangerButton, ProxyImage } from "@coral-xyz/react-common";
import {
  useActiveWallet,
  useAnchorContext,
  useBackgroundClient,
  useEthereumCtx,
  useIsValidAddress,
} from "@coral-xyz/recoil";
import { BpDangerButton, IncognitoAvatar, useTheme } from "@coral-xyz/tamagui";
import { BigNumber } from "ethers";

import { BLOCKCHAIN_COMPONENTS } from "../../common/Blockchains";
import { CopyablePublicKey } from "../../common/CopyablePublicKey";
import {
  CloseButton,
  useDrawerContext,
  WithDrawer,
} from "../../common/Layout/Drawer";
import {
  NavStackEphemeral,
  NavStackScreen,
  useNavigation as useNavigationEphemeral,
} from "../../common/Layout/NavStack";
import type { SendData } from "../Balances/TokensWidget/AddressSelector";
import { AddressSelector } from "../Balances/TokensWidget/AddressSelector";
import { useStyles } from "../Balances/TokensWidget/Send";

export function SendDrawer({
  children,
  nft,
}: {
  children: (openDrawer: () => void) => React.ReactElement;
  nft: any;
}) {
  const [openDrawer, setOpenDrawer] = useState(false);
  const { t } = useTranslation();
  const send = () => {
    setOpenDrawer(true);
  };
  return (
    <>
      {children(send)}
      <WithDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
        <div style={{ height: "100%" }}>
          <NavStackEphemeral
            initialRoute={{ name: "select-address" }}
            options={() => ({
              title: nft.name ? `${nft.name} / ${t("send")}` : t("send"),
            })}
            navButtonLeft={<CloseButton onClick={() => setOpenDrawer(false)} />}
          >
            <NavStackScreen
              name="send"
              component={(props) => <SendScreen {...props} nft={nft} />}
            />

            <NavStackScreen
              name="select-address"
              component={() => <NftAddressSelector nft={nft} />}
            />
          </NavStackEphemeral>
        </div>
      </WithDrawer>
    </>
  );
}

function NftAddressSelector({ nft }: { nft: any }) {
  const { push } = useNavigationEphemeral();

  return (
    <AddressSelector
      onSelect={(sendData: SendData) => {
        push("send", {
          to: sendData,
        });
      }}
      blockchain={nft.blockchain}
      name={nft.name}
    />
  );
}

function SendScreen({ nft, to }: { nft: any; to: SendData }) {
  const background = useBackgroundClient();
  const active = useActiveWallet();
  const apollo = useApolloClient();
  const theme = useTheme();
  const { close } = useDrawerContext();
  const { provider: solanaProvider } = useAnchorContext();
  const classes = useStyles();
  const ethereumCtx = useEthereumCtx();
  const destinationAddress = to.address;
  const [openConfirm, setOpenConfirm] = useState(false);
  const [validAddress, setValidAddress] = useState<boolean | null>(null);
  const [wasSent, setWasSent] = useState(false);
  const { isValidAddress } = useIsValidAddress(
    nft.blockchain,
    destinationAddress,
    solanaProvider.connection,
    ethereumCtx.provider
  );

  const SendNftConfirmationCard =
    BLOCKCHAIN_COMPONENTS[nft.blockchain as Blockchain].SendNftConfirmationCard;

  useEffect(() => {
    // Allow drawer to render before opening
    setTimeout(() => setOpenConfirm(true), 300);
  }, []);

  useEffect(() => {
    setValidAddress(isValidAddress);
  }, [isValidAddress]);

  useEffect(() => {
    if (validAddress === false) {
      setOpenConfirm(false);
      setValidAddress(null);
    }
  }, [validAddress]);

  useEffect(() => {
    (async () => {
      // If the modal is being closed and the NFT has been sent elsewhere then
      // navigate back to the nav root because the send screen is no longer
      // valid as the wallet no longer possesses the NFT.
      if (!openConfirm && wasSent) {
        setValidAddress(null);
        await background.request({
          method: UI_RPC_METHOD_NAVIGATION_TO_ROOT,
          params: [],
        });
      }
    })();
  }, [openConfirm, wasSent, background]);

  return (
    <div
      style={{
        paddingLeft: "16px",
        paddingRight: "16px",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
          }}
        >
          <div style={{ marginTop: 35, width: "50%" }}>
            <div
              className={classes.horizontalCenter}
              style={{ marginBottom: 6, paddingTop: 20 }}
            >
              <div className={classes.topImageOuter}>
                <IncognitoAvatar uuid={to.uuid!} size={80} fontSize={40} />
              </div>
            </div>
            <div className={classes.horizontalCenter}>
              {to.walletName || to.username ? (
                <div
                  style={{
                    color: theme.baseTextHighEmphasis.val,
                    fontSize: 16,
                    fontWeight: 500,
                  }}
                >
                  {to.walletName ? to.walletName : `@${to.username}`}
                </div>
              ) : null}
            </div>
            <div className={classes.horizontalCenter} style={{ marginTop: 4 }}>
              <CopyablePublicKey publicKey={to?.address} />
            </div>
          </div>
          <div
            className={classes.horizontalCenter}
            style={{ marginTop: 35, width: "50%" }}
          >
            <Image
              nft={nft}
              style={{ maxHeight: "30vh", maxWidth: 200, minHeight: "" }}
            />
          </div>
        </div>
        {validAddress === false ? (
          <BpDangerButton onPress={close} label="Invalid Address" />
        ) : null}
        {openConfirm ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <SendNftConfirmationCard
              nft={nft}
              destinationUser={
                (to && to.uuid && to.username && to.image
                  ? to
                  : undefined) as any
              }
              destinationAddress={destinationAddress}
              amount={BigNumber.from(1)}
              onClose={() => {
                setOpenConfirm(false);
                setValidAddress(null);
                close();
              }}
              onComplete={async () => {
                await wait(2);
                await apollo.query({
                  query: GET_COLLECTIBLES_QUERY,
                  fetchPolicy: "network-only",
                  variables: {
                    address: active.publicKey,
                    providerId: active.blockchain.toUpperCase() as ProviderId,
                  },
                });
                setWasSent(true);
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Image({ nft, style }: { nft: any; style?: any }) {
  const src = isMadLads(nft.creators)
    ? nft.lockScreenImageUrl
    : externalResourceUri(nft.imageUrl);
  return (
    <div
      style={{
        width: "100%",
        minHeight: "343px",
        display: "flex",
        position: "relative",
        alignItems: "center",
        ...(style || {}),
      }}
    >
      <ProxyImage
        style={{
          width: "100%",
          borderRadius: "8px",
        }}
        loadingStyles={{
          minHeight: "343px",
        }}
        src={src}
        removeOnError
      />
    </div>
  );
}
