import {
  memo,
  useMemo,
  useCallback,
  useState,
  useEffect,
  useTransition,
  useDeferredValue,
} from "react";
import {
  Alert,
  Button,
  FlatList,
  Image,
  ScrollView,
  SectionList,
  StyleSheet,
  View,
} from "react-native";

import Constants from "expo-constants";

import { formatUsd, Blockchain, formatWalletAddress } from "@coral-xyz/common";
import { useActiveWallet } from "@coral-xyz/recoil";
import {
  Stack,
  _ListItemOneLine,
  Box,
  ListItem,
  ListItemActivity,
  ListItemFriendRequest,
  ListItemLabelValue,
  ListItemNotification,
  ListItemSentReceived,
  ListItemSettings,
  ListItemToken,
  ListItemTokenSwap,
  ListItemWalletOverview,
  RoundedContainerGroup,
  Separator,
  StyledText,
  XStack,
  YGroup,
} from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ArrowRightIcon } from "~components/Icon";
import { ListItemTokenPrice } from "~components/ListItem";
import { StyledTextInput } from "~components/StyledTextInput";
import { CurrentUserAvatar, UserAvatar } from "~components/UserAvatar";
import { Screen, ScreenEmptyList } from "~components/index";
import DATA from "~screens/TokenPriceListData.json";

// original component we use in a bunch of places, wrapped
export const WalletAddressLabel = memo(function WalletAddressLabel({
  publicKey,
}: {
  publicKey: string;
}): JSX.Element {
  return (
    <Box p={4} backgroundColor="$background" borderRadius="$small">
      <StyledText fontSize="$sm" color="$secondary">
        ({formatWalletAddress(publicKey)})
      </StyledText>
    </Box>
  );
});

// returns a name (username or wallet name) next to an address (public key)
export function NameAddressLabel({
  publicKey,
  name,
}: {
  publicKey: string;
  name: string;
}): JSX.Element {
  return (
    <XStack alignItems="center">
      <StyledText mr={8} fontSize="$sm" color="$fontColor">
        {name}
      </StyledText>
      <WalletAddressLabel publicKey={publicKey} />
    </XStack>
  );
}

// Used for the "from" functionality in sending
export function CurrentUserAvatarWalletNameAddress() {
  const w = useActiveWallet();
  return (
    <XStack alignItems="center">
      <Box mr={8}>
        <CurrentUserAvatar size={24} />
      </Box>
      <NameAddressLabel publicKey={w.publicKey} name={w.name} />
    </XStack>
  );
}

// used for the "to" functionality in sending
// can also be used for the current user "to" when sending to another wallet, just pass in that info
export function AvatarUserNameAddress({
  username,
  avatarUrl,
  publicKey,
}: {
  username: string;
  avatarUrl: string;
  publicKey: string;
}): JSX.Element {
  return (
    <XStack alignItems="center">
      <Box mr={8}>
        <UserAvatar uri={avatarUrl} size={24} />
      </Box>
      <NameAddressLabel publicKey={publicKey} name={username} />
    </XStack>
  );
}

// address,
// username: user?.username,
// walletName: user?.walletName, // TODO see if we need walletName
// image: user?.image,
// uuid: user?.uuid,

function TableWrapper({ children }) {
  return (
    <YGroup
      overflow="hidden"
      borderWidth={2}
      borderColor="$borderFull"
      borderRadius="$container"
      backgroundColor="$nav"
      separator={<Separator />}
    >
      {children}
    </YGroup>
  );
}

function Sep() {
  return (
    <View style={{ paddingLeft: 60, backgroundColor: "white" }}>
      <View
        style={{ height: StyleSheet.hairlineWidth, backgroundColor: "gray" }}
      />
    </View>
  );
}

function UserList() {
  const data = Array.from({ length: 10 }).map(() => {
    return {
      title: "armani",
      iconUrl:
        "https://images.xnfts.dev/cdn-cgi/image/fit=contain,width=120,height=120,quality=85/https://swr.xnfts.dev/avatars/backpack_dev/1681404388701?size=120",
    };
  });

  return (
    <RoundedContainerGroup>
      <FlatList
        data={data}
        ItemSeparatorComponent={Separator}
        renderItem={({ item }) => {
          return (
            <_ListItemOneLine
              title={item.title}
              icon={
                <Image
                  source={{
                    uri: "https://images.xnfts.dev/cdn-cgi/image/fit=contain,width=120,height=120,quality=85/https://swr.xnfts.dev/avatars/backpack_dev/1681404388701?size=120",
                  }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 64,
                    aspectRatio: 1,
                  }}
                />
              }
              iconAfter={<ArrowRightIcon />}
            />
          );
        }}
      />
    </RoundedContainerGroup>
  );
}

