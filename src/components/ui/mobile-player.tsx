import { PlayerUrl } from "@/types/player";
import React from "react";
import Player from "./player";
import { cn } from "@/lib/utils";

type Props = {
  playerId: string;
  me?: boolean;
  url: PlayerUrl;
  muted: boolean;
} & React.HTMLProps<HTMLDivElement>;

const MobileScreenPlayer = ({
  playerId,
  me = false,
  muted,
  url,
  className,
  ...props
}: Props) => {
  return me ? (
    <div
      {...props}
      className={cn(
        "overflow-hidden absolute w-[25%] top-0 right-0 rounded-xl z-[2]",
        className
      )}
    >
      <Player playerKey={playerId} url={url} muted={muted} active={me} mirror />
    </div>
  ) : (
    <div
      className={cn("w-[70%] mx-auto overflow-hidden rounded-2xl", className)}
    >
      <Player playerKey={playerId} url={url} muted={muted} mirror />
    </div>
  );
};

export default MobileScreenPlayer;
