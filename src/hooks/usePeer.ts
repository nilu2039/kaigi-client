"use client";

import { useSocket } from "@/context/socket";
import { Peer } from "peerjs";
import { useEffect, useRef, useState } from "react";

type PeerState = {
  roomId: string;
};

const usePeer = ({ roomId }: PeerState) => {
  const isPeerSet = useRef(false);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [myId, setMyId] = useState<string | null>(null);
  const socket = useSocket();

  useEffect(() => {
    if (isPeerSet.current || !socket) return;
    isPeerSet.current = true;
    (async () => {
      try {
        const myPeer = new Peer({
          host: "localhost",
          path: "/peer",
          port: 9000,
        });
        setPeer(myPeer);
        myPeer.on("open", (id) => {
          setMyId(id);
          socket.emit("join-room", id, roomId);
        });
      } catch (error) {
        console.error(error);
      }
    })();
    return () => {
      peer?.destroy();
    };
  }, [socket, roomId, peer]);
  return {
    peer,
    myId,
  };
};

export default usePeer;
