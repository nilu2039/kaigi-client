import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const sleep = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// type PermissionErrorMessages = "Permission denied by user" | "No suitable camera and/or microphone found" | "Error accessing media devices:" | "Unknown error:";

export const handlePermissionError = (error: unknown) => {
  if (error instanceof DOMException) {
    switch (error.name) {
      case "NotAllowedError":
        return "permission_denied_by_user";
      case "NotFoundError":
        return "no_suitable_camera_and_or_microphone_found";
      default:
        return "error_accessing_media_devices";
    }
  } else {
    return "unknown_error";
  }
};
