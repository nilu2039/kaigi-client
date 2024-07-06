import React from "react";
import { SourceProps } from "react-player/base";
import ReactPlayer from "react-player";

type PlayerProps = {
  url: string | MediaStream | string[] | SourceProps[] | undefined;
  muted?: boolean;
};

const Player = ({ url, muted = false }: PlayerProps) => {
  return (
    <div className="w-full h-full">
      <ReactPlayer
        url={url}
        muted={muted}
        width={"100%"}
        height={"100%"}
        playing={true}
        style={{
          backgroundColor: "white",
        }}
      />
    </div>
  );
};

export default Player;
