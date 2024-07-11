import { PlayerUrl } from "@/types/player";
import React from "react";
import Player from "./player";

const LargeScreenPlayer = ({
  playerId,
  active = false,
  muted,
  url,
}: {
  playerId: string;
  active?: boolean;
  url: PlayerUrl;
  muted: boolean;
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border-newAccent border-[5px]">
      <Player playerKey={playerId} url={url} muted={muted} active={active} />
    </div>
  );
};

export default LargeScreenPlayer;
