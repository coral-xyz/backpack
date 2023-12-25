import { Dispatch, SetStateAction, useState } from "react";

import { Blockchain, formatWalletAddress } from "@coral-xyz/common";
import {
  Wallet,
  activeBlockchainWallet,
  getBlockchainLogo,
  secureUserAtom,
  useActiveWallet,
  useBlockchainActiveWallet,
  userClientAtom,
} from "@coral-xyz/recoil";
import {
  XStack,
  XGroup,
  Image,
  StyledText,
  ChevronDownIcon,
  Button,
  CopyIcon,
  Separator,
  Sheet,
  CustomScrollView,
  YStack,
  StackProps,
} from "@coral-xyz/tamagui";
import { useRecoilValue } from "recoil";

export function WalletSwitcherButton({
  activeWallet,
  setOpen,
  copyable,
}: {
  activeWallet: Wallet;
  setOpen: Dispatch<SetStateAction<boolean>>;
  copyable?: boolean;
}) {
  const blockchainIcon = getBlockchainLogo(activeWallet.blockchain, true);

  return (
    <XGroup>
      <XGroup.Item>
        <Button
          borderRadius="$4"
          backgroundColor="$baseBackgroundL1"
          borderColor="$baseBorderMed"
          justifyContent="center"
          alignItems="center"
          height="auto"
          paddingVertical="$2"
          space="$2"
          paddingLeft="$3"
          paddingRight="$2"
          // eslint-disable-next-line react/forbid-component-props
          display="flex"
          onPress={() => setOpen((open) => !open)}
        >
          <Image
            source={{
              width: 16,
              height: 16,
              uri: blockchainIcon,
            }}
          />
          <StyledText fontSize="$sm">{activeWallet.name}</StyledText>
          <ChevronDownIcon size="$1" color="$baseIcon" />
        </Button>
      </XGroup.Item>
      {copyable ? (
        <XGroup.Item>
          <Button
            borderRadius="$4"
            backgroundColor="$baseBackgroundL1"
            borderColor="$baseBorderMed"
            justifyContent="center"
            alignItems="center"
            height="auto"
            paddingVertical="$2"
            space="$2"
            paddingLeft="$2"
            paddingRight="$3"
            // eslint-disable-next-line react/forbid-component-props
            display="flex"
            onPress={() => {
              // copy activeWallet.publicKey
            }}
            icon={<CopyIcon size="$1" color="$baseIcon" />}
          />
        </XGroup.Item>
      ) : null}
    </XGroup>
  );
}

export function WalletSwitcherBottomSheet({
  open,
  setOpen,
  activeWallet,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  activeWallet: Wallet;
}) {
  const user = useRecoilValue(secureUserAtom);
  const userClient = useRecoilValue(userClientAtom);
  const blockchainIcon = getBlockchainLogo(activeWallet.blockchain, true);
  const wallets = Object.entries(
    user.publicKeys.platforms[activeWallet.blockchain]?.publicKeys ?? {}
  );

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      snapPoints={[50]}
      zIndex={910_000}
      animation="quick"
      modal={false}
      disableDrag
    >
      <Sheet.Overlay backgroundColor="rgba(0,0,0,0.3)" zIndex={110_000} />
      <Sheet.Frame
        position="relative"
        borderColor="$borderColor"
        borderWidth="$1"
        borderBottomWidth={0}
        zIndex={110_000}
      >
        <YStack height="100%">
          <CustomScrollView>
            <YStack space="$2" paddingTop="$4">
              {wallets
                .filter(([, info]) => !info.isCold)
                .map(([publicKey, info]) => {
                  const isActive = publicKey === activeWallet.publicKey;
                  return (
                    <XStack
                      padding="$4"
                      marginHorizontal="$2"
                      borderRadius="$11"
                      key={publicKey}
                      space="$4"
                      justifyContent="center"
                      backgroundColor={
                        isActive ? "$invertedBaseBackgroundL0" : undefined
                      }
                      hoverStyle={{
                        backgroundColor: !isActive
                          ? "$baseBackgroundL0"
                          : undefined,
                      }}
                      pressStyle={{
                        backgroundColor: !isActive
                          ? "$baseBackgroundL1"
                          : undefined,
                      }}
                      cursor={!isActive ? "pointer" : undefined}
                      onPress={async () => {
                        if (!isActive) {
                          await userClient.setActiveWallet({
                            blockchain: activeWallet.blockchain,
                            publicKey,
                          });
                        }
                        setOpen(false);
                      }}
                    >
                      <Image
                        source={{
                          width: 16,
                          height: 16,
                          uri: blockchainIcon,
                        }}
                      />
                      <YStack flex={1} justifyContent="center">
                        <StyledText
                          color={
                            isActive
                              ? "$invertedBaseTextHighEmphasis"
                              : "$baseTextHighEmphasis"
                          }
                        >
                          {info.name}
                        </StyledText>
                      </YStack>
                      <YStack justifyContent="center">
                        <StyledText fontSize="$sm" color="$baseTextMedEmphasis">
                          {formatWalletAddress(publicKey, 5)}
                        </StyledText>
                      </YStack>
                    </XStack>
                  );
                })}
            </YStack>
          </CustomScrollView>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}

export function WalletSwitcher({
  blockchain,
  copyable,
  children,
  ...styles
}: {
  blockchain: Blockchain;
  copyable?: boolean;
  children: JSX.Element;
} & StackProps) {
  const activeWallet = useRecoilValue(activeBlockchainWallet(blockchain));
  const [open, setOpen] = useState(false);

  if (!activeWallet) {
    return children;
  }

  return (
    <YStack flex={1} {...styles}>
      <XStack justifyContent="center" alignContent="center">
        <WalletSwitcherButton
          setOpen={setOpen}
          copyable={copyable}
          activeWallet={activeWallet}
        />
      </XStack>
      {children}
      <WalletSwitcherBottomSheet
        setOpen={setOpen}
        open={open}
        activeWallet={activeWallet}
      />
    </YStack>
  );
}
