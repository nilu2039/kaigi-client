"use client";

import { Peer, PeerOptions } from "peerjs";
import { useEffect, useRef, useState } from "react";

const usePeer = () => {
  const isPeerSet = useRef(false);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [myPeerId, setMyPeerId] = useState<string | null>(null);
  useEffect(() => {
    if (isPeerSet.current) return;
    isPeerSet.current = true;
    const peerOptions = {
      host: process.env.NEXT_PUBLIC_PEER_HOST!,
      path: "/peer",
      secure: process.env.NEXT_PUBLIC_NODE_ENV === "production",
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          {
            urls: process.env.NEXT_PUBLIC_TURN_URL!,
            username: process.env.NEXT_PUBLIC_TURN_USERNAME!,
            credential: process.env.NEXT_PUBLIC_TURN_CREDENTIALS!,
          },
        ],
      },
    } as PeerOptions;
    (async () => {
      try {
        let myPeer = null;
        if (process.env.NEXT_PUBLIC_NODE_ENV === "production") {
          myPeer = new Peer(peerOptions);
        } else {
          myPeer = new Peer({ ...peerOptions, port: 9000 });
        }
        setPeer(myPeer);
        myPeer.on("open", (id) => {
          setMyPeerId(id);
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
    myPeerId,
  };
};

export default usePeer;
