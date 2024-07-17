import Image from "next/image";
import React from "react";
import { HashLoader } from "react-spinners";

const LoadingScreen = () => {
  return (
    <div className="w-screen h-screen flex items-center justify-center p-4 overflow-hidden bg-newPrimary">
      <div className="flex flex-col items-center gap-10">
        <HashLoader size={150} color="#f0f0f0" />
        <p className="text-3xl md:text-4xl font-semibold text-white">
          Loading please wait...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
