import { PlayerUrl } from "@/types/player";
import { Key } from "react";
import ReactPlayer from "react-player";

type PlayerProps = {
  url: PlayerUrl;
  muted?: boolean;
  active?: boolean;
  playerKey?: Key;
  mirror?: boolean;
};

const Player = ({
  url,
  muted = false,
  playerKey,
  mirror = false,
}: PlayerProps) => {
  return (
    <ReactPlayer
      key={playerKey}
      url={url}
      muted={muted}
      width={"100%"}
      height={"100%"}
      playing={true}
      playsinline
      controls={false}
      style={{
        transform: mirror ? "scaleX(-1)" : "scaleX(1)",
        backgroundColor: "#191919",
      }}
    />
  );
};

export default Player;
