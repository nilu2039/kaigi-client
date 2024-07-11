import LargeScreenPlayer from "@/components/ui/large-screen-player";
import MobileScreenPlayer from "@/components/ui/mobile-player";
import { Skeleton } from "@/components/ui/skeleton";
import { PlayerProps } from "@/types/player";
import React, { FC } from "react";

type PlayerViewProps = {
  isMobileView: boolean;
  player: PlayerProps | null;
  waitingForMatch: boolean;
};

const PlayerView: FC<PlayerViewProps> = ({
  isMobileView,
  player,
  waitingForMatch,
}) => {
  const handlePlayerView = () => {
    if (isMobileView) {
      return (
        <div className="relative flex gap-4 flex-col w-full items-center justify-center py-4">
          {player?.me ? (
            <>
              <MobileScreenPlayer
                playerId={player?.me.id}
                url={player?.me.url}
                muted={player?.me.muted}
                me={true}
              />
            </>
          ) : null}
          {waitingForMatch ? (
            <Skeleton className="overflow-hidden border-[3px] rounded-lg w-[100%] h-[40vh] bg-gray-400 border-newAccent" />
          ) : player?.other ? (
            <>
              <MobileScreenPlayer
                playerId={player?.other.id}
                url={player?.other.url}
                muted={player?.other.muted}
                me={false}
              />
            </>
          ) : null}
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center gap-4 w-7/12">
        {waitingForMatch ? (
          <Skeleton className="overflow-hidden border-[5px] border-newAccent rounded-lg w-[100%] h-[45%] bg-gray-400" />
        ) : player?.other ? (
          <LargeScreenPlayer
            muted={player.other.muted}
            playerId={player.other.id}
            url={player.other.url}
          />
        ) : null}

        {player?.me ? (
          <>
            <LargeScreenPlayer
              active
              muted={player.me.muted}
              playerId={player.me.id}
              url={player.me.url}
            />
          </>
        ) : null}
      </div>
    );
  };
  return handlePlayerView();
};

export default PlayerView;