function SettingsList() {
  return (
    <YGroup
      overflow="hidden"
      borderWidth={2}
      borderColor="$borderFull"
      borderRadius="$container"
      separator={<Sep />}
    >
      <YGroup.Item>
        <ListItemSettings title="Wallets" iconName="account-balance-wallet" />
      </YGroup.Item>
      <YGroup.Item>
        <ListItemSettings title="Account" iconName="account-circle" />
      </YGroup.Item>
      <YGroup.Item>
        <ListItemSettings title="Preferences" iconName="settings" />
      </YGroup.Item>
      <YGroup.Item>
        <ListItemSettings title="xNFTs" iconName="apps" />
      </YGroup.Item>
      <YGroup.Item>
        <ListItemSettings title="Authenticated Apps" iconName="vpn-key" />
      </YGroup.Item>
      <YGroup.Item>
        <ListItemSettings title="Lock" iconName="lock" />
      </YGroup.Item>
    </YGroup>
  );
}

function SectionedList() {
  const sections = [
    {
      title: "A",
      data: [
        {
          address: "5iM4...F5To",
          action: "Sent",
          amount: "4 USDC",
          iconUrl:
            "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
        },
        // add more sent transactions here
      ],
    },
    {
      title: "B",
      data: [
        {
          address: "5iM4...F5To",
          action: "Received",
          amount: "4 USDC",
          iconUrl:
            "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
        },
        {
          address: "5iM4...F5To",
          action: "Received",
          amount: "4 USDC",
          iconUrl:
            "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
        },
      ],
    },
  ];

  return (
    <SectionList
      sections={sections}
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={<StyledText>Header</StyledText>}
      // separator cuts into the border but we can figure this out
      // ItemSeparatorComponent={Separator}
      renderSectionHeader={({ section: { title } }) => (
        <StyledText my={12}>{title}</StyledText>
      )}
      renderItem={({ item, section, index }) => {
        const isFirst = index === 0;
        const isLast = index === section.data.length - 1;

        return (
          <RoundedContainerGroup
            disableTopRadius={!isFirst}
            disableBottomRadius={!isLast}
          >
            <ListItemSentReceived
              grouped
              address={item.address}
              action={item.action}
              amount={item.amount}
              iconUrl={item.iconUrl}
            />
          </RoundedContainerGroup>
        );
      }}
    />
  );
}

function SendDetail({ username, image, address, networkFee = "0.0000005" }) {
  const feeValue = `${networkFee} SOL`;
  return (
    <TableWrapper>
      <YGroup.Item>
        <ListItemLabelValue label="From">
          <CurrentUserAvatarWalletNameAddress />
        </ListItemLabelValue>
      </YGroup.Item>
      <YGroup.Item>
        <ListItemLabelValue label="To">
          <AvatarUserNameAddress
            username={username}
            avatarUrl={image}
            publicKey={address}
          />
        </ListItemLabelValue>
      </YGroup.Item>
      <YGroup.Item>
        <ListItemLabelValue label="Network fee" value={feeValue} />
      </YGroup.Item>
    </TableWrapper>
  );
}

function ActivityDetail() {
  return (
    <YGroup
      overflow="hidden"
      borderWidth={2}
      borderColor="$borderFull"
      borderRadius="$container"
      backgroundColor="$nav"
      separator={<Separator />}
    >
      <YGroup.Item>
        <ListItemLabelValue label="Date" value="April 19th at 933pm" />
      </YGroup.Item>
      <YGroup.Item>
        <ListItemLabelValue label="Type" value="NFT Mint" />
      </YGroup.Item>
      <YGroup.Item>
        <ListItemLabelValue label="Item" value="Mad Lads #3664" />
      </YGroup.Item>
      <YGroup.Item>
        <ListItemLabelValue label="Source" value="Candy Machine v3" />
      </YGroup.Item>
      <YGroup.Item>
        <ListItemLabelValue label="Network Fee" value="0.0000005 SOL" />
      </YGroup.Item>
      <YGroup.Item>
        <ListItemLabelValue
          label="Status"
          value="Confirmed"
          valueColor="green"
        />
      </YGroup.Item>
      <YGroup.Item>
        <ListItemLabelValue
          label="Signature"
          value="4335...CRaM"
          valueColor="blue"
          iconAfter={<MaterialIcons name="keyboard-arrow-right" size={24} />}
          onPress={() => {
            Alert.alert("open explorer");
          }}
        />
      </YGroup.Item>
    </YGroup>
  );
}

