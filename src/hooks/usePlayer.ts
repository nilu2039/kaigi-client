import { useState } from "react";
import { SourceProps } from "react-player/base";

type Player = {
  [key: string]: {
    url: string | MediaStream | string[] | SourceProps[] | undefined;
    muted: boolean;
  };
};

const usePlayer = () => {
  const [player, setPlayer] = useState<Player | null>(null);
  return {
    player,
    setPlayer,
  };
};

export default usePlayer;
