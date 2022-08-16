import React, { useEffect } from "react";
import { ArcadeGame, ArcadeGames } from "../mock-data/arcade";

const fetchArcadeGames = async (
  callback: (arcadeGames: ArcadeGame[]) => void
) => {
  callback(ArcadeGames);
};

export default () => {
  const [arcadeGames, setArcadeGames] = React.useState<ArcadeGame[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  useEffect(() => {
    setLoading(true);
    fetchArcadeGames((arcadeGames) => {
      setArcadeGames(arcadeGames);
      setLoading(false);
    });
  });
  return { loading, arcadeGames };
};
