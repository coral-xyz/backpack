import { ScrollView } from "react-native";

import { Blockchain } from "@coral-xyz/common";
import { Box, YGroup, Separator } from "@coral-xyz/tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ListItemSentReceived,
  ListItemTokenSwap,
  ListItemNotification,
  ListItemActivity,
  ListItemToken,
  ListItemWalletOverview,
  ListItemFriendRequest,
  UserList,
  SectionedList,
  SettingsList,
} from "~components/ListItem";
import { Screen } from "~components/index";

export function DummyScreen({ navigation }): JSX.Element {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView>
      <Screen style={{ marginTop: insets.top }}>
        <Box marginBottom={12}>
          <SectionedList />
        </Box>
        <Box marginBottom={12}>
          <UserList />
        </Box>
        <Box marginBottom={12}>
          <SettingsList />
        </Box>
        <Box marginBottom={12}>
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
        </Box>
        <Box marginBottom={12}>
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
                caption="USDC -> SOL"
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
        </Box>
        <Box marginBottom={12}>
          <ListItemActivity
            grouped={false}
            onPress={console.log}
            topLeftText="Mad Lads #452"
            bottomLeftText="Minted"
            topRightText="-24.50 SOL"
            bottomRightText="-$2,719.08"
            iconUrl="https://swr.xnfts.dev/1min/https://madlist-images.s3.us-west-2.amazonaws.com/backpack_dev.png"
          />
        </Box>
        <Box marginBottom={12}>
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
        </Box>
        <Box marginBottom={12}>
          <ListItemActivity
            grouped={false}
            onPress={console.log}
            topLeftText="Mad Lads #452"
            bottomLeftText="Minted"
            topRightText="-24.50 SOL"
            bottomRightText="-$2,719.08"
            iconUrl="https://swr.xnfts.dev/1min/https://madlist-images.s3.us-west-2.amazonaws.com/backpack_dev.png"
          />
        </Box>
        <Box marginBottom={12}>
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
        </Box>
        <Box marginBottom={12}>
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
        </Box>

        <Box marginBottom={12}>
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
        </Box>
        <Box marginBottom={12}>
          <ListItemWalletOverview
            name="Wallet 1"
            balance="$4,197.57"
            blockchain={Blockchain.ETHEREUM}
          />
        </Box>
        <Box marginBottom={12}>
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
              />
            </YGroup.Item>
            <YGroup.Item>
              <ListItemWalletOverview
                grouped
                name="Wallet 1"
                blockchain={Blockchain.ETHEREUM}
                balance="$4,197.57"
              />
            </YGroup.Item>
          </YGroup>
        </Box>
        <Box marginBottom={12}>
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
                iconUrl="https://images.xnfts.dev/cdn-cgi/image/fit=contain,width=120,height=120,quality=85/https://swr.xnfts.dev/avatars/backpack_dev/1681311728112?size=120"
              />
            </YGroup.Item>
            <YGroup.Item>
              <ListItemFriendRequest
                grouped
                text="Friend request"
                username="@peterp"
                time="14d"
                iconUrl="https://images.xnfts.dev/cdn-cgi/image/fit=contain,width=120,height=120,quality=85/https://swr.xnfts.dev/avatars/backpack_dev/1681311728112?size=120"
              />
            </YGroup.Item>
          </YGroup>
        </Box>
        <ListItemFriendRequest
          text="Friend request accepted"
          username="@peterp"
          time="7d"
          iconUrl="https://images.xnfts.dev/cdn-cgi/image/fit=contain,width=120,height=120,quality=85/https://swr.xnfts.dev/avatars/backpack_dev/1681311728112?size=120"
        />
      </Screen>
    </ScrollView>
  );
}
