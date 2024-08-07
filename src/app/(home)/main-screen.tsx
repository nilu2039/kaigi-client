import { Button } from "@/components/ui/button";
import Navbar from "@/components/ui/navbar";
import { usePlayer } from "@/context/player";
import { useSocket } from "@/context/socket";
import { SOCKET_EVENTS } from "@/lib/constants";
import { LogOut, StepForward } from "lucide-react";
import Image from "next/image";
import { FC, useState } from "react";
import { useMediaQuery } from "react-responsive";
import Chat from "./chat";
import PlayerView from "./player-view";

type MainScreenProps = {
  mediaStream: MediaStream | null;
  stopTracks: (stream: MediaStream) => void;
  myPeerId: string | null;
  toggleMediaStream: (data: boolean) => void;
};

const MainScreen: FC<MainScreenProps> = ({
  mediaStream,
  stopTracks,
  myPeerId,
  toggleMediaStream,
}) => {
  const [showInitScreen, setShowInitScreen] = useState(true);

  const socket = useSocket();
  const isMobileView = useMediaQuery({ query: "(max-width: 600px)" });

  const { player, roomId, waitingForMatch, setWaitingForMatch, setChats } =
    usePlayer();

  const handleNextMatch = () => {
    if (!socket || !myPeerId || !roomId) return;
    setWaitingForMatch(true);
    setChats([]);
    socket.emit(SOCKET_EVENTS.USER_LEAVE_ROOM, roomId, myPeerId);
    socket.emit(SOCKET_EVENTS.NEXT_MATCH);
  };

  const handleLeaveRoom = async () => {
    if (socket && mediaStream && !roomId) {
      window.location.reload();
      return;
    }
    if (!socket || !roomId || !mediaStream) return;
    socket.emit(SOCKET_EVENTS.USER_LEAVE_ROOM, roomId, myPeerId);
    stopTracks(mediaStream);
    setShowInitScreen(true);
    window.location.reload();
  };

  const handleScreen = () => {
    if (showInitScreen) {
      return (
        <>
          <Navbar />
          <div className="flex flex-1 h-full flex-col md:flex-row w-full">
            <div className="bg-introLeft flex items-center justify-center flex-[0.75] md:flex-[0.6] h-full flex-col">
              <h2 className="text-white text-center font-bold text-5xl md:text-4xl lg:text-6xl">
                Talk to Strangers!
              </h2>
              <Image
                alt="world-svg"
                src={require("@/assets/svg/connected_world.svg")}
                className="w-2/3 pt-10"
              />
            </div>
            <div className="bg-introRight flex-[0.25] md:flex-[0.4] flex items-center justify-center flex-col gap-16">
              <Image
                alt="realtime-svg"
                src={require("@/assets/svg/realtime_collaboration.svg")}
                className="w-9/12 p-2 hidden md:block"
              />
              <Button
                className="w-2/5 rounded-full bg-primaryBtn py-6 text-lg"
                onClick={() => {
                  if (!socket) return;
                  toggleMediaStream(true);
                  setWaitingForMatch(true);
                  setShowInitScreen(false);
                  socket.emit(SOCKET_EVENTS.FIND_MATCH);
                }}
              >
                Start Video
              </Button>
            </div>
          </div>
        </>
      );
    }

    return (
      <div
        className={"flex flex-1 w-full h-full p-4 bg-newPrimary"}
        style={{
          flexDirection: isMobileView ? "column" : "row",
          gap: isMobileView ? "0" : "0.5rem",
        }}
      >
        <PlayerView
          player={player}
          waitingForMatch={waitingForMatch}
          isMobileView={isMobileView}
        />
        <div className="flex h-full w-full items-center justify-between flex-col overflow-hidden gap-2 relative">
          <Chat myPeerId={myPeerId} />
          <div className="md:clear-right">
            <Button
              disabled={waitingForMatch}
              className="absolute bottom-[4.5rem] md:bottom-0 right-[0.2rem] md:relative bg-inherit grid md:hidden place-content-center hover:bg-inherit"
              onClick={handleNextMatch}
            >
              <StepForward
                className="rounded-full bg-primaryBtn text-white p-2"
                size={35}
              />
            </Button>
            <Button
              onClick={handleLeaveRoom}
              className="absolute bottom-[7.5rem] right-[0.2rem] md:relative bg-inherit block md:hidden hover:bg-inherit"
            >
              <LogOut
                size={35}
                className="rounded-full bg-red-500 text-white p-2"
              />
            </Button>
            <div className="w-full flex flex-row gap-7">
              <Button
                variant="destructive"
                className="rounded-2xl md:rounded-lg hidden md:flex flex-row items-center justify-center gap-1"
                onClick={handleLeaveRoom}
              >
                <LogOut size={20} />
                <p>Leave</p>
              </Button>
              <Button
                className="rounded-2xl md:rounded-lg hidden md:flex flex-row items-center justify-center bg-primaryBtn gap-1"
                onClick={handleNextMatch}
                disabled={waitingForMatch}
              >
                <p>Next Match</p>
                <StepForward size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="w-screen h-dvh flex items-center justify-center overflow-x-hidden flex-col">
      {handleScreen()}
    </div>
  );
};

export default MainScreen;
