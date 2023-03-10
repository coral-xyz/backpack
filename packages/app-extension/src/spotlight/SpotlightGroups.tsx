import { GroupIdentifier } from "./GroupIdentifier";

export const SpotlightGroups = ({
  groups,
}: {
  groups: {
    name: string;
    image: string;
    collectionId: string;
  }[];
}) => {
  return (
    <div>
      <GroupIdentifier name="NFTs" />
      {groups.map((group) => (
        <SpotlightGroup group={group} />
      ))}
    </div>
  );
};

function SpotlightGroup({
  group,
}: {
  group: { name: string; image: string; collectionId: string };
}) {
  return (
    <div>
      {group.name}
      {group.image}
    </div>
  );
}
