import { FlatList, Text } from "react-native";

import {
  blockchainBalancesSorted,
  useActiveWallet,
  activeWallet,
} from "@coral-xyz/recoil";
import { ListItem2 } from "@coral-xyz/tamagui";
import { useRecoilValueLoadable } from "recoil";

import { TokenRow } from "~screens/Unlocked/components/Balances";

import { RoundedContainerGroup } from ".";

export function WalletTokenList({ onPressToken }) {
  const _wallet = useRecoilValueLoadable(activeWallet);
  const wallet =
    _wallet.state === "hasValue"
      ? _wallet.contents
      : { publicKey: "", blockchain: "" };

  const _tokens = useRecoilValueLoadable(
    blockchainBalancesSorted({
      publicKey: wallet.publicKey.toString(),
      blockchain: wallet.blockchain,
    })
  );

  const tokens = _tokens.state === "hasValue" ? _tokens.contents : [];

  return (
    <RoundedContainerGroup>
      <FlatList
        data={tokens}
        keyExtractor={(item) => item.address}
        renderItem={({ item: token }) => {
          return (
            <TokenRow
              onPressRow={onPressToken}
              blockchain={wallet.blockchain}
              token={token}
              walletPublicKey={wallet.publicKey.toString()}
            />
          );
        }}
      />
    </RoundedContainerGroup>
  );
}
