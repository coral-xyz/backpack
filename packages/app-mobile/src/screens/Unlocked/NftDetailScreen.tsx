import { useEffect, useState } from "react";
import { Text, View, ScrollView } from "react-native";

import {
  UNKNOWN_NFT_ICON_SRC,
  Blockchain,
  confirmTransaction,
  Solana,
  toTitleCase,
  UI_RPC_METHOD_NAVIGATION_TO_ROOT,
} from "@coral-xyz/common";
import {
  useAnchorContext,
  useBackgroundClient,
  useEthereumCtx,
  useLoader,
  useSolanaCtx,
  nftById,
} from "@coral-xyz/recoil";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { PublicKey } from "@solana/web3.js";
import { BigNumber } from "ethers";
import { useRecoilValueLoadable } from "recoil";

import {
  NegativeButton,
  PrimaryButton,
  ProxyImage,
  Screen,
  SecondaryButton,
  StyledTextInput,
  Margin,
} from "~components/index";
import { useTheme } from "~hooks/useTheme";

export function NftDetailScreen({ navigation, route }): JSX.Element | null {
  const { nftId, publicKey, connectionUrl } = route.params;
  const { contents, state } = useRecoilValueLoadable(
    nftById({ publicKey, connectionUrl, nftId })
  );

  const nft = (state === "hasValue" && contents) || null;

  if (!nftId) {
    return null;
  }

  // TODO: this is hit when the NFT has been transferred out and
  //       the user re-opens the app to the old url which is no longer
  //       valid.
  //
  //       Should probably just pop the stack here or redirect.
  if (!nft) {
    return null;
  }

  return (
    <ScrollView>
      <Screen>
        <NftImage imageUrl={nft.imageUrl} />
        <Description description={nft.description} />
        <Margin vertical={12}>
          <PrimaryButton
            label="Send"
            onPress={() => {
              navigation.push("SendNFT", { nft });
            }}
          />
        </Margin>
        {nft.attributes ? <Attributes attributes={nft.attributes} /> : null}
      </Screen>
    </ScrollView>
  );
}

function NftImage({ imageUrl }: { imageUrl: string }): JSX.Element {
  return (
    <ProxyImage
      style={{
        width: "100%",
        borderRadius: 8,
        aspectRatio: 1,
      }}
      src={imageUrl ?? UNKNOWN_NFT_ICON_SRC}
    />
  );
}

function Description({ description }: { description: string }): JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={{
        marginTop: 20,
      }}
    >
      <Text
        style={{
          color: theme.custom.colors.secondary,
          fontWeight: "500",
          fontSize: 16,
          lineHeight: 24,
          marginBottom: 4,
        }}
      >
        Description
      </Text>
      <Text
        style={{
          color: theme.custom.colors.fontColor,
          fontWeight: "500",
          fontSize: 16,
        }}
      >
        {description}
      </Text>
    </View>
  );
}

export function NftDetailSendScreen({ navigation, route }): JSX.Element {
  const { nft } = route.params;
  const background = useBackgroundClient();
  const { provider: solanaProvider } = useAnchorContext();
  const ethereumCtx = useEthereumCtx();
  const [destinationAddress, setDestinationAddress] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [wasSent, setWasSent] = useState(false);

  const {
    isValidAddress,
    isErrorAddress,
    isFreshAddress: _,
  } = useIsValidAddress(
    nft.blockchain,
    destinationAddress,
    solanaProvider.connection,
    ethereumCtx.provider
  );

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
      <View
        style={{
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        <View
          style={{
            justifyContent: "space-between",
          }}
        >
          <View>
            <NftImage imageUrl={nft.imageUrl} />
            <StyledTextInput
              autoFocus
              placeholder={`Recipient's ${toTitleCase(nft.blockchain)} Address`}
              value={destinationAddress}
              //   setValue={(e) => setDestinationAddress(e.target.value)}
              //   error={isErrorAddress}
              //   inputProps={{
              //     name: "to",
              //   }}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingTop: 18,
              paddingBottom: 16,
            }}
          >
            <SecondaryButton
              style={{
                marginRight: 8,
              }}
              onPress={close}
              label="Cancel"
            />
            <PrimaryButton
              disabled={!isValidAddress}
              onPress={() => setOpenConfirm(true)}
              label="Next"
            />
          </View>
        </View>
      </View>
    </>
  );
}

