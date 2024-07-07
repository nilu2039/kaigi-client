import React, { Key } from "react";
import { SourceProps } from "react-player/base";
import ReactPlayer from "react-player";

type Url = string | MediaStream | string[] | SourceProps[] | undefined;

type PlayerProps = {
  url: Url;
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
