import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useMemo,
} from "react";
import { FlatList, type ListRenderItem } from "react-native";
import { useQuery } from "@apollo/client";
import {
  type Blockchain,
  formatWalletAddress,
  UI_RPC_METHOD_HIDDEN_TOKENS_UPDATE,
  UNKNOWN_ICON_SRC,
} from "@coral-xyz/common";
import {
  GET_TOKEN_BALANCES_QUERY,
  type ProviderId,
  type ResponseTokenBalance,
} from "@coral-xyz/data-components";
import { useTranslation } from "@coral-xyz/i18n";
import { hiddenTokenAddresses, useBackgroundClient } from "@coral-xyz/recoil";
import {
  ListItemCore,
  ListItemIconCore,
  StyledText,
  Switch,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";
import { useRecoilValue } from "recoil";

type _TokenListEntryFragmentType = NonNullable<
  ResponseTokenBalance["tokenListEntry"]
>;

export function TokenDisplayManagement({
  address,
  blockchain,
}: {
  address: string;
  blockchain: Blockchain;
}) {
  const { t } = useTranslation();
  return (
    <YStack
      ai="center"
      gap={24}
      height="100%"
      paddingTop={12}
      paddingHorizontal={12}
    >
      <YStack paddingHorizontal={12}>
        <StyledText
          color="$baseTextMedEmphasis"
          fontSize="$sm"
          textAlign="center"
        >
          {t("hidden_tokens_description")}
        </StyledText>
      </YStack>
      <HiddenTokensList address={address} blockchain={blockchain} />
    </YStack>
  );
}

export function HiddenTokensList({
  address,
  blockchain,
}: {
  address: string;
  blockchain: Blockchain;
}) {
  const hiddenTokens = useRecoilValue(hiddenTokenAddresses(blockchain));
  const { data } = useQuery(GET_TOKEN_BALANCES_QUERY, {
    fetchPolicy: "cache-only",
    variables: {
      address,
      providerId: blockchain.toUpperCase() as ProviderId,
    },
  });

  const ownedTokens = useMemo<_TokenListEntryFragmentType[]>(
    () =>
      (data?.wallet?.balances?.tokens.edges ?? []).reduce<
        _TokenListEntryFragmentType[]
      >((acc, curr) => {
        if (curr.node.tokenListEntry) acc.push(curr.node.tokenListEntry);
        return acc;
      }, []),
    [data]
  );

  const renderItem = useCallback<ListRenderItem<_TokenListEntryFragmentType>>(
    ({ item, index }) => {
      const isHidden = hiddenTokens.includes(item.address);
      return (
        <_HiddenTokensListItem
          blockchain={blockchain}
          isHidden={isHidden}
          isLast={index === ownedTokens.length - 1}
          item={item}
        />
      );
    },
    [blockchain, hiddenTokens, ownedTokens]
  );

  return (
    <FlatList
      style={{ width: "100%" }}
      numColumns={1}
      data={ownedTokens}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
    />
  );
}

function _HiddenTokensListItem({
  blockchain,
  isHidden,
  isLast,
  item,
}: {
  blockchain: Blockchain;
  isHidden?: boolean;
  isLast: boolean;
  item: _TokenListEntryFragmentType;
}) {
  const background = useBackgroundClient();

  const handleClick = useCallback(async () => {
    // ph101pp todo
    await background.request({
      method: UI_RPC_METHOD_HIDDEN_TOKENS_UPDATE,
      params: [
        blockchain.toLowerCase(),
        isHidden ? "remove" : "add",
        item.address,
      ],
    });
  }, [background, blockchain, isHidden, item.address]);

  return (
    <ListItemCore
      style={{
        backgroundColor: "transparent",
        paddingBottom: isLast ? 24 : undefined,
        pointerEvents: "auto",
      }}
      icon={
        <ListItemIconCore
          radius="$circular"
          image={item.logo || UNKNOWN_ICON_SRC}
          size={44}
        />
      }
    >
      <XStack f={1} ai="center" jc="space-between">
        <YStack maxWidth="75%">
          <StyledText
            textOverflow="ellipsis"
            overflow="hidden"
            whiteSpace="nowrap"
          >
            {item.name || formatWalletAddress(item.address)}
          </StyledText>
          <StyledText color="$baseTextMedEmphasis">
            {item.symbol || "?"}
          </StyledText>
        </YStack>
        <Switch
          backgroundColor={isHidden ? "$baseTextMedEmphasis" : "$accentBlue"}
          borderWidth={0}
          checked={!isHidden}
          cursor="pointer"
          onPress={handleClick}
          padding={2}
          size="$2"
        >
          <Switch.Thumb
            backgroundColor="$baseBackgroundL0"
            animation="quick"
            borderWidth={0}
          />
        </Switch>
      </XStack>
    </ListItemCore>
  );
}
