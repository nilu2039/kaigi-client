import { cloneDeep } from "lodash";
import { useEffect, useState } from "react";
import { SourceProps } from "react-player/base";

type Player = {
  [key: string]: {
    url: string | MediaStream | string[] | SourceProps[] | undefined;
    muted: boolean;
  };
};

const usePlayer = ({ activeId }: { activeId?: string | null }) => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [myPlayer, setMyPlayer] = useState<Player[string] | null>(null);
  const [otherPlayer, setOtherPlayer] = useState<Player | null>(null);

  useEffect(() => {
    if (!activeId || !player) return;
    const playerCopy = cloneDeep(player);
    const activePlayer = playerCopy?.[activeId];
    delete playerCopy?.[activeId];
    const nonActivePlayers = playerCopy;
    setMyPlayer(activePlayer);
    setOtherPlayer(nonActivePlayers);
  }, [activeId, player]);

  return {
    player,
    myPlayer: myPlayer,
    otherPlayer: otherPlayer,
    setPlayer,
  };
};

export default usePlayer;
