"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Player from "@/components/ui/player";
import { Skeleton } from "@/components/ui/skeleton";
import { useSocket } from "@/context/socket";
import { useMediaPermissions } from "@/hooks/permissions/useMediaPermissions";
import useMediaStream from "@/hooks/useMediaStream";
import usePeer from "@/hooks/usePeer";
import usePlayer, { PlayerProps } from "@/hooks/usePlayer";
import { SOCKET_EVENTS } from "@/lib/constants";
import { cn, handlePermissionError, sleep } from "@/lib/utils";
import { PlayerUrl } from "@/types/player";
import { LogOut, StepForward } from "lucide-react";
import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";

type Chat = {
  content: string;
  senderPeerId: string;
};

const LargePlayer = ({
  playerId,
  active = false,
  muted,
  url,
}: {
  playerId: string;
  active?: boolean;
  url: PlayerUrl;
  muted: boolean;
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border-primaryBtn border-[5px]">
      <Player playerKey={playerId} url={url} muted={muted} active={active} />
    </div>
  );
};

const MobilePlayer = ({
  playerId,
  me = false,
  muted,
  url,
}: {
  playerId: string;
  me?: boolean;
  url: PlayerUrl;
  muted: boolean;
}) => {
  return me ? (
    <div className="overflow-hidden absolute border-[2.5px] border-primaryBtn w-[20%] top-0 right-0 rounded-xl z-[2]">
      <Player playerKey={playerId} url={url} muted={muted} active={me} />
    </div>
  ) : (
    <div className="w-[80%] mx-auto overflow-hidden top-10 z-[1] border-[3px] border-primaryBtn border-black rounded-2xl">
      <Player playerKey={playerId} url={url} muted={muted} />
    </div>
  );
};

