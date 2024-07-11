import { PlayerUrl } from "@/types/player";
import React from "react";
import Player from "./player";

const MobileScreenPlayer = ({
  playerId,
  me = false,
  muted,
  url,
}: {
  playerId: string;
  me?: boolean;
  url: PlayerUrl;
  muted: boolean;
}) => {
  return me ? (
    <div className="overflow-hidden absolute border-[2.5px] border-newAccent w-[20%] top-0 right-0 rounded-xl z-[2]">
      <Player playerKey={playerId} url={url} muted={muted} active={me} />
    </div>
  ) : (
    <div className="w-[80%] mx-auto overflow-hidden top-10 z-[1] border-[3px] border-newAccent border-black rounded-2xl">
      <Player playerKey={playerId} url={url} muted={muted} />
    </div>
  );
};

export default MobileScreenPlayer;
