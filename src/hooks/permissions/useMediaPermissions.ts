import { handlePermissionError } from "@/lib/utils";
import { useState, useEffect } from "react";

type MediaPermissions = {
  camera: boolean;
  microphone: boolean;
};

export function useMediaPermissions(): [
  MediaPermissions,
  () => Promise<unknown | null>
] {
  const [permissions, setPermissions] = useState<MediaPermissions>({
    camera: false,
    microphone: false,
  });

  const checkPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setPermissions({ camera: true, microphone: true });
      stream.getTracks().forEach((track) => track.stop());
      return null;
    } catch (err) {
      console.error("Error checking permissions:", err);
      setPermissions({ camera: false, microphone: false });
      return err;
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  return [permissions, checkPermissions];
}
