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
    // const peerOptions = {
    //   host: process.env.NEXT_PUBLIC_PEER_HOST!,
    //   path: "/peer",
    //   secure: process.env.NEXT_PUBLIC_NODE_ENV === "production",
    // } as PeerOptions;
    (async () => {
      try {
        // let myPeer = null;
        // if (process.env.NEXT_PUBLIC_NODE_ENV === "production") {
        //   myPeer = new Peer(peerOptions);
        // } else {
        //   myPeer = new Peer({ ...peerOptions, port: 9000 });
        // }
        const myPeer = new Peer({
          config: {
            iceServers: [
              {
                urls: "stun:stun.relay.metered.ca:80",
              },
              {
                urls: "turn:global.relay.metered.ca:80",
                username: "e388bea6b59cd76c012dffb2",
                credential: "65VXfD0ATAnv07QY",
              },
              {
                urls: "turn:global.relay.metered.ca:80?transport=tcp",
                username: "e388bea6b59cd76c012dffb2",
                credential: "65VXfD0ATAnv07QY",
              },
              {
                urls: "turn:global.relay.metered.ca:443",
                username: "e388bea6b59cd76c012dffb2",
                credential: "65VXfD0ATAnv07QY",
              },
              {
                urls: "turns:global.relay.metered.ca:443?transport=tcp",
                username: "e388bea6b59cd76c012dffb2",
                credential: "65VXfD0ATAnv07QY",
              },
            ],
          },
        });
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
