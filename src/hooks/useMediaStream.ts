import { useEffect, useRef, useState } from "react";

const useMediaStream = ({ start }: { start: boolean }) => {
  const isMediaStreamSet = useRef(false);
  const [mediaStream, setMediaSteam] = useState<MediaStream | null>(null);

  const stopTracks = (stream: MediaStream) => {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  };

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

  return { mediaStream, stopTracks };
};

export default useMediaStream;
