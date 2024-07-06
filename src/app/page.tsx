"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Player from "@/components/ui/player";
import { useSocket } from "@/context/socket";
import useMediaStream from "@/hooks/useMediaStream";
import usePeer from "@/hooks/usePeer";
import usePlayer from "@/hooks/usePlayer";
import { SOCKET_EVENTS } from "@/lib/constants";
import { cn, sleep } from "@/lib/utils";
import { FormEvent, useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";

type Chat = {
  content: string;
  senderPeerId: string;
};

const Home = () => {
  const { myId, peer } = usePeer();
  const socket = useSocket();
  const { mediaStream } = useMediaStream();
  const { player, setPlayer, myPlayer, otherPlayer } = usePlayer({
    activeId: myId,
  });
  const [waitingForMatch, setWaitingForMatch] = useState(false);
  const [showInitScreen, setShowInitScreen] = useState(true);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatInput, setChatInput] = useState<string>("");

  const isMobileView = useMediaQuery({ query: "(max-width: 750px)" });

  useEffect(() => {
    if (!socket) return;
    socket.on(SOCKET_EVENTS.MATCH_FOUND, (roomId: string | null) => {
      if (!roomId || !myId) return;
      console.log("Match found", roomId, myId);
      setRoomId(roomId);
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

  useEffect(() => {
    if (!socket || !myId) return;
    socket.on(SOCKET_EVENTS.MESSAGE_SENT, (peerId: string, message: string) => {
      console.log("Message received", peerId, message);
      setChats((prev) => {
        return [
          ...prev,
          {
            content: message,
            senderPeerId: peerId,
          },
        ];
      });
    });
    return () => {
      socket.off(SOCKET_EVENTS.MESSAGE_SENT);
    };
  }, [socket, myId]);

  const handleChat = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!socket || !myId || !roomId) return;
    socket.emit(SOCKET_EVENTS.MESSAGE_SENT, roomId, myId, chatInput);
    setChats((prev) => {
      return [
        ...prev,
        {
          content: chatInput,
          senderPeerId: myId,
        },
      ];
    });
    setChatInput("");
  };

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
        <div className="flex h-full w-full items-center justify-center rounded-lg flex-col shadow-xl border">
          <div className="flex flex-col h-full w-full overflow-auto gap-4 p-4 border-none">
            {chats.map((chat, index) => {
              return (
                <div key={index} className="flex">
                  <p
                    className={cn(
                      "text-lg font-normal flex-wrap inline-block bg-slate-200 px-4 py-1 rounded-xl",
                      {
                        "ml-auto": chat.senderPeerId !== myId,
                        "bg-green-200": chat.senderPeerId !== myId,
                      }
                    )}
                    style={{}}
                  >
                    {chat.content}
                  </p>
                </div>
              );
            })}
          </div>
          <form
            className="sticky p-2 w-full flex flex-row gap-4"
            onSubmit={handleChat}
          >
            <Input
              placeholder="say hi..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <Button>Send</Button>
          </form>
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
