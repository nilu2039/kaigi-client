import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { FC } from "react";

type RequestPermissionProps = {
  handlePermission: () => void;
};

const RequestPermission: FC<RequestPermissionProps> = ({
  handlePermission,
}) => {
  return (
    <div className="w-screen h-screen flex items-center justify-center p-4 overflow-hidden bg-newPrimary">
      <div className="flex flex-col items-center gap-10">
        <Image
          alt="world-svg"
          src={require("@/assets/svg/notify.svg")}
          className="w-[60%] p-2"
        />
        <h1 className="font-bold text-white text-4xl text-center md:text-5xl">
          Permissions required
        </h1>
        <Button
          onClick={handlePermission}
          className="bg-primaryBtn rounded-full"
        >
          Allow permissions
        </Button>
      </div>
    </div>
  );
};

export default RequestPermission;
