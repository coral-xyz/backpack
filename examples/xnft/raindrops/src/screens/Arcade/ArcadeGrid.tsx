import { View } from "react-xnft";
import LoadingIndicator from "../../components/LoadingIndicator";
import useFetchArcadeGames from "../../hooks/useFetchArcadeGames";
import { ArcadeGame } from "../../mock-data/arcade";
import ArcadeGridItem from "./ArcadeGridItem";

export function ArcadeGrid() {
  const { loading, arcadeGames } = useFetchArcadeGames();

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
      }}
    >
      {arcadeGames.map((arcadeGame: ArcadeGame, index) => (
        <View
          key={arcadeGame.id.toString()}
          style={{
            height: "240px",
            width: "200px",
          }}
        >
          <ArcadeGridItem game={arcadeGame} />
        </View>
      ))}
    </View>
  );
}
