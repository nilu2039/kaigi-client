import Image from "next/image";
import React from "react";

const LoadingScreen = () => {
  return (
    <div className="w-screen h-screen flex items-center justify-center p-4 overflow-hidden bg-newPrimary">
      <div className="flex flex-col items-center gap-10">
        <Image
          alt="world-svg"
          src={require("@/assets/svg/realtime_collaboration.svg")}
          className="w-[60%] p-2 animate-spin"
        />
        <p className="text-3xl md:text-4xl font-semibold text-white">
          Loading please wait...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