function ExpoConfigSettings() {
  const [show, setShow] = useState(false);
  return (
    <View style={{ marginVertical: 8 }}>
      <Button
        title={show ? "hide" : "show config variables"}
        onPress={() => setShow(!show)}
      />
      {show ? (
        <StyledText fontSize="$xs">
          {JSON.stringify(Constants.expoConfig?.extra, null, 2)}
        </StyledText>
      ) : null}
    </View>
  );
}

function TokenPriceListSearch() {
  const [filter, setFilter] = useState("");
  const [inputText, setInputText] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleChangeText = (text: string) => {
    const lowercase = text.toLowerCase();
    setFilter(lowercase);
    startTransition(() => {
      setInputText(lowercase);
    });
  };

  const handlePressRow = (id) => {
    console.log("row", id);
  };

  const filteredSections = useMemo(() => {
    const sections = [
      {
        title: "Favorites",
        data: DATA.slice(0, 1),
      },
      {
        title: "Results",
        data: DATA,
      },
    ];

    return sections.map((section) => {
      return {
        title: section.title,
        data: section.data.filter((item) => {
          return item.name.toLowerCase().includes(inputText);
        }),
      };
    });
  }, [inputText]);

  return (
    <Stack>
      <Stack>
        <StyledTextInput
          placeholder="Search"
          onChangeText={handleChangeText}
          value={filter}
        />
      </Stack>
      <SectionList
        sections={filteredSections}
        ListEmptyComponent={
          <ScreenEmptyList
            iconName="settings"
            title="No results"
            subtitle="Try a dfiferent option"
          />
        }
        renderSectionHeader={({ section }) => {
          return (
            <StyledText mb={8} mt={24}>
              {section.title}
            </StyledText>
          );
        }}
        renderItem={({ item, section, index }) => {
          const isFirst = index === 0;
          const isLast = index === section.data.length - 1;
          return (
            <RoundedContainerGroup
              disableTopRadius={!isFirst}
              disableBottomRadius={!isLast}
            >
              <ListItemTokenPrice
                grouped
                id={item.id}
                symbol={item.symbol}
                name={item.name}
                imageUrl={item.image}
                percentChange={item.price_change_percentage_24h}
                onPress={handlePressRow}
                price={formatUsd(item.current_price)}
              />
            </RoundedContainerGroup>
          );
        }}
      />
    </Stack>
  );
}

const Section = ({
  title,
  children,
  single,
  grouped,
}: {
  title: string;
  children?: React.ReactNode;
  single?: React.ReactNode;
  grouped?: React.ReactNode;
}) => {
  return (
    <Stack py={8} mb={16}>
      <StyledText size="$lg">{title}</StyledText>
      <Stack mt={4}>{children}</Stack>

      {single ? (
        <Stack mb={12}>
          <StyledText>Single</StyledText>
          <Stack mt={4}>{single}</Stack>
        </Stack>
      ) : null}
      {grouped ? (
        <Stack>
          <StyledText>Grouped</StyledText>
          <Stack mt={4}>{grouped}</Stack>
        </Stack>
      ) : null}
    </Stack>
  );
};

