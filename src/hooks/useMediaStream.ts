import { useEffect, useRef, useState } from "react";

const useMediaStream = ({ start }: { start: boolean }) => {
  const isMediaStreamSet = useRef(false);
  const [mediaStream, setMediaSteam] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isMediaStreamSet.current || !start) return;
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
  }, [mediaStream, start]);

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
