import {
  Blockchain,
  NAV_COMPONENT_TOKEN,
  toTitleCase,
} from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { UserIcon } from "@coral-xyz/react-common";
import { useActiveWallet, useNavigation } from "@coral-xyz/recoil";

import { GroupIdentifier } from "./GroupIdentifier";
import { SpotlightCell } from "./SpotlightCell";

export const SpotlightTokens = ({
  selectedIndex,
  tokens,
  setOpen,
}: {
  selectedIndex: number | null;
  tokens: { image: string; id: string; name: string; address: string }[];
  setOpen: any;
}) => {
  const { t } = useTranslation();
  if (!tokens.length) return null;
  return (
    <div>
      <GroupIdentifier name={t("tokens")} />
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
  const { push } = useNavigation();
  const activeWallet = useActiveWallet();

  return (
    <SpotlightCell
      selected={selected}
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
    </SpotlightCell>
  );
}
