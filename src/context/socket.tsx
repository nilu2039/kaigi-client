"use client";

import React, { ReactNode, useContext, useEffect } from "react";
import { Socket, io } from "socket.io-client";

const SocketContext = React.createContext<Socket | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  return context;
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = React.useState<Socket | null>(null);

  useEffect(() => {
    console.log("Connecting to socket server");
    const connection = io(process.env.NEXT_PUBLIC_SOCKET_URL!);
    setSocket(connection);
    return () => {
      connection.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
