"use client";

import { Chat } from "@/types/chat";
import { PlayerProps } from "@/types/player";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

type PlayerContextType = {
  player: PlayerProps | null;
  setPlayer: Dispatch<SetStateAction<PlayerProps | null>>;
  chats: Chat[];
  setChats: Dispatch<SetStateAction<Chat[]>>;
  roomId: string | null;
  setRoomId: Dispatch<SetStateAction<string | null>>;
  waitingForMatch: boolean;
  setWaitingForMatch: Dispatch<SetStateAction<boolean>>;
};

const PlayerContext = createContext<PlayerContextType | null>(null);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [player, setPlayer] = useState<PlayerProps | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [waitingForMatch, setWaitingForMatch] = useState(false);
  return (
    <PlayerContext.Provider
      value={{
        player,
        setPlayer,
        chats,
        setChats,
        roomId,
        setRoomId,
        waitingForMatch,
        setWaitingForMatch,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
