import { NAV_COMPONENT_NFT_DETAIL } from "@coral-xyz/common";
import { UserIcon } from "@coral-xyz/react-common";
import { useOpenPlugin } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";

import { SELECTED_BLUE } from "./colors";
import { GroupIdentifier } from "./GroupIdentifier";

export function SpotlightXnfts({
  xnfts,
  selectedIndex,
  setOpen,
}: {
  xnfts: Array<any>;
  selectedIndex: number | null;
  setOpen: any;
}) {
  if (!xnfts.length) return null;
  return (
    <div>
      <GroupIdentifier name="Applications" />
      {xnfts.map((xnft, index) => (
        <SpotlightXnft
          selected={selectedIndex === index}
          xnft={xnft}
          setOpen={setOpen}
        />
      ))}
    </div>
  );
}

function SpotlightXnft({
  xnft,
  selected,
  setOpen,
}: {
  xnft: any;
  selected: boolean;
  setOpen: any;
}) {
  const theme = useCustomTheme();
  const openPlugin = useOpenPlugin();

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
        setOpen(false);
        openPlugin(xnft.publicKey);
      }}
    >
      <UserIcon size={55} image={xnft.image} />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        {xnft.name}
      </div>
    </div>
  );
}
