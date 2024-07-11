import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";

const PermissionDenied = () => {
  return (
    <div className="w-screen h-screen flex items-center justify-center p-4 overflow-hidden flex-col gap-10 bg-newPrimary">
      <Image
        alt="world-svg"
        src={require("@/assets/svg/notify.svg")}
        className="w-[60%] md:w-[30%] p-2"
      />
      <p className="font-semibold text-center text-white text-lg md:text-3xl">
        Permission to use camera and microphone was denied. To use this feature,
        you need to allow access in your browser settings.
      </p>

      <Button
        onClick={() => window.location.reload()}
        className="rounded-full bg-primaryBtn"
      >
        Try Again
      </Button>
    </div>
  );
};

export default PermissionDenied;
