"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Player from "@/components/ui/player";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useSocket } from "@/context/socket";
import { useMediaPermissions } from "@/hooks/permissions/useMediaPermissions";
import useMediaStream from "@/hooks/useMediaStream";
import usePeer from "@/hooks/usePeer";
import usePlayer from "@/hooks/usePlayer";
import { SOCKET_EVENTS } from "@/lib/constants";
import { cn, handlePermissionError, sleep } from "@/lib/utils";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";

type Chat = {
  content: string;
  senderPeerId: string;
};

const Home = () => {
  const [startMediaStream, setStartMediaStream] = useState(false);
  const [mediaPermissions, requestMediaPermissions] = useMediaPermissions();
  const [mediaPermissionDenied, setMediaPermissionDenied] = useState(false);

  const { myPeerId, peer } = usePeer();
  const socket = useSocket();
  const { mediaStream } = useMediaStream({ start: startMediaStream });
  const { player, setPlayer } = usePlayer();
  const [waitingForMatch, setWaitingForMatch] = useState(false);
  const [showInitScreen, setShowInitScreen] = useState(true);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  const isMobileView = useMediaQuery({ query: "(max-width: 750px)" });

  useEffect(() => {
    if (!socket) return;
    socket.on(SOCKET_EVENTS.MATCH_FOUND, (roomId: string | null) => {
      if (!roomId || !myPeerId) return;
      console.log("Match found", roomId, myPeerId);
      setRoomId(roomId);
      setWaitingForMatch(false);
      socket.emit(SOCKET_EVENTS.JOIN_ROOM, myPeerId, roomId);
    });
    return () => {
      socket.off(SOCKET_EVENTS.MATCH_FOUND);
    };
  }, [socket, myPeerId]);

  useEffect(() => {
    if (!socket || !peer || !mediaStream) return;

    const handleUserConnected = async (peerId: string) => {
      await sleep(1000);
      const call = peer.call(peerId, mediaStream);
      call.on("stream", (incomingStream) => {
        setPlayer((prev) => {
          return {
            ...prev,
            other: {
              id: peerId,
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
    if (!myPeerId || !mediaStream) return;
    setPlayer((prev) => {
      return {
        ...prev,
        me: {
          id: myPeerId,
          url: mediaStream,
          muted: true,
        },
      };
    });
  }, [mediaStream, myPeerId, setPlayer]);

  useEffect(() => {
    if (!peer || !mediaStream) return;
    peer.on("call", (call) => {
      call.answer(mediaStream);
      call.on("stream", (incomingStream) => {
        setPlayer((prev) => {
          return {
            ...prev,
            other: {
              id: call.peer,
              url: incomingStream,
              muted: false,
            },
          };
        });
      });
    });
  }, [peer, setPlayer, socket, mediaStream]);

  console.log("Player", player);

  useEffect(() => {
    if (!socket || !myPeerId) return;
    socket.on(SOCKET_EVENTS.MESSAGE_SENT, (peerId: string, message: string) => {
      console.log("Message received", peerId, message);
      setChats((prev) => {
        return [
          ...prev,
          {
            content: message.trim(),
            senderPeerId: peerId,
          },
        ];
      });
    });
    scrollAreaRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
    return () => {
      socket.off(SOCKET_EVENTS.MESSAGE_SENT);
    };
  }, [socket, myPeerId]);

  useEffect(() => {
    if (!socket) return;
    socket.on(SOCKET_EVENTS.USER_LEAVE_ROOM, (id: string) => {
      console.log("User left", id, player?.other?.id);
      if (player?.other?.id === id) {
        setPlayer((prev) => {
          return {
            ...prev,
            other: null,
          };
        });
      }
      socket.emit(SOCKET_EVENTS.NEXT_MATCH);
    });
    return () => {
      socket.off(SOCKET_EVENTS.USER_LEAVE_ROOM);
    };
  }, [socket, setPlayer, player]);

  const handleChat = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!socket || !myPeerId || !roomId || !chatInput) return;
    scrollAreaRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
    socket.emit(SOCKET_EVENTS.MESSAGE_SENT, roomId, myPeerId, chatInput);
    setChats((prev) => {
      return [
        ...prev,
        {
          content: chatInput.trim(),
          senderPeerId: myPeerId,
        },
      ];
    });
    setChatInput("");
  };

  const handlePlayerView = () => {
    if (isMobileView) {
      return (
        <div className="relative flex gap-4 flex-col w-full items-center justify-center py-4">
          {player?.me ? (
            <>
              <div className="overflow-hidden absolute border w-[20%] top-0 right-0 rounded-lg z-[2]">
                <Player
                  playerKey={player?.me.id}
                  url={player?.me.url}
                  muted={player?.me.muted}
                  active={true}
                />
              </div>
            </>
          ) : null}
          {waitingForMatch ? (
            <Skeleton className="overflow-hidden border rounded-lg w-[90%] h-[40vh] bg-gray-400" />
          ) : player?.other ? (
            <>
              <div className="w-[80%] mx-auto overflow-hidden top-10 z-[1] border rounded-lg">
                <Player
                  playerKey={player.other.id}
                  url={player?.other.url}
                  muted={player?.other.muted}
                />
              </div>
            </>
          ) : null}
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center gap-4 w-7/12">
        {waitingForMatch ? (
          <Skeleton className="overflow-hidden border rounded-lg w-[96%] h-[45%] bg-gray-400" />
        ) : player?.other ? (
          <div className="overflow-hidden border rounded-lg">
            <Player
              playerKey={player.other.id}
              url={player.other.url}
              muted={player.other.muted}
            />
          </div>
        ) : null}

        {player?.me ? (
          <>
            <div className="overflow-hidden border rounded-lg">
              <Player
                playerKey={player.me.id}
                url={player.me.url}
                muted={player.me.muted}
                active={true}
              />
            </div>
          </>
        ) : null}
      </div>
    );
  };

  const handleScreen = () => {
    if (showInitScreen) {
      return (
        <Button
          onClick={() => {
            if (!socket) return;
            setStartMediaStream(true);
            setWaitingForMatch(true);
            setShowInitScreen(false);
            console.log("Finding match", socket.id);
            socket.emit(SOCKET_EVENTS.FIND_MATCH);
          }}
        >
          Connect
        </Button>
      );
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
        <div className="flex h-full w-full items-center justify-between rounded-lg flex-col shadow-xl border overflow-hidden">
          <div className="flex flex-col h-full w-full">
            <main
              className="flex-1 overflow-y-auto p-4 space-y-4"
              ref={scrollAreaRef}
            >
              {chats.map((chat, index) => {
                return (
                  <div
                    className={cn("flex items-end space-x-2", {
                      "justify-end": chat.senderPeerId === myPeerId,
                    })}
                    key={String(index)}
                  >
                    <div
                      className={cn(
                        "p-2 rounded-lg bg-gray-100 dark:bg-gray-800",
                        {
                          "text-white bg-blue-500":
                            chat.senderPeerId === myPeerId,
                        }
                      )}
                    >
                      <p className="text-sm">{chat.content}</p>
                    </div>
                  </div>
                );
              })}
            </main>
            <div className="w-full flex flex-col items-center pb-2">
              <form
                className="flex items-center space-x-2 p-2 border-t w-full"
                onSubmit={handleChat}
              >
                <Input
                  className="flex-1"
                  placeholder="say hi..."
                  value={chatInput}
                  onChange={(e) => {
                    setChatInput(e.target.value);
                  }}
                  disabled={waitingForMatch}
                />
                <Button variant="outline" size="sm">
                  Send
                </Button>
              </form>
              <Button
                className="w-1/4"
                onClick={() => {
                  if (!socket || !myPeerId || !roomId) return;
                  socket.emit(SOCKET_EVENTS.USER_LEAVE_ROOM, roomId);
                  socket.emit(SOCKET_EVENTS.NEXT_MATCH);
                }}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handlePermission = async () => {
    const res = await requestMediaPermissions();
    console.log("RES", res);
    if (res) {
      if (handlePermissionError(res) === "permission_denied_by_user") {
        setMediaPermissionDenied(true);
      }
    }
  };

  if (mediaPermissionDenied) {
    return (
      <div className="w-screen h-screen flex items-center justify-center p-4 overflow-hidden flex-col gap-10">
        <p className="text-2xl font-semibold text-center">
          Permission to use camera and microphone was denied. To use this
          feature, you need to allow access in your browser settings.
        </p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (!mediaPermissions.camera || !mediaPermissions.microphone) {
    return (
      <div className="w-screen h-screen flex items-center justify-center p-4 overflow-hidden">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-2xl font-bold">Permissions required</h1>
          <Button onClick={handlePermission}>Allow permissions</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center p-4 overflow-hidden">
      {handleScreen()}
    </div>
  );
};

export default Home;