export function UtilsDesignScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView>
      <Screen style={{ marginTop: insets.top }}>
        <StyledText fontSize="$xl" fontWeight="800">
          Design System & Diagnostics
        </StyledText>
        <ExpoConfigSettings />
        <Section title="ListItemTokenPrice">
          <ListItemTokenPrice
            id="1"
            name="Bitcoin"
            symbol="BTC"
            price="$62,099"
            imageUrl=""
            percentChange="-0.1"
            onPress={console.log}
          />
        </Section>
        <Section title="TokenPriceListSearch">
          <TokenPriceListSearch />
        </Section>
        <Section title="AvatarUserNameAddress">
          <ListItem backgroundColor="$nav">
            <AvatarUserNameAddress
              username="peter"
              avatarUrl="https://swr.xnfts.dev/avatars/backpack_dev/1683979620504"
              publicKey="6XxTYK4sKYU8G71emxkeCCLpHQx7xmgwy2mDhUTPD5Xm"
            />
          </ListItem>
        </Section>
        <Section title="CurrentUserAvatarWalletNameAddress">
          <ListItem backgroundColor="$nav">
            <CurrentUserAvatarWalletNameAddress />
          </ListItem>
        </Section>
        <Section title="NameAddressLabel">
          <ListItem backgroundColor="$nav">
            <NameAddressLabel
              name="Wallet 1"
              publicKey="6XxTYK4sKYU8G71emxkeCCLpHQx7xmgwy2mDhUTPD5Xm"
            />
          </ListItem>
        </Section>

        <Section title="SendDetail">
          <SendDetail
            username="peter"
            image="https://swr.xnfts.dev/avatars/backpack_dev/1683979620504"
            address="6XxTYK4sKYU8G71emxkeCCLpHQx7xmgwy2mDhUTPD5Xm"
          />
        </Section>
        <Section title="ActivityDetail">
          <ActivityDetail />
        </Section>
        <Section title="SectionedList">
          <SectionedList />
        </Section>
        <Section title="UserList">
          <UserList />
        </Section>
        <Section title="SettingsList">
          <SettingsList />
        </Section>
        <Section
          title="ListItemSentReceived"
          single={
            <>
              <ListItemSentReceived
                address="5iM4...F5To"
                action="Sent"
                amount="4 USDC"
                iconUrl="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png"
              />
              <ListItemSentReceived
                address="5iM4...F5To"
                action="Received"
                amount="4 USDC"
                iconUrl="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png"
              />
            </>
          }
        />

        <Section title="ListItemTokenSwap">
          <YGroup
            overflow="hidden"
            borderWidth={2}
            borderColor="$borderFull"
            borderRadius="$container"
            backgroundColor="$nav"
            separator={<Separator />}
          >
            <YGroup.Item>
              <ListItemTokenSwap
                grouped
                title="Token Swap"
                caption="orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE USDC -> orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE"
                sent="-5.00 USDC"
                received="+0.2423 SOL"
              />
            </YGroup.Item>
            <YGroup.Item>
              <ListItemTokenSwap
                grouped
                title="Token Swap"
                caption="SOL -> USDC"
                sent="-5.0002 SOL"
                received="+100.00 USDC"
              />
            </YGroup.Item>
          </YGroup>
        </Section>

        <Section
          title="ListItemActivity"
          single={
            <>
              <ListItemActivity
                grouped={false}
                onPress={console.log}
                topLeftText="Mad Lads #452"
                bottomLeftText="Minted"
                topRightText="-24.50 SOL"
                bottomRightText="-$2,719.08"
                iconUrl="https://swr.xnfts.dev/1min/https://madlist-images.s3.us-west-2.amazonaws.com/backpack_dev.png"
              />

              <ListItemActivity
                grouped={false}
                onPress={console.log}
                topLeftText="Mad Lads #452"
                bottomLeftText="Minted"
                topRightText="-24.50 SOL"
                bottomRightText="-$2,719.08"
                iconUrl="https://swr.xnfts.dev/1min/https://madlist-images.s3.us-west-2.amazonaws.com/backpack_dev.png"
              />
            </>
          }
          grouped={
            <YGroup
              overflow="hidden"
              borderWidth={2}
              borderColor="$borderFull"
              borderRadius="$container"
              separator={<Separator />}
            >
              <YGroup.Item>
                <ListItemActivity
                  grouped
                  onPress={console.log}
                  topLeftText="Nokiamon"
                  bottomLeftText="Minted"
                  topRightText="-5.50 SOL"
                  bottomRightText="-$719.08"
                  iconUrl="https://swr.xnfts.dev/1min/https://shdw-drive.genesysgo.net/CbWGfYfTJvBfBXCsQPj3Hvvxvfgm3bVkxMSBHJGgdQp1/095.gif"
                />
              </YGroup.Item>
              <YGroup.Item>
                <ListItemActivity
                  grouped
                  onPress={console.log}
                  topLeftText="Moongame"
                  bottomLeftText="Installed"
                  topRightText="FREE"
                  bottomRightText="$0.00"
                  iconUrl="https://images.xnfts.dev/cdn-cgi/image/fit=contain,width=400,height=400,quality=85/https://cloudflare-ipfs.com/ipfs/bafybeiehsmfy53jnypnadxhyg3wbk43gui7gzl57uykcnw2ed5fcniqwaa/assets/icon.png"
                />
              </YGroup.Item>
            </YGroup>
          }
        />

        <Section title="ListItemNotification">
          <YGroup
            overflow="hidden"
            borderWidth={2}
            borderColor="$borderFull"
            borderRadius="$container"
            separator={<Separator />}
          >
            <YGroup.Item>
              <ListItemNotification
                grouped
                unread
                title="Dropzone"
                body="Claim your weekly drop"
                time="14d"
                iconUrl="https://images.xnfts.dev/cdn-cgi/image/fit=contain,width=120,height=120,quality=85/https://swr.xnfts.dev/avatars/backpack_dev/1681311728112?size=120"
              />
            </YGroup.Item>
            <YGroup.Item>
              <ListItemNotification
                grouped
                title="PsyOptions"
                body="New vaults are available to trade: SOL, MNGO and PSY from the comfort of your own home. Extra options are available if you want to, but no pressure, this is just a demo notification."
                time="3min"
                iconUrl="https://images.xnfts.dev/cdn-cgi/image/fit=contain,width=120,height=120,quality=85/https://swr.xnfts.dev/avatars/backpack_dev/1681311728112?size=120"
              />
            </YGroup.Item>
          </YGroup>
        </Section>

        <Section
          title="ListItemToken"
          single={
            <ListItemToken
              onPressRow={console.log}
              token={{
                name: "Coral",
                ticker: "CORAL",
                usdBalance: 100,
                displayBalance: 100,
                recentUsdBalanceChange: 1.24,
                logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
              }}
              blockchain={Blockchain.SOLANA}
              walletPublicKey="xyz"
            />
          }
          grouped={
            <YGroup
              overflow="hidden"
              borderWidth={2}
              borderColor="$borderFull"
              borderRadius="$container"
              separator={<Separator />}
            >
              <YGroup.Item>
                <ListItemToken
                  grouped
                  onPressRow={console.log}
                  token={{
                    name: "SOL",
                    ticker: "SOL",
                    usdBalance: 3578.04,
                    displayBalance: 43.45983943,
                    recentUsdBalanceChange: -75.65,
                    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png",
                  }}
                  blockchain={Blockchain.SOLANA}
                  walletPublicKey="xyz"
                />
              </YGroup.Item>
              <YGroup.Item>
                <ListItemToken
                  grouped
                  onPressRow={console.log}
                  token={{
                    name: "USDC",
                    ticker: "USDC",
                    usdBalance: 847.39,
                    displayBalance: 847.39,
                    recentUsdBalanceChange: -0.04,
                    logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
                  }}
                  blockchain={Blockchain.SOLANA}
                  walletPublicKey="xyz"
                />
              </YGroup.Item>
            </YGroup>
          }
        />

        <Section
          title="ListItemWalletOverview"
          single={
            <ListItemWalletOverview
              name="Wallet 1"
              balance="$4,197.57"
              blockchain={Blockchain.ETHEREUM}
              publicKey="abcxyz"
              type="derived"
              onPress={console.log}
            />
          }
          grouped={
            <YGroup
              overflow="hidden"
              borderWidth={2}
              borderColor="$borderFull"
              borderRadius="$container"
            >
              <YGroup.Item>
                <ListItemWalletOverview
                  grouped
                  name="Wallet 1"
                  blockchain={Blockchain.SOLANA}
                  balance="$4,197.57"
                  publicKey="abcxyz"
                  type="derived"
                  onPress={console.log}
                />
              </YGroup.Item>
              <YGroup.Item>
                <ListItemWalletOverview
                  grouped
                  name="Wallet 1"
                  blockchain={Blockchain.ETHEREUM}
                  balance="$4,197.57"
                  publicKey="abcxyz"
                  type="dehydrated"
                  onPress={console.log}
                />
              </YGroup.Item>
            </YGroup>
          }
        />

        <Section
          title="ListItemFriendRequest"
          single={
            <ListItemFriendRequest
              text="Friend request accepted"
              username="@peterp"
              time="7d"
              avatarUrl="https://images.xnfts.dev/cdn-cgi/image/fit=contain,width=120,height=120,quality=85/https://swr.xnfts.dev/avatars/backpack_dev/1681311728112?size=120"
            />
          }
          grouped={
            <YGroup
              overflow="hidden"
              borderWidth={2}
              borderColor="$borderFull"
              borderRadius="$container"
            >
              <YGroup.Item>
                <ListItemFriendRequest
                  grouped
                  text="Friend request accepted"
                  username="@peterp"
                  time="7d"
                  avatarUrl="https://images.xnfts.dev/cdn-cgi/image/fit=contain,width=120,height=120,quality=85/https://swr.xnfts.dev/avatars/backpack_dev/1681311728112?size=120"
                />
              </YGroup.Item>
              <YGroup.Item>
                <ListItemFriendRequest
                  grouped
                  text="Friend request"
                  username="@peterp"
                  time="14d"
                  avatarUrl="https://images.xnfts.dev/cdn-cgi/image/fit=contain,width=120,height=120,quality=85/https://swr.xnfts.dev/avatars/backpack_dev/1681311728112?size=120"
                />
              </YGroup.Item>
            </YGroup>
          }
        />
      </Screen>
    </ScrollView>
  );
}
