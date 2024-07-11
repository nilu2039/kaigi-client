"use client";
import { usePlayer } from "@/context/player";
import { useMediaPermissions } from "@/hooks/permissions/useMediaPermissions";
import useMediaStream from "@/hooks/useMediaStream";
import usePeer from "@/hooks/usePeer";
import useVideoPeerAndSocketEvents from "@/hooks/useVideoPeerAndSocketEvents";
import { handlePermissionError } from "@/lib/utils";
import { useEffect, useState } from "react";
import LoadingScreen from "./(home)/loading-screen";
import MainScreen from "./(home)/main-screen";
import PermissionDenied from "./(home)/permission-denied";
import RequestPermission from "./(home)/request-permission";

const Home = () => {
  const [startMediaStream, setStartMediaStream] = useState(false);
  const {
    mediaPermission,
    checkPermissions: requestMediaPermissions,
    isLoading: isMediaPermissionLoading,
  } = useMediaPermissions();
  const [mediaPermissionDenied, setMediaPermissionDenied] = useState(false);

  const { myPeerId, peer } = usePeer();
  const { mediaStream, stopTracks } = useMediaStream({
    start: startMediaStream,
  });

  const toggleMediaStream = (data: boolean) => {
    if (!data) return;
    setStartMediaStream(data);
  };

  const { setPlayer } = usePlayer();

  useVideoPeerAndSocketEvents({ myPeerId, mediaStream, peer });

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

  const handlePermission = async () => {
    const res = await requestMediaPermissions();
    if (res) {
      if (handlePermissionError(res) === "permission_denied_by_user") {
        setMediaPermissionDenied(true);
      }
    }
  };

  if (isMediaPermissionLoading) {
    return <LoadingScreen />;
  }

  if (mediaPermissionDenied) {
    return <PermissionDenied />;
  }

  if (!mediaPermission.camera || !mediaPermission.microphone) {
    return <RequestPermission handlePermission={handlePermission} />;
  }

  return (
    <>
      <MainScreen
        mediaStream={mediaStream}
        myPeerId={myPeerId}
        stopTracks={stopTracks}
        toggleMediaStream={toggleMediaStream}
      />
    </>
  );
};

export default Home;
