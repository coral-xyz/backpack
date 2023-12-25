import { useCallback, useEffect, useMemo, useState } from "react";
import type { Blockchain, WalletDescriptor } from "@coral-xyz/common";
import {
  LOAD_PUBLIC_KEY_AMOUNT,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
} from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { EmptyState } from "@coral-xyz/react-common";
import {
  blockchainClientAtom,
  blockchainConfigAtom,
  useBackgroundClient,
} from "@coral-xyz/recoil";
import {
  iterateDerivationPathPattern,
  normalizeDerivationPathPattern,
} from "@coral-xyz/secure-clients";
import {
  BpInput,
  BpPrimaryButton,
  Button,
  CheckIcon,
  ChevronDownIcon,
  Circle,
  Loader,
  Select,
  StyledText,
  XIcon,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";
import { Search } from "@mui/icons-material";
import { useDebounce } from "@uidotdev/usehooks";
import type { BigNumber } from "ethers";
import { ethers } from "ethers";
import { useRecoilValue } from "recoil";

import { formatWalletAddress } from "../../common";
import { BLOCKCHAIN_COMPONENTS } from "../../common/Blockchains";
import { Scrollbar } from "../Layout/Scrollbar";

const fundedAddressesLabel = "Funded Addresses";

export function ImportWallets({
  blockchain,
  mnemonic,
  onNext,
  // onError,
  newAccount = false,
  allowMultiple = true,
}: // autoSelect = false,
{
  blockchain: Blockchain;
  mnemonic?: string | true;
  transport?: any;
  onNext: (walletDescriptor: Array<WalletDescriptor>) => void;
  onError?: (error: Error) => void;
  recovery?: string;
  newAccount?: boolean;
  allowMultiple?: boolean;
  autoSelect?: boolean;
}) {
  const isOnboarding = newAccount;
  const background = useBackgroundClient();
  const blockchainClient = useRecoilValue(blockchainClientAtom(blockchain));
  const blockchainConfig = useRecoilValue(blockchainConfigAtom(blockchain));
  const derivationPathOptions = blockchainConfig.DerivationPathOptions;
  const derivationPathPrefix = blockchainConfig.DerivationPathPrefix;
  const derivationPathRequireHardening =
    blockchainConfig.DerivationPathRequireHardening;

  const symbol = blockchainConfig.GasTokenName;
  const decimals = blockchainConfig.GasTokenDecimals;

  const loadBalances = BLOCKCHAIN_COMPONENTS[blockchain].LoadBalances;

  const [balances, setBalances] = useState<{
    [publicKey: string]: BigNumber;
  } | null>(null);
  const [derivationPathLabel, setDerivationPathLabel] =
    useState<string>(fundedAddressesLabel);
  const [derivationPathInput, setDerivationPathInput] = useState(
    derivationPathOptions[0].pattern
  );
  const [derivationPathInputError, setDerivationPathInputError] = useState<
    string | null
  >(null);

  const [walletDescriptors, setWalletDescriptors] = useState<
    WalletDescriptor[] | null
  >(null);
  const [walletDescriptorsCache, setWalletDescriptorsCache] = useState<
    WalletDescriptor[] | null
  >(null);
  const [checkedWalletDescriptors, setCheckedWalletDescriptors] = useState<
    WalletDescriptor[]
  >([]);

  const debouncedDerivationPathInput = useDebounce(derivationPathInput, 500);
  const [derivationPaths, setDerivationPaths] = useState<string[]>([]);
  const isFundedAddresses = derivationPathLabel === fundedAddressesLabel;

  // Public keys that have already been imported on this account
  const [importedPublicKeys, setImportedPublicKeys] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        if (isOnboarding) {
          return;
        }
        // ph101pp todo
        const blockchainKeyrings = await background.request({
          method: UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
          params: [],
        });
        const keyring = blockchainKeyrings[blockchain];
        setImportedPublicKeys(
          Object.values(keyring)
            .flat()
            .map((a: any) => a.publicKey)
        );
      } catch (_error) {
        // Keyring store locked, either onboarding or left open
      }
    })();
  }, [background, blockchain]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPublicKeys = useCallback(
    async (derivationPaths: string[], mnemonic?: true | string) => {
      const cachedDerivationPaths: WalletDescriptor[] = [];
      const fetchDerivationPaths = derivationPaths.filter((path) => {
        const cached = walletDescriptorsCache?.find(
          (cached) => cached.derivationPath === path
        );
        if (cached) {
          cachedDerivationPaths.push(cached);
          return false;
        }
        return true;
      });

      if (fetchDerivationPaths.length <= 0) {
        return cachedDerivationPaths;
      }

      return blockchainClient
        .previewPublicKeys(fetchDerivationPaths, mnemonic)
        .then((result) => {
          setWalletDescriptorsCache((cached) => [...(cached ?? []), ...result]);
          return derivationPaths.map((path) => {
            const cached = cachedDerivationPaths.find(
              (cached) => cached.derivationPath === path
            );
            if (cached) {
              return cached;
            }
            return result.find((fetched) => fetched.derivationPath === path)!;
          });
        })
        .catch(() => []);
    },
    [blockchainClient, walletDescriptorsCache]
  );

  const reset = () => {
    setCheckedWalletDescriptors([]);
    setDerivationPathInputError(null);
    setBalances(null);
    setWalletDescriptors(null);
  };

  const onDerivationPathInputChange = (pattern: string) => {
    reset();

    const derivationPathOption = derivationPathOptions.find(
      (d) => d.pattern === pattern
    );
    if (derivationPathOption) {
      setDerivationPathLabel(derivationPathOption.label);
    } else {
      setDerivationPathLabel("Custom");
    }
    setDerivationPathInput(pattern);
  };

  const onDerivationPathLabelChange = (label: string) => {
    reset();

    const derivationPathOption = derivationPathOptions.find(
      (d) => d.label === label
    );
    if (derivationPathOption) {
      setDerivationPathInput(derivationPathOption.pattern);
    }
    setDerivationPathLabel(label);
  };

  //
  // Load a list of accounts and their associated balances
  //
  useEffect(() => {
    if (derivationPaths.length === 0) {
      return;
    }

    setCheckedWalletDescriptors([]);

    loadPublicKeys(derivationPaths, mnemonic)
      .then(
        async (
          newWalletDescriptors: {
            publicKey: string;
            derivationPath: string;
            blockchain: Blockchain;
          }[]
        ) => {
          if (!isFundedAddresses) {
            setWalletDescriptors(newWalletDescriptors);
          }
          const balances = await loadBalances(
            newWalletDescriptors.map((descriptor) => descriptor.publicKey)
          );
          const balancesObj = Object.fromEntries(
            balances
              .sort((a, b) =>
                b.balance.lt(a.balance) ? -1 : b.balance.eq(a.balance) ? 0 : 1
              )
              .map((a) => [a.publicKey, a.balance])
          );
          setBalances(balancesObj);
          setWalletDescriptors(
            newWalletDescriptors
              .filter((walletDescriptor) => {
                if (isFundedAddresses) {
                  const balance = balancesObj[walletDescriptor.publicKey];
                  return balance !== undefined && balance.gt(0);
                }
                return true;
              })
              .sort((a, b) => {
                // Sort so that any public keys with balances are displayed first
                if (balancesObj[a.publicKey].lt(balancesObj[b.publicKey])) {
                  return 1;
                } else if (
                  balancesObj[a.publicKey].gt(balancesObj[b.publicKey])
                ) {
                  return -1;
                } else {
                  return 0;
                }
              })
          );
        }
      )
      .catch((error) => {
        // Probably Ledger error, i.e. app is not opened
        console.error(error);
        // if (onError) {
        //   // Call custom error handler if one was passed
        //   onError(error);
        // } else {
        //   throw error;
        // }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mnemonic,
    derivationPaths,
    // loadMnemonicPublicKeys,
    // isFundedAddresses,
    // blockchain,
    // loadBalances,
    // setWalletDescriptors,
  ]);

  //
  // Clear accounts and selected acounts on change of derivation path.
  //
  useEffect(
    () => {
      if (derivationPathLabel === fundedAddressesLabel) {
        const paths: { [path: string]: true } = {
          [derivationPathPrefix]: true, // original path
        };
        [
          { pattern: derivationPathPrefix + "/1'/0'/x'" }, // legacy account 1
          { pattern: derivationPathPrefix + "/2'/0'/x'" }, // legacy account 2
          ...derivationPathOptions,
        ].forEach((derivationPathOption) => {
          iterateDerivationPathPattern(
            derivationPathOption.pattern,
            LOAD_PUBLIC_KEY_AMOUNT
          ).forEach((path) => {
            paths[path] = true;
          });
        });
        setDerivationPaths(Object.keys(paths));
      } else if (debouncedDerivationPathInput) {
        const { derivationPathPattern, derivationPathPatternError } =
          normalizeDerivationPathPattern(
            blockchain,
            debouncedDerivationPathInput,
            derivationPathPrefix,
            derivationPathRequireHardening
          );
        if (derivationPathPatternError || !derivationPathPattern) {
          setDerivationPathInputError(derivationPathPatternError ?? "Error");
          return;
        }
        if (derivationPathPattern!.includes("x")) {
          setDerivationPaths(
            iterateDerivationPathPattern(
              derivationPathPattern!,
              LOAD_PUBLIC_KEY_AMOUNT
            )
          );
        } else {
          setDerivationPaths([derivationPathPattern]);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      blockchain,
      debouncedDerivationPathInput,
      isFundedAddresses,
      derivationPathOptions,
    ]
  );

  const isDisabledPublicKey = useCallback(
    (pk: string): boolean => {
      const disabledPublicKeys = [...importedPublicKeys];
      return disabledPublicKeys.includes(pk);
    },
    [importedPublicKeys]
  );

  const handleSelect = useCallback(
    (publicKey: string, derivationPath: string) => {
      const currentIndex = checkedWalletDescriptors.findIndex(
        (a) => a.publicKey === publicKey
      );

      let newCheckedWalletDescriptors = [...checkedWalletDescriptors];
      if (currentIndex === -1) {
        // Not selected, add it
        const walletDescriptor = {
          blockchain,
          derivationPath,
          publicKey,
        };

        // Adding the account
        if (allowMultiple) {
          newCheckedWalletDescriptors.push(walletDescriptor);
        } else {
          newCheckedWalletDescriptors = [walletDescriptor];
        }
      } else {
        // Removing the account
        newCheckedWalletDescriptors.splice(currentIndex, 1);
      }

      // TODO Sort by account indices
      // newCheckedWalletDescriptors.sort((a, b) => a.index - b.index);
      setCheckedWalletDescriptors(newCheckedWalletDescriptors);
    },
    [allowMultiple, blockchain, checkedWalletDescriptors]
  );

  const renderItem = useCallback(
    (item: WalletDescriptor) => {
      const { publicKey, derivationPath } = item;
      const displayBalance = `${
        balances?.[publicKey]
          ? (+ethers.utils.formatUnits(
              balances?.[publicKey],
              decimals
            )).toFixed(4)
          : "-"
      } ${symbol}`;

      const label = formatWalletAddress(item.publicKey, 5);
      const disabled = isDisabledPublicKey(publicKey);
      const value =
        checkedWalletDescriptors.some(
          (a) => a.derivationPath === derivationPath
        ) || importedPublicKeys.includes(publicKey.toString());

      const onPress = () => {
        if (!disabled) {
          handleSelect(publicKey, derivationPath);
        }
      };

      return (
        <XStack
          key={item.publicKey}
          ai="center"
          jc="space-between"
          opacity={disabled ? 0.4 : 1}
          onPress={onPress}
        >
          <RoundCheckBoxLabel
            onPress={onPress}
            value={value}
            label={
              <YStack space="$1" paddingHorizontal="$2">
                <StyledText>{label}</StyledText>
                <StyledText fontSize="$xs" color="$baseTextMedEmphasis">
                  {derivationPath}
                </StyledText>
              </YStack>
            }
            disabled={disabled}
          />
          <YStack space="$1" paddingHorizontal="$2">
            <StyledText textAlign="right" color="$baseTextMedEmphasis">
              {displayBalance}
            </StyledText>
            <StyledText
              textAlign="right"
              fontSize="$xs"
              color="$baseTextMedEmphasis"
            >
              {/* {derivationPath} */}
            </StyledText>
          </YStack>
        </XStack>
      );
    },
    [
      isDisabledPublicKey,
      balances,
      checkedWalletDescriptors,
      decimals,
      handleSelect,
      symbol,
      importedPublicKeys,
    ]
  );

  const { t } = useTranslation();

  const buttonLabel = (() => {
    // eslint-disable-next-line no-constant-condition
    if (false) {
      return (
        checkedWalletDescriptors.length > 1
          ? t("importing_wallets")
          : t("importing_wallet")
      ).concat("...");
    } else {
      return checkedWalletDescriptors.length > 1
        ? t("import_wallets")
        : t("import_wallet");
    }
  })();

  return (
    <YStack space="$4" paddingVertical="$4" flex={1} height="100%">
      <YStack space="$4" paddingHorizontal="$4" flex={0} flexShrink={0}>
        <DerivationPathSelector
          derivationPathLabel={derivationPathLabel}
          setDerivationPathLabel={onDerivationPathLabelChange}
          derivationPathOptions={[
            { label: fundedAddressesLabel },
            ...derivationPathOptions,
            ...(derivationPathLabel === "Custom" ? [{ label: "Custom" }] : []),
          ]}
        />
        {!isFundedAddresses ? (
          <InputGroup
            hasError={Boolean(derivationPathInputError)}
            errorMessage={derivationPathInputError ?? undefined}
          >
            <BpInput
              hasError={Boolean(derivationPathInputError)}
              autoCapitalize="none"
              value={derivationPathInput}
              onChangeText={onDerivationPathInputChange}
            />
          </InputGroup>
        ) : null}
      </YStack>
      <YStack flex={1}>
        <YStack position="absolute" width="100%" height="100%">
          <Scrollbar>
            {walletDescriptors === null ||
            (balances === null && isFundedAddresses) ? (
              <Loader />
            ) : !derivationPathInputError && walletDescriptors.length > 0 ? (
              <YStack space="$2" paddingHorizontal="$4">
                {walletDescriptors?.map(renderItem)}
              </YStack>
            ) : (
              <YStack padding="$4">
                <EmptyState
                  icon={(props: any) => <Search name="error" {...props} />}
                  title="No funded wallets found"
                  subtitle="Please select a derivation path from the menu to import your wallets."
                />
              </YStack>
            )}
          </Scrollbar>
        </YStack>
      </YStack>
      <YStack flex={0} flexShrink={0} paddingHorizontal="$4">
        <BpPrimaryButton
          label={buttonLabel}
          disabled={checkedWalletDescriptors.length === 0}
          onPress={() => {
            onNext(checkedWalletDescriptors);
            setImportedPublicKeys((i) =>
              i.concat(checkedWalletDescriptors.map((w) => w.publicKey))
            );
            setCheckedWalletDescriptors([]);
          }}
        />
      </YStack>
    </YStack>
  );
}

function DerivationPathSelector({
  derivationPathLabel,
  setDerivationPathLabel,
  derivationPathOptions,
}: {
  derivationPathLabel: string | null;
  setDerivationPathLabel: (label: string) => void;
  derivationPathOptions: { label: string }[];
}): JSX.Element {
  return (
    <Select
      defaultValue={derivationPathLabel ?? undefined}
      onValueChange={setDerivationPathLabel}
    >
      <Select.Trigger
        width="100%"
        borderWidth={0}
        padding="0"
        outlineStyle="none"
        display="flex"
      >
        <Button
          h={48}
          bg="$baseBackgroundL1"
          br={12}
          borderWidth={2}
          borderColor="$baseBorderLight"
          jc="space-between"
          flex={1}
        >
          <StyledText>{derivationPathLabel}</StyledText>
          <ChevronDownIcon size={22} color="$baseTextMedEmphasis" />
        </Button>
      </Select.Trigger>
      <Select.Content zIndex={100_000}>
        {/* <Select.ScrollUpButton /> */}
        <Select.Viewport
          outlineWidth="2px"
          backgroundColor="$baseBackgroundL1"
          outlineColor="$baseBorderMed"
          outlineStyle="solid"
        >
          <Select.Group borderWidth="0" outlineStyle="none">
            {/* <Select.Label >
              Derivation Paths
            </Select.Label> */}
            {useMemo(
              () =>
                derivationPathOptions.map((item, i) => {
                  return (
                    <Select.Item
                      index={i}
                      key={item.label}
                      value={item.label}
                      hoverStyle={{
                        backgroundColor: "$baseBackgroundL2",
                      }}
                    >
                      <Select.ItemText color="$baseTextHighEmphasis">
                        {item.label}
                      </Select.ItemText>
                      <Select.ItemIndicator marginLeft="auto">
                        <CheckIcon color="$baseIcon" size={16} />
                      </Select.ItemIndicator>
                    </Select.Item>
                  );
                }),
              [derivationPathOptions]
            )}
          </Select.Group>
        </Select.Viewport>
        {/* <Select.ScrollDownButton /> */}
      </Select.Content>
    </Select>
  );
  // const renderItem = (label: string) => {
  //   return (
  //     <BottomSheetCell isActive={label === derivationPathLabel} label={label} />
  //   );
  // };

  // return (
  //   <>
  //     <Button
  //       h={48}
  //       bg="$baseBackgroundL1"
  //       br={12}
  //       borderWidth={2}
  //       borderColor="$baseBorderLight"
  //       jc="space-between"
  //       onPress={onPress}
  //     >
  //       <StyledText>{derivationPathLabel}</StyledText>
  //       <ChevronDownIcon size={22} color="$baseTextMedEmphasis" />
  //     </Button>
  //     {/* <BottomSheet
  //       headerTitle="Derivation Paths"
  //       isVisible={isVisible}
  //       setIsVisible={setIsVisible}
  //       onPress={setDerivationPathLabel}
  //       data={derivationPathOptions.map((path) => path.label)}
  //       renderItem={renderItem}
  //       keyExtractor={(label) => label}
  //     /> */}
  //   </>
  // );
}

export const RoundCheckBoxLabel: React.FC<{
  disabled?: boolean;
  label: string | JSX.Element;
  value: any;
  onPress: (value: boolean) => void;
}> = ({ disabled, label, value, onPress }) => {
  return (
    <XStack
      disabled={disabled || !label}
      onPress={() => onPress(!value)}
      accessibilityRole="checkbox"
      accessibilityState={{ disabled, checked: value }}
    >
      <Circle
        justifyContent="center"
        alignItems="center"
        borderWidth={2}
        borderColor="$baseTextHighEmphasis"
        width={24}
        height={24}
      >
        {value ? (
          <Circle
            backgroundColor="$baseTextHighEmphasis"
            height={12}
            width={12}
          />
        ) : null}
      </Circle>
      {typeof label === "string" ? (
        <StyledText ml={8} color="$baseTextMedEmphasis">
          {label}
        </StyledText>
      ) : (
        label
      )}
    </XStack>
  );
};

export function InputGroup({
  hasError,
  children,
  errorMessage,
}: {
  hasError?: boolean;
  children: React.ReactNode;
  errorMessage?: string;
}): JSX.Element {
  return (
    <>
      <YStack borderColor={hasError ? "$redText" : "transparent"}>
        {children}
      </YStack>

      {errorMessage ? (
        <StyledText color="$redText" fontSize="$sm">
          {errorMessage}
        </StyledText>
      ) : null}
    </>
  );
}
