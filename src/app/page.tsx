"use client";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Input } from "@/components/ui/input";
import Player from "@/components/ui/player";
import { useSocket } from "@/context/socket";
import useMediaStream from "@/hooks/useMediaStream";
import usePeer from "@/hooks/usePeer";
import usePlayer from "@/hooks/usePlayer";
import { SOCKET_EVENTS } from "@/lib/constants";
import { cn, sleep } from "@/lib/utils";
import { cva } from "class-variance-authority";
import React, { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";

const Home = () => {
  const { myId, peer } = usePeer();
  const socket = useSocket();
  const { mediaStream } = useMediaStream();
  const { player, setPlayer, myPlayer, otherPlayer } = usePlayer({
    activeId: myId,
  });
  const [waitingForMatch, setWaitingForMatch] = useState(false);
  const [showInitScreen, setShowInitScreen] = useState(true);

  const isMobileView = useMediaQuery({ query: "(max-width: 518px)" });
  const isTabView = useMediaQuery({ query: "(max-width: 519px)" });
  console.log("isMobile", isMobileView);

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

  const handlePlayerView = () => {
    if (isMobileView) {
      return (
        <div className="relative flex gap-4 flex-col w-full items-center justify-center py-4">
          {myPlayer ? (
            <>
              <div className="overflow-hidden absolute border w-[20%] top-0 right-0 rounded-lg z-[2]">
                <Player
                  url={myPlayer.url}
                  muted={myPlayer.muted}
                  active={true}
                />
              </div>
            </>
          ) : null}
          {otherPlayer ? (
            <>
              {Object.keys(otherPlayer).map((key) => {
                const { url, muted } = otherPlayer[key];
                return (
                  <div
                    key={key}
                    className="w-[80%] mx-auto overflow-hidden top-10 z-[1] border rounded-lg"
                  >
                    <Player url={url} muted={muted} />
                  </div>
                );
              })}
            </>
          ) : null}
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center gap-4 w-7/12">
        {player &&
          Object.keys(player).map((key) => {
            const { url, muted } = player[key];
            return (
              <div key={key} className="overflow-hidden border rounded-lg">
                <Player url={url} muted={muted} />
              </div>
            );
          })}
      </div>
    );
  };

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
      <div
        className={"flex w-full h-full"}
        style={{
          flexDirection: isMobileView ? "column" : "row",
          gap: isMobileView ? "0" : "0.5rem",
        }}
      >
        {handlePlayerView()}
        <div className="flex h-full w-full items-center justify-center border rounded-lg shadow-xl relative">
          <h1>chat</h1>
          <div className="absolute bottom-0 p-2 w-full">
            <Input placeholder="say hi..." />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center p-4">
      {handleScreen()}
    </div>
  );
};

export default Home;
