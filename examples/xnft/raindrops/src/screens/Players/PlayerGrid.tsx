import { View } from "react-xnft";
import LoadingIndicator from "../../components/LoadingIndicator";
import useFetchPlayers from "../../hooks/useFetchRaindropsPlayers";
import PlayerGridItem from "./PlayerGridItem";
import { Player } from "../../mock-data/players";

export function PlayerGrid() {
  const { loading, players } = useFetchPlayers();

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <View
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-evenly",
        rowGap: "32px",
        columnGap: "24px",
      }}
    >
      {players.map((player: Player) => (
        <View
          key={player.id.toString()}
          style={{
            margin: "10px",
            height: "200px",
            width: "200px",
          }}
        >
          <PlayerGridItem player={player} />
        </View>
      ))}
    </View>
  );
}
