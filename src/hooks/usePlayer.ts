import { useState } from "react";
import { SourceProps } from "react-player/base";

type Player = {
  me?: {
    id: string;
    url: string | MediaStream | string[] | SourceProps[] | undefined;
    muted: boolean;
  } | null;
  other?: {
    id: string;
    url: string | MediaStream | string[] | SourceProps[] | undefined;
    muted: boolean;
  } | null;
};

const usePlayer = ({ myId }: { myId?: string | null }) => {
  const [player, setPlayer] = useState<Player | null>(null);

  return {
    player,
    setPlayer,
  };
};

export default usePlayer;
