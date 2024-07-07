import { useState } from "react";
import { SourceProps } from "react-player/base";

type Url = string | MediaStream | string[] | SourceProps[] | undefined;
type PlayerBody = {
  id: string;
  url: Url;
  muted: boolean;
};

type Player = {
  me?: PlayerBody | null;
  other?: PlayerBody | null;
};

const usePlayer = () => {
  const [player, setPlayer] = useState<Player | null>(null);

  return {
    player,
    setPlayer,
  };
};

export default usePlayer;
