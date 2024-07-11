import { PlayerProps, PlayerUrl } from "@/types/player";
import { useState } from "react";

const usePlayer = () => {
  const [player, setPlayer] = useState<PlayerProps | null>(null);

  return {
    player,
    setPlayer,
  };
};

export default usePlayer;
