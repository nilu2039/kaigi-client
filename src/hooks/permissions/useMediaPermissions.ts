import { useEffect, useState } from "react";

type MediaPermissions = {
  camera: boolean;
  microphone: boolean;
};

export function useMediaPermissions(): {
  mediaPermission: MediaPermissions;
  checkPermissions: () => Promise<unknown | null>;
  isLoading: boolean;
} {
  const [permissions, setPermissions] = useState<MediaPermissions>({
    camera: false,
    microphone: false,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setPermissions({ camera: true, microphone: true });
      stream.getTracks().forEach((track) => track.stop());
      localStorage.setItem("mediaPermission", "true");
      return null;
    } catch (err) {
      console.error("Error checking permissions:", err);
      setPermissions({ camera: false, microphone: false });
      return err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  return { mediaPermission: permissions, checkPermissions, isLoading };
}
