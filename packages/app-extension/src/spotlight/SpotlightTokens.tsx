import {
  Blockchain,
  NAV_COMPONENT_TOKEN,
  toTitleCase,
} from "@coral-xyz/common";
import { UserIcon } from "@coral-xyz/react-common";
import { useActiveWallet, useNavigation } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";

import { SELECTED_BLUE } from "./colors";
import { GroupIdentifier } from "./GroupIdentifier";

export const SpotlightTokens = ({
  selectedIndex,
  tokens,
  setOpen,
}: {
  selectedIndex: number | null;
  tokens: { image: string; id: string; name: string; address: string }[];
  setOpen: any;
}) => {
  if (!tokens.length) return null;
  return (
    <div>
      <GroupIdentifier name="Tokens" />
      {tokens.map((token, index) => (
        <SpotlightToken
          selected={selectedIndex === index}
          token={token}
          setOpen={setOpen}
        />
      ))}
    </div>
  );
};

function SpotlightToken({
  selected,
  token,
  setOpen,
}: {
  selected: boolean;
  token: { image: string; id: string; name: string; address: string };
  setOpen: any;
}) {
  const theme = useCustomTheme();
  const { push } = useNavigation();
  const activeWallet = useActiveWallet();

  return (
    <div
      style={{
        display: "flex",
        padding: 12,
        background: selected ? SELECTED_BLUE : "",
        borderRadius: 8,
        color: theme.custom.colors.fontColor,
        cursor: "pointer",
      }}
      onClick={() => {
        push({
          title: `${toTitleCase(Blockchain.SOLANA)} / ${token.name}`,
          componentId: NAV_COMPONENT_TOKEN,
          componentProps: {
            blockchain: "solana",
            tokenAddress: token.address,
            publicKey: activeWallet.publicKey,
          },
        });
        setOpen(false);
      }}
    >
      <UserIcon size={55} image={token.image} />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        {token.name}
      </div>
    </div>
  );
}
