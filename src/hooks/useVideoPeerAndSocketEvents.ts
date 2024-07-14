import { usePlayer } from "@/context/player";
import { useSocket } from "@/context/socket";
import { SOCKET_EVENTS } from "@/lib/constants";
import { sleep } from "@/lib/utils";
import Peer from "peerjs";
import { useEffect } from "react";

const useVideoPeerAndSocketEvents = ({
  myPeerId,
  mediaStream,
  peer,
}: {
  myPeerId: string | null;
  mediaStream: MediaStream | null;
  peer: Peer | null;
}) => {
  const { player, setPlayer, setChats, setRoomId, setWaitingForMatch } =
    usePlayer();

  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
    socket.on(SOCKET_EVENTS.MATCH_FOUND, async (roomId: string | null) => {
      if (!roomId || !myPeerId) return;
      setRoomId(roomId);
      await sleep(2000);
      socket.emit(SOCKET_EVENTS.JOIN_ROOM, myPeerId, roomId);
    });
    return () => {
      socket.off(SOCKET_EVENTS.MATCH_FOUND);
    };
  }, [socket, myPeerId, setRoomId]);

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
  }, [socket, peer, mediaStream, setPlayer, setWaitingForMatch]);

  useEffect(() => {
    if (!peer || !mediaStream) return;
    peer.on("call", (call) => {
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
  }, [peer, setPlayer, socket, mediaStream, setWaitingForMatch]);

  useEffect(() => {
    if (!socket || !myPeerId) return;
    socket.on(SOCKET_EVENTS.MESSAGE_SENT, (peerId: string, message: string) => {
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
  }, [socket, myPeerId, setChats]);

  useEffect(() => {
    if (!socket) return;
    socket.on(
      SOCKET_EVENTS.USER_LEAVE_ROOM,
      (socketId: string, peerId?: string) => {
        if (player?.other?.id === peerId) {
          setPlayer((prev) => {
            return {
              ...prev,
              other: null,
            };
          });
          socket.emit(SOCKET_EVENTS.NEXT_MATCH);
          setWaitingForMatch(true);
        }
      }
    );
    return () => {
      socket.off(SOCKET_EVENTS.USER_LEAVE_ROOM);
    };
  }, [socket, setPlayer, player, setWaitingForMatch]);
};

export default useVideoPeerAndSocketEvents;
