import { useEffect, useRef, useState } from "react";

const useMediaStream = () => {
  const isMediaStreamSet = useRef(false);
  const [mediaStream, setMediaSteam] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isMediaStreamSet.current) return;
    isMediaStreamSet.current = true;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setMediaSteam(stream);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [mediaStream]);

  //   useEffect(() => {
  //     return () => {
  //       console.log("Stopping media stream 2");
  //       if (mediaStream) {
  //         mediaStream.getTracks().forEach((track) => {
  //           track.stop();
  //         });
  //       }
  //     };
  //   });

  return { mediaStream };
};

export default useMediaStream;
