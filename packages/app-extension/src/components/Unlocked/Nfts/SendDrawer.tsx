import React, { useEffect, useState } from "react";
import {
  Blockchain,
  isMadLads,
  UI_RPC_METHOD_NAVIGATION_TO_ROOT,
} from "@coral-xyz/common";
import {
  LocalImage,
  PrimaryButton,
  ProxyImage,
  SecondaryButton,
} from "@coral-xyz/react-common";
import {
  useAnchorContext,
  useBackgroundClient,
  useEthereumCtx,
  useIsValidAddress,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { BigNumber } from "ethers";

import { ApproveTransactionDrawer } from "../../common/ApproveTransactionDrawer";
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
import { SendEthereumConfirmationCard } from "../Balances/TokensWidget/Ethereum";
import { useStyles } from "../Balances/TokensWidget/Send";
import { SendSolanaConfirmationCard } from "../Balances/TokensWidget/Solana";

export function SendDrawer({
  children,
  nft,
}: {
  children: (openDrawer: () => void) => React.ReactElement;
  nft: any;
}) {
  const [openDrawer, setOpenDrawer] = useState(false);
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
              title: nft.name ? `${nft.name} / Send` : "Send",
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
    <div>
      <AddressSelector
        onSelect={(sendData: SendData) => {
          push("send", {
            to: sendData,
          });
        }}
        blockchain={nft.blockchain}
        name={nft.name}
      />
    </div>
  );
}

function SendScreen({ nft, to }: { nft: any; to: SendData }) {
  const background = useBackgroundClient();
  const { close } = useDrawerContext();
  const { provider: solanaProvider } = useAnchorContext();
  const classes = useStyles();
  const ethereumCtx = useEthereumCtx();
  const destinationAddress = to.address;
  const [openConfirm, setOpenConfirm] = useState(false);
  const [wasSent, setWasSent] = useState(false);
  const { isValidAddress } = useIsValidAddress(
    nft.blockchain,
    destinationAddress,
    solanaProvider.connection,
    ethereumCtx.provider
  );
  const theme = useCustomTheme();

  useEffect(() => {
    (async () => {
      // If the modal is being closed and the NFT has been sent elsewhere then
      // navigate back to the nav root because the send screen is no longer
      // valid as the wallet no longer possesses the NFT.
      if (!openConfirm && wasSent) {
        await background.request({
          method: UI_RPC_METHOD_NAVIGATION_TO_ROOT,
          params: [],
        });
      }
    })();
  }, [openConfirm, wasSent, background]);

  return (
    <>
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
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          <div>
            <div>
              <div
                className={classes.horizontalCenter}
                style={{ marginBottom: 6, paddingTop: 20 }}
              >
                <div className={classes.topImageOuter}>
                  <LocalImage
                    size={80}
                    className={classes.topImage}
                    src={
                      to?.image ||
                      `https://avatars.backpack.workers.dev/${to?.address}`
                    }
                    style={{ width: 80, height: 80 }}
                  />
                </div>
              </div>
              <div className={classes.horizontalCenter}>
                {to.walletName || to.username ? (
                  <div
                    style={{
                      color: theme.custom.colors.fontColor,
                      fontSize: 16,
                      fontWeight: 500,
                    }}
                  >
                    {to.walletName ? to.walletName : `@${to.username}`}
                  </div>
                ) : null}
              </div>
              <div
                className={classes.horizontalCenter}
                style={{ marginTop: 4 }}
              >
                <CopyablePublicKey publicKey={to?.address} />
              </div>
            </div>
            <div className={classes.horizontalCenter} style={{ marginTop: 35 }}>
              <Image
                nft={nft}
                style={{ maxHeight: "30vh", maxWidth: 200, minHeight: "" }}
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: "18px",
              paddingBottom: "16px",
            }}
          >
            <SecondaryButton
              style={{
                marginRight: "8px",
              }}
              onClick={close}
              label="Cancel"
            />
            <PrimaryButton
              disabled={!isValidAddress}
              onClick={() => setOpenConfirm(true)}
              label="Next"
            />
          </div>
        </div>
      </div>
      <ApproveTransactionDrawer
        openDrawer={openConfirm}
        setOpenDrawer={setOpenConfirm}
      >
        {nft.blockchain === Blockchain.SOLANA ? (
          <SendSolanaConfirmationCard
            token={{
              address: nft.publicKey,
              logo: nft.imageUrl,
              decimals: 0, // Are there any NFTs that don't use decimals 0?
              mint: nft.mint,
            }}
            destinationUser={
              (to && to.uuid && to.username && to.image
                ? to
                : undefined) as React.ComponentProps<
                typeof SendSolanaConfirmationCard
              >["destinationUser"]
            }
            destinationAddress={destinationAddress}
            amount={BigNumber.from(1)}
            onComplete={() => setWasSent(true)}
          />
        ) : null}
        {nft.blockchain === Blockchain.ETHEREUM ? (
          <SendEthereumConfirmationCard
            token={{
              logo: nft.imageUrl,
              decimals: 0, // Are there any NFTs that don't use decimals 0?
              address: nft.contractAddress,
              tokenId: nft.tokenId,
            }}
            destinationUser={
              (to && to.uuid && to.username && to.image
                ? to
                : undefined) as React.ComponentProps<
                typeof SendEthereumConfirmationCard
              >["destinationUser"]
            }
            destinationAddress={destinationAddress}
            amount={BigNumber.from(1)}
            onComplete={() => setWasSent(true)}
          />
        ) : null}
      </ApproveTransactionDrawer>
    </>
  );
}

function Image({ nft, style }: { nft: any; style?: any }) {
  const src = isMadLads(nft.creators) ? nft.lockScreenImageUrl : nft.imageUrl;
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
