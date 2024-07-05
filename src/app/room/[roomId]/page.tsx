"use client";

import Player from "@/components/ui/player";
import { useSocket } from "@/context/socket";
import useMediaStream from "@/hooks/useMediaStream";
import usePeer from "@/hooks/usePeer";
import usePlayer from "@/hooks/usePlayer";
import { sleep } from "@/lib/utils";
import React, { useEffect } from "react";

const Page = ({ params }: { params: { roomId: string } }) => {
  const { myId, peer } = usePeer({ roomId: params.roomId });
  const { mediaStream } = useMediaStream();
  const { player, setPlayer } = usePlayer();
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !peer || !mediaStream) return;

    const handleUserConnected = async (userId: string) => {
      console.log("User connected", userId);
      await sleep(1000);
      const call = peer.call(userId, mediaStream);
      call.on("stream", (incomingStream) => {
        setPlayer((prev) => {
          return {
            ...prev,
            [userId]: {
              url: incomingStream,
              muted: false,
            },
          };
        });
      });
    };

    socket.on("user-connected", handleUserConnected);

    return () => {
      socket.off("user-connected", handleUserConnected);
    };
  }, [socket, peer, mediaStream, setPlayer]);

  useEffect(() => {
    if (!myId || !mediaStream) return;
    setPlayer((prev) => {
      return {
        ...prev,
        [myId]: {
          url: mediaStream,
          muted: true,
        },
      };
    });
  }, [mediaStream, myId, setPlayer]);

  useEffect(() => {
    if (!peer || !mediaStream) return;
    peer.on("call", (call) => {
      call.answer(mediaStream);
      call.on("stream", (incomingStream) => {
        setPlayer((prev) => {
          return {
            ...prev,
            [call.peer]: {
              url: incomingStream,
              muted: false,
            },
          };
        });
      });
    });
  }, [peer, setPlayer, socket, mediaStream]);

  return (
    <div className="w-screen h-screen bg-red-300">
      {player &&
        Object.keys(player).map((key) => {
          const { url, muted } = player[key];
          return <Player key={key} url={url} muted={muted} />;
        })}
    </div>
  );
};

export default Page;
