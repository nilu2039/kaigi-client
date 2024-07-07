"use client";

import { PEER_HOST } from "@/lib/constants";
import { Peer } from "peerjs";
import { useEffect, useRef, useState } from "react";

const usePeer = () => {
  const isPeerSet = useRef(false);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    if (isPeerSet.current) return;
    isPeerSet.current = true;
    (async () => {
      try {
        const myPeer = new Peer({
          host: PEER_HOST,
          path: "/peer",
          port: 9000,
        });
        setPeer(myPeer);
        myPeer.on("open", (id) => {
          setMyId(id);
        });
      } catch (error) {
        console.error(error);
      }
    })();
    return () => {
      peer?.destroy();
    };
  }, [peer]);
  return {
    peer,
    myId,
  };
};

export default usePeer;
