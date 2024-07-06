"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  // const [roomId, setRoomId] = useState("");

  // const createAndJoin = () => {
  //   const roomId = nanoid(6);
  //   router.push(`/room/${roomId}`);
  // };

  // const joinRoom = () => {
  //   if (!roomId) return;
  //   router.push(`/room/${roomId}`);
  // };

  const findRoom = () => {
    router.push("/room");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="w-2/3 flex items-center justify-center flex-col gap-6 ">
        {/* <div className="flex flex-col gap-4 items-center justify-center">
          <h1 className="text-2xl font-semibold">DaiLogo</h1>
          <Input
            placeholder="Enter room no."
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <Button onClick={joinRoom}>Join Room</Button>
        </div> */}
        <div className="flex flex-col gap-4">
          {/* <span className="">--------------- OR ---------------</span> */}
          <Button onClick={findRoom}>Create a new room</Button>
        </div>
      </div>
    </div>
  );
}
