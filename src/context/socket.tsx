"use client";

import { SOCKET_URL } from "@/lib/constants";
import React, { ReactNode, useContext, useEffect } from "react";
import { Socket, io } from "socket.io-client";

const SocketContext = React.createContext<Socket | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = React.useState<Socket | null>(null);

  useEffect(() => {
    console.log("Connecting to socket server");
    const connection = io(SOCKET_URL);
    setSocket(connection);
    return () => {
      connection.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
