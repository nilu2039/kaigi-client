import { PlayerUrl } from "@/types/player";
import React from "react";
import Player from "./player";
import { cn } from "@/lib/utils";

type Props = {
  playerId: string;
  active?: boolean;
  url: PlayerUrl;
  muted: boolean;
} & React.HTMLProps<HTMLDivElement>;

const LargeScreenPlayer = ({
  playerId,
  active = false,
  muted,
  url,
  className,
  ...props
}: Props) => {
  return (
    <div {...props} className={cn("overflow-hidden rounded-2xl", className)}>
      <Player
        playerKey={playerId}
        url={url}
        muted={muted}
        active={active}
        mirror
      />
    </div>
  );
};

export default LargeScreenPlayer;
