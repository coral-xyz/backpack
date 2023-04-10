import { FlatList, Text } from "react-native";

import {
  blockchainBalancesSorted,
  useActiveWallet,
  activeWallet,
} from "@coral-xyz/recoil";
import { useRecoilValueLoadable } from "recoil";

import { ListRowSeparator } from "~components/index";
import { TokenRow } from "~screens/Unlocked/components/Balances";

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
    <FlatList
      data={tokens}
      keyExtractor={(item) => item.address}
      ItemSeparatorComponent={ListRowSeparator}
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
  );
}
