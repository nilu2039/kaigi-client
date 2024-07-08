import { PlayerUrl } from "@/types/player";
import { useState } from "react";

type PlayerBody = {
  id: string;
  url: PlayerUrl;
  muted: boolean;
};

export type PlayerProps = {
  me?: PlayerBody | null;
  other?: PlayerBody | null;
};

const usePlayer = () => {
  const [player, setPlayer] = useState<PlayerProps | null>(null);

  return {
    player,
    setPlayer,
  };
};

export default usePlayer;