const Home = () => {
  const [startMediaStream, setStartMediaStream] = useState(false);
  const {
    mediaPermission,
    checkPermissions: requestMediaPermissions,
    isLoading: isMediaPermissionLoading,
  } = useMediaPermissions();
  const [mediaPermissionDenied, setMediaPermissionDenied] = useState(false);

  const { myPeerId, peer } = usePeer();
  const socket = useSocket();
  const { mediaStream, stopTracks } = useMediaStream({
    start: startMediaStream,
  });
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
    socket.on(SOCKET_EVENTS.MATCH_FOUND, async (roomId: string | null) => {
      if (!roomId || !myPeerId) return;
      console.log("Match found", roomId, myPeerId);
      setRoomId(roomId);
      await sleep(2000);
      socket.emit(SOCKET_EVENTS.JOIN_ROOM, myPeerId, roomId);
    });
    return () => {
      socket.off(SOCKET_EVENTS.MATCH_FOUND);
    };
  }, [socket, myPeerId]);

  useEffect(() => {
    if (!socket || !peer || !mediaStream) return;

    const handleUserConnected = async (peerId: string) => {
      await sleep(2000);
      setWaitingForMatch(false);
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
      console.log("Call received", call.peer);
      setWaitingForMatch(false);
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
    return () => {
      socket.off(SOCKET_EVENTS.MESSAGE_SENT);
    };
  }, [socket, myPeerId]);

  useEffect(() => {
    if (!socket) return;
    socket.on(
      SOCKET_EVENTS.USER_LEAVE_ROOM,
      (socketId: string, peerId?: string) => {
        console.log("User left", socketId, player?.other?.id, peerId);
        if (player?.other?.id === peerId) {
          setPlayer((prev) => {
            return {
              ...prev,
              other: null,
            };
          });
          socket.emit(SOCKET_EVENTS.NEXT_MATCH);
        }
      }
    );
    return () => {
      socket.off(SOCKET_EVENTS.USER_LEAVE_ROOM);
    };
  }, [socket, setPlayer, player]);

  const handleChat = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!socket || !myPeerId || !roomId || !chatInput) return;
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

  const handleNextMatch = () => {
    if (!socket || !myPeerId || !roomId) return;
    socket.emit(SOCKET_EVENTS.USER_LEAVE_ROOM, roomId, myPeerId);
    socket.emit(SOCKET_EVENTS.NEXT_MATCH);
  };

  const handleLeaveRoom = async () => {
    if (socket && mediaStream && !roomId) {
      window.location.reload();
      return;
    }
    if (!socket || !roomId || !mediaStream) return;
    socket.emit(SOCKET_EVENTS.USER_LEAVE_ROOM, roomId, myPeerId);
    stopTracks(mediaStream);
    setShowInitScreen(true);
    window.location.reload();
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chats]);

  const handlePlayerView = () => {
    if (isMobileView) {
      return (
        <div className="relative flex gap-4 flex-col w-full items-center justify-center py-4">
          {player?.me ? (
            <>
              <MobilePlayer
                playerId={player?.me.id}
                url={player?.me.url}
                muted={player?.me.muted}
                me={true}
              />
            </>
          ) : null}
          {waitingForMatch ? (
            <Skeleton className="overflow-hidden border-[3px] rounded-lg w-[100%] h-[40vh] bg-gray-400 border-primaryBtn" />
          ) : player?.other ? (
            <>
              <MobilePlayer
                playerId={player?.other.id}
                url={player?.other.url}
                muted={player?.other.muted}
                me={false}
              />
            </>
          ) : null}
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center gap-4 w-7/12">
        {waitingForMatch ? (
          <Skeleton className="overflow-hidden border-[5px] border-primaryBtn rounded-lg w-[100%] h-[45%] bg-gray-400" />
        ) : player?.other ? (
          <LargePlayer
            muted={player.other.muted}
            playerId={player.other.id}
            url={player.other.url}
          />
        ) : null}

        {player?.me ? (
          <>
            <LargePlayer
              active
              muted={player.me.muted}
              playerId={player.me.id}
              url={player.me.url}
            />
          </>
        ) : null}
      </div>
    );
  };

  const handleScreen = () => {
    if (showInitScreen) {
      return (
        <div className="flex flex-1 h-full flex-col md:flex-row">
          <div className="bg-introLeft flex items-center justify-center flex-[0.75] md:flex-[0.6] h-full flex-col">
            <h2 className="text-white text-center font-bold font-poppins text-6xl md:text-5xl lg:text-6xl">
              Talk to Strangers!
            </h2>
            <Image
              alt="world-svg"
              src={require("@/assets/svg/connected_world.svg")}
              className="w-2/3 pt-10"
            />
          </div>
          <div className="bg-introRight flex-[0.25] md:flex-[0.4] flex items-center justify-center flex-col gap-16">
            <Image
              alt="realtime-svg"
              src={require("@/assets/svg/realtime_collaboration.svg")}
              className="w-9/12 p-2 hidden md:block"
            />
            <Button
              className="w-2/5 rounded-full bg-primaryBtn py-6"
              onClick={() => {
                if (!socket) return;
                setStartMediaStream(true);
                setWaitingForMatch(true);
                setShowInitScreen(false);
                console.log("Finding match", socket.id);
                socket.emit(SOCKET_EVENTS.FIND_MATCH);
              }}
            >
              Start Video
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div
        className={"flex w-full h-full p-4 bg-primary "}
        style={{
          flexDirection: isMobileView ? "column" : "row",
          gap: isMobileView ? "0" : "0.5rem",
        }}
      >
        {handlePlayerView()}
        <div className="flex h-full w-full items-center justify-between flex-col overflow-hidden gap-2 relative">
          <div className="flex flex-col h-full w-full rounded-lg shadow-xl border-primaryBtn border-2">
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
            <div className="w-full flex flex-col items-center">
              <form
                className="flex items-center space-x-2 p-2 w-full"
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
                <Button className="bg-primaryBtn" size="sm">
                  Send
                </Button>
              </form>
            </div>
          </div>
          <div className="md:clear-right">
            <StepForward
              onClick={handleNextMatch}
              className="absolute bottom-[4.5rem] md:bottom-0 right-[1rem] md:relative rounded-full bg-primaryBtn text-white p-2 block md:hidden"
              size={35}
            />
            <div className="w-full flex flex-row gap-7">
              <Button
                variant="destructive"
                className="rounded-2xl md:rounded-lg hidden md:flex flex-row items-center justify-center gap-1"
                onClick={handleLeaveRoom}
              >
                <LogOut size={20} />
                <p>Leave</p>
              </Button>
              <Button
                className="rounded-2xl md:rounded-lg hidden md:flex flex-row items-center justify-center bg-primaryBtn gap-1"
                onClick={handleNextMatch}
              >
                <p>Next Match</p>
                <StepForward size={20} />
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

  if (isMediaPermissionLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center p-4 overflow-hidden bg-introLeft">
        <div className="flex flex-col items-center gap-10">
          <Image
            alt="world-svg"
            src={require("@/assets/svg/realtime_collaboration.svg")}
            className="w-[60%] p-2 animate-spin"
          />
          <p className="text-3xl md:text-4xl font-semibold text-white font-poppins">
            Loading please wait...
          </p>
        </div>
      </div>
    );
  }

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

  if (!mediaPermission.camera || !mediaPermission.microphone) {
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
    <div className="w-screen h-svh flex items-center justify-center overflow-hidden">
      {handleScreen()}
    </div>
  );
};

export default Home;
