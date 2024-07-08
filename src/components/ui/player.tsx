import { PlayerUrl } from "@/types/player";
import { Key } from "react";
import ReactPlayer from "react-player";

type PlayerProps = {
  url: PlayerUrl;
  muted?: boolean;
  active?: boolean;
  playerKey?: Key;
};

const Player = ({ url, muted = false, playerKey }: PlayerProps) => {
  return (
    <ReactPlayer
      key={playerKey}
      url={url}
      muted={muted}
      width={"100%"}
      height={"100%"}
      playing={true}
      style={
        {
          // aspectRatio: "9/16",
        }
      }
    />
  );
};

export default Player;
