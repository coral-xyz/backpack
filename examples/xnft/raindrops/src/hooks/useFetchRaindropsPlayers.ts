import React, { useEffect } from "react";
import { Player, Players } from "../mock-data/players";

const fetchPlayers = async (callback: (players: Player[]) => void) => {
  callback(Players);
};

export default () => {
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  useEffect(() => {
    setLoading(true);
    fetchPlayers((players) => {
      setPlayers(players);
      setLoading(false);
    });
  });
  return { loading, players };
};
