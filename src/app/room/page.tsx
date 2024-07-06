"use client";

import Player from "@/components/ui/player";
import { useSocket } from "@/context/socket";
import useMediaStream from "@/hooks/useMediaStream";
import usePeer from "@/hooks/usePeer";
import usePlayer from "@/hooks/usePlayer";
import { SOCKET_EVENTS } from "@/lib/constants";
import { sleep } from "@/lib/utils";
import React, { useEffect, useState } from "react";

const Page = () => {
  const { myId, peer } = usePeer();
  const socket = useSocket();
  const { mediaStream } = useMediaStream();
  const { player, setPlayer } = usePlayer();
  const [waitingForMatch, setWaitingForMatch] = useState(false);
  const [showInitScreen, setShowInitScreen] = useState(true);

  useEffect(() => {
    if (!socket) return;
    socket.on(SOCKET_EVENTS.MATCH_FOUND, (roomId: string | null) => {
      if (!roomId || !myId) return;
      console.log("Match found", roomId, myId);
      setWaitingForMatch(false);
      socket.emit(SOCKET_EVENTS.JOIN_ROOM, myId, roomId);
    });
    return () => {
      socket.off(SOCKET_EVENTS.MATCH_FOUND);
    };
  }, [socket, myId]);

  useEffect(() => {
    if (!socket || !peer || !mediaStream) return;

    const handleUserConnected = async (userId: string) => {
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

    socket.on(SOCKET_EVENTS.USER_CONNECTED, handleUserConnected);

    return () => {
      socket.off(SOCKET_EVENTS.USER_CONNECTED, handleUserConnected);
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

  const handleScreen = () => {
    if (showInitScreen) {
      return (
        <button
          onClick={() => {
            if (!socket) return;
            setWaitingForMatch(true);
            setShowInitScreen(false);
            console.log("Finding match", socket.id);
            socket.emit(SOCKET_EVENTS.FIND_MATCH);
          }}
        >
          connect
        </button>
      );
    }
    if (waitingForMatch) {
      return <h1>waiting for a match...</h1>;
    }
    return (
      <>
        <div className="flex flex-[0.4] flex-col bg-red-500">
          {player &&
            Object.keys(player).map((key) => {
              const { url, muted } = player[key];
              return <Player key={key} url={url} muted={muted} />;
            })}
        </div>
        <div className="flex flex-[0.6] bg-red-200 h-full items-center justify-center">
          <h1>chat</h1>
        </div>
      </>
    );
  };

  return (
    <div className="w-screen h-screen flex flex-row items-center justify-center">
      {handleScreen()}
    </div>
  );
};

export default Page;
