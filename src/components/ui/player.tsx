import React from "react";
import { SourceProps } from "react-player/base";
import ReactPlayer from "react-player";

type PlayerProps = {
  url: string | MediaStream | string[] | SourceProps[] | undefined;
  muted?: boolean;
  active?: boolean;
};

const Player = ({ url, muted = false, active = false }: PlayerProps) => {
  return (
    <ReactPlayer
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
