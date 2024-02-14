import { useTranslation } from "@coral-xyz/i18n";
import { UserIcon } from "@coral-xyz/react-common";
import { useOpenPlugin } from "@coral-xyz/recoil";

import { GroupIdentifier } from "./GroupIdentifier";
import { SpotlightCell } from "./SpotlightCell";

export function SpotlightXnfts({
  xnfts,
  selectedIndex,
  setOpen,
}: {
  xnfts: Array<any>;
  selectedIndex: number | null;
  setOpen: any;
}) {
  const { t } = useTranslation();
  if (!xnfts.length) return null;
  return (
    <div>
      <GroupIdentifier name={t("applications")} />
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
  const openPlugin = useOpenPlugin();

  return (
    <SpotlightCell
      selected={selected}
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
    </SpotlightCell>
  );
}