//   <ApproveTransactionDrawer
//     openDrawer={openConfirm}
//     setOpenDrawer={setOpenConfirm}
//   >
//     {nft.blockchain === Blockchain.SOLANA && (
//       <SendSolanaConfirmationCard
//         token={{
//           address: nft.publicKey,
//           logo: nft.imageUrl,
//           decimals: 0, // Are there any NFTs that don't use decimals 0?
//           mint: nft.mint,
//         }}
//         destinationAddress={destinationAddress}
//         amount={BigNumber.from(1)}
//         onComplete={() => setWasSent(true)}
//       />
//     )}
//     {nft.blockchain === Blockchain.ETHEREUM && (
//       <SendEthereumConfirmationCard
//         token={{
//           logo: nft.imageUrl,
//           decimals: 0, // Are there any NFTs that don't use decimals 0?
//           address: nft.contractAddress,
//           tokenId: nft.tokenId,
//         }}
//         destinationAddress={destinationAddress}
//         amount={BigNumber.from(1)}
//         onComplete={() => setWasSent(true)}
//       />
//     )}
//   </ApproveTransactionDrawer>

function Attributes({ attributes }: { attributes: any }): JSX.Element {
  const theme = useTheme();

  return (
    <View>
      <Text style={{ color: theme.custom.colors.secondary }}>Attributes</Text>
      <View
        style={{
          marginBottom: 24,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            marginTop: 4,
            marginLeft: -4,
            marginRight: -4,
          }}
        >
          {attributes.map((attr: { traitType: string; value: string }) => {
            return (
              <View
                key={attr.traitType}
                style={{
                  padding: 4,
                }}
              >
                <View
                  style={{
                    borderRadius: 8,
                    backgroundColor: theme.custom.colors.nav,
                    paddingTop: 4,
                    paddingBottom: 4,
                    paddingLeft: 8,
                    paddingRight: 8,
                  }}
                >
                  <Text
                    style={{
                      color: theme.custom.colors.secondary,
                      fontSize: 14,
                    }}
                  >
                    {toTitleCase(attr.traitType)}
                  </Text>
                  <Text
                    style={{
                      color: theme.custom.colors.fontColor,
                      fontSize: 16,
                    }}
                  >
                    {attr.value}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export function NftOptionsButton(): JSX.Element {
  const background = useBackgroundClient();
  const { showActionSheetWithOptions } = useActionSheet();

  const [openDrawer, setOpenDrawer] = useState(false);
  const [nfts] = useLoader(nftMetadata, new Map());
  const [wasBurnt, setWasBurnt] = useState(false);

  useEffect(() => {
    (async () => {
      // If the modal is being closed and the NFT has been burnt then navigate
      // back to the nav root because the send screen is no longer valid as the
      // wallet no longer possesses the NFT.
      if (!openDrawer && wasBurnt) {
        await background.request({
          method: UI_RPC_METHOD_NAVIGATION_TO_ROOT,
          params: [],
        });
      }
    })();
  }, [openDrawer, wasBurnt, background]);

  // @ts-ignore
  //   const nft: any = nfts.get(searchParams.props.nftId);

  //   const isEthereum = nft && nft.contractAddress;

  //   const explorer = isEthereum ? useEthereumExplorer() : useSolanaExplorer();

  //   const connectionUrl = isEthereum
  //     ? useEthereumConnectionUrl()
  //     : useSolanaConnectionUrl();

  //   const onPress = (event: React.MouseEvent<HTMLButtonElement>) => {
  //     setAnchorEl(event.currentTarget);
  //   };

  //   const onClose = () => {
  //     setAnchorEl(null);
  //   };

  //   const onBurn = () => {
  //     onClose();
  //     setOpenDrawer(true);
  //   };

  const onPress = () => {
    const options = ["Burn", "View On Explorer", "Cancel"];
    const destructiveButtonIndex = 0;
    const cancelButtonIndex = 2;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      (selectedIndex: number) => {
        switch (selectedIndex) {
          case 1:
            // Save
            break;

          case destructiveButtonIndex:
            // Delete
            break;

          case cancelButtonIndex:
          // Canceled
        }
      }
    );
  };

  //   <ApproveTransactionDrawer
  //     openDrawer={openDrawer}
  //     setOpenDrawer={setOpenDrawer}
  //   >
  //     <BurnConfirmationCard nft={nft} onComplete={() => setWasBurnt(true)} />
  //   </ApproveTransactionDrawer>

  return <PrimaryButton label="Options" onPress={onPress} />;
}

function BurnConfirmationCard({
  nft,
  onComplete,
}: {
  nft: any;
  onComplete?: () => void;
}): JSX.Element {
  const [state, setState] = useState<
    "confirm" | "sending" | "confirmed" | "error"
  >("confirm");
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const solanaCtx = useSolanaCtx();
  const blockchain = Blockchain.SOLANA;

  const token = {
    logo: nft ? nft.imageUrl : "",
    mint: nft ? nft.mint : "",
    decimals: 0,
  };

  const onConfirm = async () => {
    try {
      // TODO: should use recoil for this to avoid the extra, unnecessary request.
      const amount = parseInt(
        (
          await solanaCtx.connection.getTokenAccountBalance(
            new PublicKey(nft.publicKey)
          )
        ).value.amount
      );
      const _signature = await Solana.burnAndCloseNft(solanaCtx, {
        solDestination: solanaCtx.walletPublicKey,
        mint: new PublicKey(nft.mint.toString()),
        amount,
      });
      setSignature(_signature);
      setState("sending");

      //
      // Confirm the tx.
      //
      try {
        await confirmTransaction(
          solanaCtx.connection,
          _signature,
          solanaCtx.commitment !== "confirmed" &&
            solanaCtx.commitment !== "finalized"
            ? "confirmed"
            : solanaCtx.commitment
        );
        setState("confirmed");
        if (onComplete) {
          onComplete();
        }
      } catch (err: any) {
        // logger.error("unable to confirm NFT burn", err);
        setError(err.toString());
        setState("error");
      }
    } catch (err: any) {
      console.log("error burning NFT", err);
      setError(err);
      setState("error");
    }
  };

  return state === "confirm" ? (
    <BurnConfirmation onConfirm={onConfirm} />
  ) : state === "sending" ? (
    <Sending
      blockchain={Blockchain.SOLANA}
      isComplete={false}
      amount={BigNumber.from(1)}
      token={token}
      signature={signature!}
      titleOverride="Burning"
    />
  ) : state === "confirmed" ? (
    <Sending
      blockchain={Blockchain.SOLANA}
      isComplete
      amount={BigNumber.from(1)}
      token={token}
      signature={signature!}
      titleOverride="Burnt"
    />
  ) : (
    <ErrorConfirmation
      blockchain={blockchain}
      signature={signature!}
      error={error!.toString()}
      onRetry={() => onConfirm()}
    />
  );
}

function BurnConfirmation({
  onConfirm,
}: {
  onConfirm: () => void;
}): JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={{
        height: 400,
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        padding: 16,
      }}
    >
      <View
        style={{
          flex: 1,
        }}
      >
        <Whatshot
          style={{
            color: theme.custom.colors.negative,
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
            fontSize: 60,
            marginTop: 24,
            marginBottom: 24,
          }}
        />
        <Text
          style={{
            backgroundColor:
              theme.custom.colors.approveTransactionTableBackground,
            borderColor: theme.custom.colors.borderFull,
            borderWidth: 1,
            padding: 16,
            color: theme.custom.colors.fontColor,
            fontSize: 20,
            textAlign: "center",
            borderRadius: 8,
          }}
        >
          Are you sure you want to burn this token? This action can't be undone.
        </Text>
      </View>
      <View>
        <NegativeButton label="Confirm" onPress={() => onConfirm()} />
      </View>
    </View>
  );
}
